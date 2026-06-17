<template>
  <div style="padding: 20px">
    <h2>购物车</h2>

    <!-- 购物车表格 -->
    <el-table :data="cartList" style="margin-top: 20px" v-if="cartList.length > 0">
      <el-table-column prop="food.name" label="菜品名称" />
      <el-table-column label="单价">
        <template #default="{ row }">
          ¥{{ row.food?.price }}
        </template>
      </el-table-column>
      <el-table-column label="数量">
        <template #default="{ row }">
          <el-input-number v-model="row.quantity" :min="1" size="small" @change="updateQuantity(row)" />
        </template>
      </el-table-column>
      <el-table-column label="小计">
        <template #default="{ row }">
          ¥{{ ((row.food?.price || 0) * row.quantity).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="removeItem(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空购物车提示 -->
    <div v-else style="text-align: center; margin-top: 50px">
      购物车是空的
    </div>

    <!-- 结算区域 -->
    <div v-if="cartList.length > 0" style="margin-top: 20px">
      <span>总计：¥{{ total.toFixed(2) }}</span>
      <el-button type="primary" style="margin-left: 20px" @click="createOrder">去结算</el-button>
      <el-button @click="goBack">继续购物</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const router = useRouter()
const cartList = ref([])

const total = computed(() => {
  if (!Array.isArray(cartList.value) || cartList.value.length === 0) return 0
  return cartList.value.reduce((sum, item) => sum + (item.food?.price || 0) * item.quantity, 0)
})

const loadCart = async () => {
  try {
    const response = await api.get('/cart')
    const data = response.data?.data
    cartList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载购物车失败:', error)
    cartList.value = []
  }
}

const updateQuantity = async (item) => {
  try {
    await api.put(`/cart/${item.id}`, { quantity: item.quantity })
    ElMessage.success('更新成功')
    await loadCart()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const removeItem = async (item) => {
  try {
    await api.delete(`/cart/${item.id}`)
    ElMessage.success('删除成功')
    await loadCart()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const createOrder = async () => {
  const address = prompt('请输入配送地址')
  if (!address) return

  try {
    const response = await api.post('/orders', { address })

    if (response.data?.code === 200) {
      ElMessage.success('下单成功')
      cartList.value = []
      setTimeout(() => {
        router.push('/orders')
      }, 1000)
    } else {
      ElMessage.error(response.data?.message || '下单失败')
    }
  } catch (error) {
    console.error('下单错误:', error)
    ElMessage.error('下单失败，请重试')
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadCart()
})
</script>