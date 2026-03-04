<template>
  <div class="login-wrap">
    <div class="login-box">
      <h2 class="login-title">登录</h2>
      <a-form layout="vertical" :model="form" @submit.prevent="handleSubmit">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" size="large" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" size="large" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading"> 登录 </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { message } from "ant-design-vue"
import { useUserStore } from "@/store/modules/user"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({ username: "admin", password: "123456" })
const loading = ref(false)

async function handleSubmit() {
  if (!form.username.trim()) {
    message.warning("请输入用户名")
    return
  }
  if (!form.password) {
    message.warning("请输入密码")
    return
  }
  try {
    loading.value = true
    await userStore.login(form)
    message.success("登录成功")
    const redirect = (route.query.redirect as string) || "/workbench"
    await router.replace(redirect)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "登录失败"
    message.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a2a4a 0%, #2c5282 100%);
}
.login-box {
  width: 360px;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.login-title {
  margin-bottom: 24px;
  text-align: center;
  font-size: 22px;
  color: #1a1a2e;
}
</style>
