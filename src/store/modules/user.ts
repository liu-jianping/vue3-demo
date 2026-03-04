import { defineStore } from 'pinia';
import { getToken, setToken as setAuthToken, getUserInfo as getAuthUserInfo, setUserInfo as setAuthUserInfo } from '@/utils/auth';
import type { UserInfoCache } from '@/utils/auth';
import { loginApi } from '@/api/sys/user';
import type { LoginParams } from '@/api/sys/user';

interface UserState {
  token?: string;
  userInfo: UserInfoCache | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() ?? undefined,
    userInfo: getAuthUserInfo(),
  }),
  getters: {
    getToken(): string | undefined {
      return this.token ?? getToken() ?? undefined;
    },
    /** 用户姓名（登录后显示在右上角） */
    getRealname(): string {
      return this.userInfo?.realname ?? getAuthUserInfo()?.realname ?? '用户';
    },
  },
  actions: {
    setToken(token: string | undefined) {
      this.token = token;
      setAuthToken(token);
    },
    setUserInfo(info: UserInfoCache | null) {
      this.userInfo = info;
      setAuthUserInfo(info ?? undefined);
    },
    /** 登录：调用接口并写入 token、userInfo，不负责跳转 */
    async login(params: LoginParams) {
      const data = await loginApi(params);
      this.setToken(data.token);
      this.setUserInfo(data.userInfo ?? null);
      return data;
    },
    /** 退出：清除 token 与 userInfo */
    logout() {
      this.token = undefined;
      this.userInfo = null;
      setAuthToken(undefined);
      setAuthUserInfo(undefined);
    },
  },
});
