import { TOKEN_KEY, USER_INFO_KEY } from '@/enums/cacheEnum';

/** 当前用户信息（姓名等） */
export interface UserInfoCache {
  username?: string;
  realname?: string;
}

/**
 * 获取 token
 */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 token（登录成功后调用）
 */
export function setToken(token: string | undefined) {
  if (token == null) {
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 获取当前用户信息（姓名等）
 */
export function getUserInfo(): UserInfoCache | null {
  try {
    const raw = sessionStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 设置当前用户信息（登录成功后写入）
 */
export function setUserInfo(info: UserInfoCache | undefined) {
  if (info == null) {
    sessionStorage.removeItem(USER_INFO_KEY);
  } else {
    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  }
}

/**
 * 清除认证相关缓存
 */
export function clearAuthCache() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
}
