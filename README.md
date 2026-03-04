# 工作区模板（后端管理系统）

基于 Vue 3 + Vite + TypeScript + Ant Design Vue 的后台管理模板，参考 limsUI 实现登录、退出、登录超时跳转、工作台与系统管理菜单。

## 功能

- **登录 / 退出**：登录页、退出登录
- **登录超时**：接口返回 401 时自动清除 token 并跳转登录页
- **默认首页**：登录成功后进入工作台（`/workbench`）
- **菜单**：工作台、系统管理（菜单管理、用户管理、角色管理）

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia
- Axios（token、GET 时间戳防缓存）
- Ant Design Vue 4
- Vite 5
- TypeScript
- dayjs（日期格式化）
- nprogress（路由切换进度条）
- @vueuse/core（常用组合式 API）

## 目录结构

```
工作区-模板/
├── public/
├── src/
│   ├── api/sys/          # 登录、用户、角色、菜单接口
│   ├── config/menu.ts    # 菜单配置（侧栏由菜单管理维护）
│   ├── enums/            # 常量（页面路径、缓存 key）
│   ├── hooks/            # 预封装 hooks（参考 limsUI）
│   │   ├── web/useMessage.ts   # 消息/确认框
│   │   └── web/usePage.ts      # 页面跳转 useGo
│   ├── layouts/default/  # 默认布局（侧栏 + 顶栏 + 内容区）
│   ├── router/           # 路由与权限守卫（含 nprogress）
│   ├── store/modules/    # 用户、菜单 store
│   ├── utils/            # 工具（参考 limsUI）
│   │   ├── is.ts         # 类型判断 isString、isObject、isEmpty 等
│   │   ├── dateUtil.ts   # 日期格式化 formatToDate、formatToDateTime
│   │   ├── treeHelper.ts # 树 listToTree、treeToList
│   │   ├── file/download.ts # 文件下载 downloadByData、downloadByUrl
│   │   ├── auth/         # token、用户信息读写
│   │   └── http/         # axios 封装
│   ├── views/            # 登录、工作台、系统管理（菜单/用户/角色）
│   ├── App.vue
│   └── main.ts
├── .env.development      # VITE_API_URL（接口 baseURL）
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 预封装能力（方便后期使用）

| 能力 | 说明 |
|------|------|
| `utils/is` | isString、isObject、isArray、isEmpty、isNullOrUnDef 等 |
| `utils/dateUtil` | formatToDate、formatToDateTime，基于 dayjs |
| `utils/treeHelper` | listToTree（平铺转树）、treeToList（树转平铺），可配 id/pid/children 字段名 |
| `utils/file/download` | downloadByData（Blob 下载）、downloadByUrl（链接下载） |
| `hooks/useMessage` | createMessage、notification、createConfirm（确认框） |
| `hooks/useGo` | 页面跳转，用法：`const go = useGo(); go('/path');` 或 `go('/path', true)` 替换 |
| @vueuse/core | useClipboard、useStorage、useDebounceFn 等，按需从 '@vueuse/core' 引入 |
| nprogress | 路由切换时顶部进度条，已在 router 守卫中集成 |

## 脚本

- `pnpm run dev` / `build` / `preview`
- `pnpm run clean:cache`：清理 Vite 缓存（`node_modules/.cache`、`.vite`）

## 使用

```bash
pnpm install
pnpm run dev
```

- 开发环境且未配置 `VITE_API_URL` 时，登录接口使用 Mock，任意用户名/密码可进入系统。
- 配置 `.env.development` 中 `VITE_API_URL` 后，登录请求会发往该地址，需后端提供 `POST /sys/login`，返回格式：`{ code: 200, result: { token: '...' } }`。

开发服务默认端口：`3100`（可在 `vite.config.ts` 修改）。

## 路由与权限

- `/login`：登录页（未登录可访问；已登录访问会重定向到工作台）
- `/`：重定向到 `/workbench`
- `/workbench`：工作台（需登录）
- `/system/menu`、`/system/user`、`/system/role`：系统管理子页（需登录）
- 未登录访问上述需登录页面时，会跳转到 `/login?redirect=当前路径`，登录成功后跳回 `redirect`，否则进入工作台。
