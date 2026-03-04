/** 菜单项 */
export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}

/** 静态菜单：工作台 + 系统管理（菜单管理、用户管理、角色管理） */
export const menuList: MenuItem[] = [
  {
    path: '/workbench',
    title: '工作台',
  },
  {
    path: '/system',
    title: '系统管理',
    children: [
      { path: '/system/menu', title: '菜单管理' },
      { path: '/system/user', title: '用户管理' },
      { path: '/system/role', title: '角色管理' },
    ],
  },
];
