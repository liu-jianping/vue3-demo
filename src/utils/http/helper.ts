/**
 * 为 GET 请求添加时间戳参数，避免使用缓存
 * @param join 是否添加
 * @param restful 是否 restful 风格（拼接到 url）
 */
export function joinTimestamp(join: boolean, restful = false): Record<string, number> | string {
  if (!join) {
    return restful ? '' : {};
  }
  const now = Date.now();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/**
 * 生成以时间戳为基准的随机数（用于 GET 请求头，防缓存/防重放）
 */
export function getTimestampRandom(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
