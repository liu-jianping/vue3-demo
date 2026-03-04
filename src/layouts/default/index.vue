<template>
  <a-layout class="default-layout">
    <a-layout-sider v-model:collapsed="collapsed" :width="220" theme="light" class="layout-sider">
      <div class="logo">后台管理</div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        :inline-collapsed="collapsed"
        class="layout-menu"
        @click="onMenuClick"
      >
        <template v-for="item in menuList" :key="item.path">
          <a-sub-menu v-if="item.children?.length" :key="item.path">
            <template #title>{{ item.title }}</template>
            <a-menu-item v-for="child in item.children" :key="child.path">
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="item.path">
            {{ item.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <span class="header-title">工作区模板</span>
        <div class="header-right">
          <a-dropdown>
            <span class="user-trigger">
              <UserOutlined />
              <span class="ml-1">{{ userStore.getRealname }}</span>
            </span>
            <template #overlay>
              <a-menu @click="handleUserMenu">
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Modal } from 'ant-design-vue';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { useMenuStore } from '@/store/modules/menu';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const menuStore = useMenuStore();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

const menuList = computed(() => menuStore.menuTree);

function onMenuClick({ key }: { key: string }) {
  router.push(key);
}

function handleUserMenu({ key }: { key: string }) {
  if (key === 'logout') {
    Modal.confirm({
      title: '提示',
      content: '确定退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        userStore.logout();
        router.push({ path: '/login', query: { redirect: route.fullPath } });
      },
    });
  }
}

function findParentPath(
  path: string,
  items: { path: string; children?: { path: string }[] }[]
): string | undefined {
  for (const m of items) {
    if (m.children?.some((c) => c.path === path)) return m.path;
  }
  return undefined;
}

menuStore.fetchMenuTree();

watch(
  () => route.path,
  (path: string) => {
    selectedKeys.value = [path];
    const parentPath = findParentPath(path, menuList.value);
    if (parentPath) openKeys.value = [parentPath];
  },
  { immediate: true }
);
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
}
.layout-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}
.layout-sider .logo {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-weight: 600;
  color: #1a1a2e;
  border-bottom: 1px solid #f0f0f0;
}
.layout-menu {
  border-right: none;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-trigger {
  cursor: pointer;
  padding: 0 8px;
}
.ml-1 {
  margin-left: 6px;
}
.layout-content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  border-radius: 4px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
