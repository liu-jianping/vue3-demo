import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { HEADER_AUTH, HEADER_TIMESTAMP_RANDOM, HEADER_TOKEN } from './config';
import { getTimestampRandom } from '../helper';
import { joinTimestamp } from '../helper';
import type { RequestOptions, Result } from '@/types/axios';

const defaultOptions: RequestOptions = {
  withToken: true,
  joinTime: true,
  isTransformResponse: true,
};

function mergeOptions(options?: RequestOptions): RequestOptions {
  return { ...defaultOptions, ...options };
}

/**
 * 请求前：为 GET 添加时间戳参数；在拦截器中统一加 token 和 GET 的随机数请求头
 */
function beforeRequestHook(config: AxiosRequestConfig, options: RequestOptions): AxiosRequestConfig {
  const { joinTime } = options;
  const method = (config.method || 'get').toUpperCase();

  if (method === 'GET' && joinTime) {
    const params = config.params || {};
    config.params = { ...params, ...joinTimestamp(true, false) };
  }
  return config;
}

/**
 * 创建 axios 实例并配置拦截器
 */
function createAxios(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 10 * 1000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config: AxiosRequestConfig & { requestOptions?: RequestOptions }) => {
    const options = config.requestOptions ?? defaultOptions;
    const { withToken } = options;

    // 除登录等接口外，请求头附带 token
    if (withToken !== false) {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers[HEADER_TOKEN] = token;
        config.headers[HEADER_AUTH] = token;
      }
    }

    // GET 请求头附带以时间戳为基准的随机数（防缓存）
    if ((config.method || 'get').toUpperCase() === 'GET') {
      config.headers = config.headers || {};
      config.headers[HEADER_TIMESTAMP_RANDOM] = getTimestampRandom();
    }

    return config;
  });

  instance.interceptors.response.use(
    (res: AxiosResponse<Result>) => res,
    async (err) => {
      const status = err.response?.status;
      if (status === 401) {
        const router = (await import('@/router')).default;
        const { useUserStore } = await import('@/store/modules/user');
        useUserStore().logout();
        const redirect = router.currentRoute.value?.fullPath || '/';
        router.push({ path: '/login', query: { redirect } }).catch(() => {});
      }
      return Promise.reject(err);
    }
  );

  return instance;
}

const axiosInstance = createAxios();

/**
 * 统一请求方法：合并 requestOptions，响应时按 isTransformResponse 返回 result 或完整 data
 */
async function request<T = unknown>(
  config: AxiosRequestConfig & { requestOptions?: RequestOptions }
): Promise<T> {
  const options = mergeOptions(config.requestOptions);
  config.requestOptions = options;
  config = beforeRequestHook(config, options);

  const res = await axiosInstance.request<Result<T>>(config);
  const data = res.data;

  if (options.isTransformResponse !== false && data && typeof data === 'object' && 'result' in data) {
    const code = (data as Result<T>).code;
    if (code === 200 || code === 0) {
      return (data as Result<T>).result as T;
    }
    return Promise.reject(new Error((data as Result<T>).message || '请求失败'));
  }
  return data as T;
}

/** 对外封装的 HTTP：GET / POST 示例，除登录外均带 token，GET 带时间戳参数与随机数请求头 */
export const defHttp = {
  get<T = unknown>(
    config: AxiosRequestConfig & { requestOptions?: RequestOptions }
  ): Promise<T> {
    return request<T>({ ...config, method: 'GET' });
  },
  post<T = unknown>(
    config: AxiosRequestConfig & { requestOptions?: RequestOptions }
  ): Promise<T> {
    return request<T>({ ...config, method: 'POST' });
  },
};

export { axiosInstance };
