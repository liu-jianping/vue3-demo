import type { RoleRecord } from '@/types/role';
import { ROLE_LIST_KEY, ROLE_MENU_KEY } from '@/enums/cacheEnum';
import { getMenuTreeList } from './menu';

/** 授权树节点（key、title 供 a-tree 使用） */
export interface RoleMenuTreeNode {
  key: string;
  title: string;
  children?: RoleMenuTreeNode[];
}

function loadList(): RoleRecord[] {
  try {
    const raw = localStorage.getItem(ROLE_LIST_KEY);
    if (raw) {
      const list = JSON.parse(raw) as RoleRecord[];
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (_) {}
  return getDefaultList();
}

function getDefaultList(): RoleRecord[] {
  return [
    { id: '1', roleName: '管理员', roleCode: 'admin', description: '系统管理员' },
    { id: '2', roleName: '普通用户', roleCode: 'user', description: '普通用户' },
  ];
}

function saveList(list: RoleRecord[]) {
  localStorage.setItem(ROLE_LIST_KEY, JSON.stringify(list));
}

/** 分页列表（Mock：前端过滤） */
export function getRoleList(params?: { roleName?: string; roleCode?: string; pageNo?: number; pageSize?: number }) {
  let list = loadList();
  if (params?.roleName) {
    list = list.filter((r) => r.roleName.includes(params.roleName!));
  }
  if (params?.roleCode) {
    list = list.filter((r) => r.roleCode.includes(params.roleCode!));
  }
  const pageNo = params?.pageNo ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const total = list.length;
  const start = (pageNo - 1) * pageSize;
  const records = list.slice(start, start + pageSize);
  return Promise.resolve({ records, total });
}

/** 全部角色（下拉用） */
export function getAllRoles(): RoleRecord[] {
  return loadList();
}

/** 新增角色 */
export function addRole(record: Omit<RoleRecord, 'id'>): RoleRecord {
  const list = loadList();
  if (list.some((r) => r.roleCode === record.roleCode)) {
    throw new Error('角色编码已存在');
  }
  const id = String(Date.now());
  const newRecord: RoleRecord = { ...record, id };
  list.push(newRecord);
  saveList(list);
  return newRecord;
}

/** 更新角色 */
export function updateRole(id: string, record: Partial<RoleRecord>): void {
  const list = loadList();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return;
  if (record.roleCode != null && list.some((r) => r.id !== id && r.roleCode === record.roleCode)) {
    throw new Error('角色编码已存在');
  }
  list[idx] = { ...list[idx], ...record, id };
  saveList(list);
}

/** 删除角色 */
export function deleteRole(id: string): void {
  const list = loadList().filter((r) => r.id !== id);
  saveList(list);
}

/** 批量删除 */
export function batchDeleteRole(ids: string[]): void {
  const set = new Set(ids);
  const list = loadList().filter((r) => !set.has(r.id));
  saveList(list);
}

// ---------- 角色菜单授权（Mock） ----------
function loadRoleMenuMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(ROLE_MENU_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}
function saveRoleMenuMap(map: Record<string, string[]>) {
  localStorage.setItem(ROLE_MENU_KEY, JSON.stringify(map));
}

/** 获取菜单树（授权用，含 key/title） */
export function getMenuTreeForRole(): RoleMenuTreeNode[] {
  const rows = getMenuTreeList();
  function mapRow(row: { id: string; title: string; children?: unknown[] }): RoleMenuTreeNode {
    const node: RoleMenuTreeNode = { key: row.id, title: row.title };
    if (row.children?.length) {
      node.children = (row.children as typeof rows).map(mapRow);
    }
    return node;
  }
  return rows.map(mapRow);
}

/** 查询角色已授权的菜单 id 列表 */
export function getRolePermission(roleId: string): string[] {
  const map = loadRoleMenuMap();
  return map[roleId] ?? [];
}

/** 保存角色菜单授权 */
export function saveRolePermission(roleId: string, menuIds: string[]): void {
  const map = loadRoleMenuMap();
  map[roleId] = menuIds;
  saveRoleMenuMap(map);
}
