import { defineStore } from 'pinia';
import type { MenuTreeNode } from '@/types/menu';
import { getMenuTree } from '@/api/sys/menu';

interface MenuState {
  menuTree: MenuTreeNode[];
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    menuTree: [],
  }),
  actions: {
    /** 拉取菜单树（侧栏用），从 Mock 读并刷 state */
    fetchMenuTree() {
      this.menuTree = getMenuTree();
    },
  },
});
