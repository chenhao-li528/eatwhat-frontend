<template>
  <div style="padding: 40px; max-width: 400px; margin: 0 auto">
    <h2>登录</h2>
    <el-input
        v-model="username"
        placeholder="用户名"
        style="margin: 10px 0"
    />
    <el-input
        v-model="password"
        type="password"
        placeholder="密码"
        style="margin: 10px 0"
    />
    <el-button
        type="primary"
        @click="handleLogin"
        style="width: 100%"
        :loading="loading"
    >
      登录
    </el-button>
    <el-button
        @click="goToRegister"
        style="width: 100%; margin-top: 10px"
    >
      去注册
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请填写用户名和密码')
    return
  }

  console.log('准备发送登录请求')
  console.log('请求地址:', api.defaults.baseURL + '/login')
  console.log('请求参数:', { username: username.value, password: password.value })

  loading.value = true

  try {
    const response = await api.post('/login', {
      username: username.value,
      password: password.value
    })

    console.log('完整响应:', response)
    console.log('响应数据:', response.data)

    const result = response.data

    if (result.code === 200) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('userInfo', JSON.stringify(result.user))
      userStore.token = result.token
      userStore.userInfo = result.user
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误详情:', error)
    console.error('错误响应:', error.response)
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('响应数据:', error.response.data)
      ElMessage.error(`登录失败: ${error.response.status}`)
    } else if (error.request) {
      ElMessage.error('网络错误，请检查后端是否启动')
    } else {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>