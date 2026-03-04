import type { MenuRecord, MenuTreeNode, MenuTreeRow } from '@/types/menu';
import { MENU_LIST_KEY } from '@/enums/cacheEnum';

function loadList(): MenuRecord[] {
  try {
    const raw = localStorage.getItem(MENU_LIST_KEY);
    if (raw) {
      const list = JSON.parse(raw) as MenuRecord[];
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (_) {}
  return getDefaultList();
}

function getDefaultList(): MenuRecord[] {
  return [
    { id: '1', parentId: null, title: '工作台', path: '/workbench', sortOrder: 1, type: 'menu', visible: true },
    { id: '2', parentId: null, title: '系统管理', path: '/system', sortOrder: 2, type: 'directory', visible: true },
    { id: '3', parentId: '2', title: '菜单管理', path: '/system/menu', sortOrder: 1, type: 'menu', visible: true },
    { id: '4', parentId: '2', title: '用户管理', path: '/system/user', sortOrder: 2, type: 'menu', visible: true },
    { id: '5', parentId: '2', title: '角色管理', path: '/system/role', sortOrder: 3, type: 'menu', visible: true },
  ];
}

function saveList(list: MenuRecord[]) {
  localStorage.setItem(MENU_LIST_KEY, JSON.stringify(list));
}

/** 平铺转树（仅 visible 的，用于侧栏） */
export function listToTree(list: MenuRecord[]): MenuTreeNode[] {
  const visible = list.filter((m) => m.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  const byParent = new Map<string | null, MenuRecord[]>();
  visible.forEach((m) => {
    const pid = m.parentId;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(m);
  });
  function build(parentId: string | null): MenuTreeNode[] {
    const children = byParent.get(parentId) || [];
    return children.map((m) => {
      const node: MenuTreeNode = { path: m.path, title: m.title, icon: m.icon };
      if (m.type === 'directory') {
        node.children = build(m.id);
      }
      return node;
    });
  }
  return build(null);
}

/** 获取菜单树（侧栏用） */
export function getMenuTree(): MenuTreeNode[] {
  const list = loadList();
  return listToTree(list);
}

/** 获取菜单列表（平铺） */
export function getMenuList(): MenuRecord[] {
  return loadList();
}

/** 获取菜单树形列表（表格用） */
export function getMenuTreeList(): MenuTreeRow[] {
  const list = loadList().sort((a, b) => a.sortOrder - b.sortOrder);
  const byParent = new Map<string | null, MenuTreeRow[]>();
  list.forEach((m) => {
    const row: MenuTreeRow = { ...m };
    const pid = m.parentId;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(row);
  });
  function assignChildren(parentId: string | null): MenuTreeRow[] {
    const children = byParent.get(parentId) || [];
    children.forEach((row) => {
      row.children = assignChildren(row.id);
    });
    return children;
  }
  return assignChildren(null);
}

/** 新增菜单 */
export function addMenu(record: Omit<MenuRecord, 'id'>): MenuRecord {
  const list = loadList();
  const id = String(Date.now());
  const newRecord: MenuRecord = { ...record, id };
  list.push(newRecord);
  saveList(list);
  return newRecord;
}

/** 更新菜单 */
export function updateMenu(id: string, record: Partial<MenuRecord>): void {
  const list = loadList();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...record, id };
  saveList(list);
}

/** 删除菜单（有子节点时禁止删除） */
export function deleteMenu(id: string): { ok: boolean; message?: string } {
  const list = loadList();
  const hasChild = list.some((m) => m.parentId === id);
  if (hasChild) return { ok: false, message: '存在子菜单，无法删除' };
  const next = list.filter((m) => m.id !== id);
  saveList(next);
  return { ok: true };
}
