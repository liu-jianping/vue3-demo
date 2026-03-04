export interface RequestOptions {
  /** 是否携带 token，登录接口传 false */
  withToken?: boolean;
  /** GET 请求是否添加时间戳参数，默认 true */
  joinTime?: boolean;
  /** 是否对响应做统一解包（取 result），默认 true */
  isTransformResponse?: boolean;
}

export interface Result<T = unknown> {
  code: number;
  success?: boolean;
  message: string;
  result: T;
}

