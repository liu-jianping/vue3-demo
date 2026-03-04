import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { BASE_LOGIN, BASE_HOME } from '@/enums/pageEnum';
import { TOKEN_KEY } from '@/enums/cacheEnum';

nProgress.configure({ showSpinner: false });

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/sys/login/index.vue'),
    meta: { title: '登录', ignoreAuth: true },
  },
  {
    path: '/',
    name: 'Root',
    redirect: BASE_HOME,
    meta: { title: 'Root' },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/default/index.vue'),
    meta: { title: 'Layout' },
    children: [
      {
        path: 'workbench',
        name: 'Workbench',
        component: () => import('@/views/dashboard/workbench/index.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理' },
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/** 路由守卫：未登录跳转登录页，已登录访问登录页则跳转工作台；路由切换时显示进度条 */
export function setupRouterGuard() {
  router.beforeEach((to, _from, next) => {
    nProgress.start();
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (to.meta.ignoreAuth) {
      if (to.path === BASE_LOGIN && token) {
        const redirect = (to.query.redirect as string) || BASE_HOME;
        next(redirect);
        return;
      }
      next();
      return;
    }

    if (!token) {
      next({ path: BASE_LOGIN, query: { redirect: to.fullPath } });
      return;
    }
    next();
  });

  router.afterEach(() => {
    nProgress.done();
  });
}

export default router;
