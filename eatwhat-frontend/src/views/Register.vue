<template>
  <div style="padding: 40px; max-width: 400px; margin: 0 auto">
    <h2>注册</h2>
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
    <el-input
        v-model="phone"
        placeholder="手机号"
        style="margin: 10px 0"
    />
    <el-button
        type="primary"
        @click="handleRegister"
        style="width: 100%"
        :loading="loading"
    >
      注册
    </el-button>
    <el-button
        @click="goToLogin"
        style="width: 100%; margin-top: 10px"
    >
      已有账号？去登录
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const phone = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (!username.value) {
    ElMessage.warning('请填写用户名')
    return
  }
  if (!password.value) {
    ElMessage.warning('请填写密码')
    return
  }
  if (password.value.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }

  loading.value = true

  try {
    const response = await api.post('/register', {
      username: username.value,
      password: password.value,
      phone: phone.value || ''
    })

    // 后端返回的数据在 response.data 里
    const result = response.data

    if (result.code === 200) {
      ElMessage.success('注册成功，请登录')
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      ElMessage.error(result.message || '注册失败，请重试')
    }
  } catch (error) {
    console.error('注册错误:', error)
    if (error.response) {
      const errorMsg = error.response.data?.message || '服务器错误，请稍后重试'
      ElMessage.error(errorMsg)
    } else if (error.request) {
      ElMessage.error('网络错误，请检查后端是否启动')
    } else {
      ElMessage.error('注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>