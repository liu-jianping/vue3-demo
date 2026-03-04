<template>
  <div class="home">
    <header class="home-header">
      <h1>工作区模板</h1>
      <p class="subtitle">基于 Vue 3 + Vite + TypeScript 的简易起步工程</p>
    </header>
    <main class="home-main">
      <section class="card">
        <h2>欢迎</h2>
        <p>这是首页 (home.vue)，项目已成功运行。</p>
        <p>你可以在 <code>src/views/</code> 下添加更多页面，并在 <code>src/router/index.ts</code> 中配置路由。</p>
      </section>
      <section class="card">
        <h2>请求示例（axios + token）</h2>
        <p>除登录接口外，请求会自动附带 token；GET 请求会附带 <code>_t</code> 参数和 <code>X-TIMESTAMP</code> 请求头（时间戳+随机数）。</p>
        <p>示例见 <code>src/api/demo.ts</code>：</p>
        <ul class="code-list">
          <li><strong>登录</strong>：<code>defHttp.post({ url, data }, { withToken: false })</code></li>
          <li><strong>GET</strong>：<code>defHttp.get({ url, params })</code></li>
          <li><strong>POST</strong>：<code>defHttp.post({ url, data })</code></li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
  .home {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  }
  .home-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }
  .home-header h1 {
    font-size: 2rem;
    color: #1a1a2e;
    font-weight: 600;
  }
  .subtitle {
    margin-top: 0.5rem;
    color: #64748b;
    font-size: 0.95rem;
  }
  .home-main {
    max-width: 560px;
    width: 100%;
  }
  .card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .card h2 {
    font-size: 1.25rem;
    color: #334155;
    margin-bottom: 0.75rem;
  }
  .card p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
  .card p:last-child {
    margin-bottom: 0;
  }
  code {
    background: #f1f5f9;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .code-list {
    margin-top: 0.5rem;
    padding-left: 1.25rem;
    color: #64748b;
    line-height: 1.8;
  }
  .code-list li {
    margin-bottom: 0.25rem;
  }
</style>
