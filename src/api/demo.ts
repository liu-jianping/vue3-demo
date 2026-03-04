import { defHttp } from '@/utils/http';

/** 示例：登录接口（不携带 token） */
export function login(params: { username: string; password: string }) {
  return defHttp.post<{ token: string }>(
    {
      url: '/api/login',
      data: params,
      requestOptions: { withToken: false },
    }
  );
}

/** 示例：GET 请求（自动带 token、_t 时间戳参数、X-TIMESTAMP 请求头） */
export function getList(params?: { pageNo?: number; pageSize?: number }) {
  return defHttp.get<{ list: unknown[]; total: number }>({
    url: '/api/list',
    params,
  });
}

/** 示例：POST 请求（自动带 token） */
export function submitData(data: Record<string, unknown>) {
  return defHttp.post<{ id: string }>({
    url: '/api/submit',
    data,
  });
}
