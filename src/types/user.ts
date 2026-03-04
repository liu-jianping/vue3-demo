/** 用户状态：1 正常 2 禁用 */
export type UserStatus = 1 | 2;

/** 用户记录 */
export interface UserRecord {
  id: string;
  username: string;
  realname: string;
  password?: string;
  phone?: string;
  roleIds: string[];
  status: UserStatus;
}
