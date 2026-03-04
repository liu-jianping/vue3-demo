import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue';
import router, { setupRouterGuard } from './router';
import { setupStore } from './store';

const app = createApp(App);
setupStore(app);
app.use(Antd);
app.use(router);
setupRouterGuard();
app.mount('#app');
