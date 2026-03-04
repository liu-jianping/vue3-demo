/** 菜单类型：目录（有子节点） / 菜单（叶子） */
export type MenuType = 'directory' | 'menu';

/** 菜单项（平铺，用于存储与表格） */
export interface MenuRecord {
  id: string;
  parentId: string | null;
  title: string;
  path: string;
  sortOrder: number;
  type: MenuType;
  visible: boolean;
  icon?: string;
}

/** 侧栏展示用树节点 */
export interface MenuTreeNode {
  path: string;
  title: string;
  icon?: string;
  children?: MenuTreeNode[];
}

/** 表格树节点（带 children） */
export interface MenuTreeRow extends MenuRecord {
  children?: MenuTreeRow[];
}
