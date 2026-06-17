<template>
  <div style="padding: 20px">
    <h2>我的订单</h2>

    <div v-if="loading" style="text-align: center; margin-top: 50px">
      加载中...
    </div>

    <div v-else-if="orderList.length === 0" style="text-align: center; margin-top: 50px">
      暂无订单，去<a href="/">逛逛</a>吧
    </div>

    <div v-else>
      <el-card v-for="order in orderList" :key="order.id" style="margin-top: 20px">
        <div><strong>订单号：</strong>{{ order.orderNo }}</div>
        <div><strong>总金额：</strong>¥{{ order.totalAmount }}</div>
        <div><strong>状态：</strong>
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>
        <div><strong>地址：</strong>{{ order.address || '未填写' }}</div>
        <div><strong>时间：</strong>{{ order.createdAt }}</div>

        <!-- 操作按钮 -->
        <div style="margin-top: 15px">
          <el-button
              v-if="order.status === 'pending'"
              type="success"
              size="small"
              @click="handlePay(order)"
          >
            去支付
          </el-button>
          <el-button
              v-if="order.status === 'pending'"
              type="danger"
              size="small"
              plain
              @click="handleCancel(order)"
          >
            取消订单
          </el-button>
          <el-button
              v-if="order.status === 'delivered'"
              type="primary"
              size="small"
              @click="handleConfirm(order)"
          >
            确认收货
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 底部按钮区域 -->
    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center">
      <el-button @click="goBack">返回首页</el-button>
      <el-button
          type="danger"
          plain
          @click="handleClearAllOrders"
          :loading="clearLoading"
          v-if="orderList.length > 0"
      >
        🗑️ 清空所有订单
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const router = useRouter()
const orderList = ref([])
const loading = ref(false)
const clearLoading = ref(false)

// 状态文本映射
const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    paid: '已支付',
    delivered: '配送中',
    cancelled: '已取消',
    completed: '已完成'
  }
  return map[status] || status
}

// 状态标签颜色
const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    paid: 'primary',
    delivered: 'info',
    cancelled: 'danger',
    completed: 'success'
  }
  return map[status] || 'info'
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const response = await api.get('/orders')
    orderList.value = response.data?.data || []
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 支付
const handlePay = async (order) => {
  ElMessageBox.confirm(`确认支付 ¥${order.totalAmount} 吗？`, '支付确认', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const response = await api.put(`/orders/${order.id}/pay`)
      if (response.data?.code === 200) {
        ElMessage.success('支付成功！')
        loadOrders()
      } else {
        ElMessage.error(response.data?.message || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      ElMessage.error('支付失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消支付')
  })
}

// 取消订单
const handleCancel = async (order) => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
    confirmButtonText: '确认取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.put(`/orders/${order.id}/cancel`)
      if (response.data?.code === 200) {
        ElMessage.success('订单已取消')
        loadOrders()
      } else {
        ElMessage.error(response.data?.message || '取消失败')
      }
    } catch (error) {
      console.error('取消失败:', error)
      ElMessage.error('取消失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 确认收货
const handleConfirm = async (order) => {
  ElMessageBox.confirm('确认已收到商品？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '再等等',
    type: 'info'
  }).then(async () => {
    try {
      const response = await api.put(`/orders/${order.id}/confirm`)
      if (response.data?.code === 200) {
        ElMessage.success('收货成功，感谢您的购买！')
        loadOrders()
      } else {
        ElMessage.error(response.data?.message || '操作失败')
      }
    } catch (error) {
      console.error('确认收货失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }).catch(() => {})
}

// 清空所有订单
const handleClearAllOrders = async () => {
  ElMessageBox.confirm('确定要清空所有订单吗？此操作不可恢复！', '清空订单', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    clearLoading.value = true
    try {
      const response = await api.delete('/orders')
      if (response.data?.code === 200) {
        ElMessage.success('已清空所有订单')
        loadOrders()
      } else {
        ElMessage.error(response.data?.message || '清空失败')
      }
    } catch (error) {
      console.error('清空订单失败:', error)
      ElMessage.error('清空失败，请重试')
    } finally {
      clearLoading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadOrders()
})
</script>