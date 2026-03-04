import type { UserRecord } from '@/types/user';
import { USER_LIST_KEY } from '@/enums/cacheEnum';
import { getAllRoles } from './role';

/** 登录参数 */
export interface LoginParams {
  username: string;
  password: string;
}

/** 登录返回 */
export interface LoginResult {
  token: string;
  userInfo?: { username?: string; realname?: string };
}

/** 登录接口（Mock：校验用户名密码，从用户列表取） */
export async function loginApi(params: LoginParams): Promise<LoginResult> {
  const baseURL = import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV && !baseURL) {
    const list = loadList();
    const user = list.find((u) => u.username === params.username && u.password === params.password);
    if (!user) return Promise.reject(new Error('用户名或密码错误'));
    if (user.status === 2) return Promise.reject(new Error('账号已禁用'));
    return {
      token: 'mock-token-' + Date.now(),
      userInfo: { username: user.username, realname: user.realname },
    };
  }
  const { defHttp } = await import('@/utils/http');
  return defHttp.post<LoginResult>({
    url: '/sys/login',
    data: params,
    requestOptions: { withToken: false },
  });
}

function loadList(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USER_LIST_KEY);
    if (raw) {
      const list = JSON.parse(raw) as UserRecord[];
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (_) {}
  return getDefaultList();
}

function getDefaultList(): UserRecord[] {
  const roles = getAllRoles();
  const adminRole = roles.find((r) => r.roleCode === 'admin');
  return [
    {
      id: '1',
      username: 'admin',
      realname: '管理员',
      password: '123456',
      phone: '13800138000',
      roleIds: adminRole ? [adminRole.id] : [],
      status: 1,
    },
  ];
}

function saveList(list: UserRecord[]) {
  localStorage.setItem(USER_LIST_KEY, JSON.stringify(list));
}

/** 分页列表（Mock） */
export function getUserList(params?: {
  username?: string;
  realname?: string;
  pageNo?: number;
  pageSize?: number;
}) {
  let list = loadList();
  if (params?.username) {
    list = list.filter((u) => u.username.includes(params.username!));
  }
  if (params?.realname) {
    list = list.filter((u) => u.realname.includes(params.realname!));
  }
  const pageNo = params?.pageNo ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const total = list.length;
  const start = (pageNo - 1) * pageSize;
  const records = list.slice(start, start + pageSize);
  return Promise.resolve({ records, total });
}

/** 新增用户 */
export function addUser(record: Omit<UserRecord, 'id'>): UserRecord {
  const list = loadList();
  if (list.some((u) => u.username === record.username)) {
    throw new Error('用户账号已存在');
  }
  const id = String(Date.now());
  const newRecord: UserRecord = { ...record, id };
  list.push(newRecord);
  saveList(list);
  return newRecord;
}

/** 更新用户（password 为空则不修改密码） */
export function updateUser(id: string, record: Partial<UserRecord>): void {
  const list = loadList();
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) return;
  if (record.username != null && list.some((u) => u.id !== id && u.username === record.username)) {
    throw new Error('用户账号已存在');
  }
  const next = { ...list[idx], ...record, id };
  if (record.password === '' || record.password == null) {
    delete next.password;
  }
  list[idx] = next;
  saveList(list);
}

/** 删除用户（admin 不允许删除） */
export function deleteUser(id: string): { ok: boolean; message?: string } {
  const list = loadList();
  const user = list.find((u) => u.id === id);
  if (user?.username === 'admin') {
    return { ok: false, message: '管理员账号不允许删除' };
  }
  saveList(list.filter((u) => u.id !== id));
  return { ok: true };
}

/** 批量删除（含 admin 校验） */
export function batchDeleteUser(ids: string[]): { ok: boolean; message?: string } {
  const list = loadList();
  const admins = list.filter((u) => u.username === 'admin' && ids.includes(u.id));
  if (admins.length > 0) {
    return { ok: false, message: '管理员账号不允许删除' };
  }
  const set = new Set(ids);
  saveList(list.filter((u) => !set.has(u.id)));
  return { ok: true };
}
