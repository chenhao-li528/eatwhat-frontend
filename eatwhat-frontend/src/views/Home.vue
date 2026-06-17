<template>
  <div class="app">
    <!-- 头部导航栏 -->
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🍔</span>
          <span class="logo-text">EatWhat</span>
        </div>
        <div class="nav-buttons">
          <div v-if="userStore.userInfo.username" class="user-welcome">
            <span class="welcome-text">欢迎，{{ userStore.userInfo.username }}</span>
            <el-button type="danger" size="small" @click="logout" plain>退出</el-button>
          </div>
          <template v-else>
            <el-button type="primary" size="small" @click="goToLogin" plain>登录</el-button>
            <el-button type="success" size="small" @click="goToRegister" plain>注册</el-button>
          </template>
          <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
            <el-button type="warning" size="small" @click="goToCart" plain>🛒 购物车</el-button>
          </el-badge>
          <el-button type="info" size="small" @click="goToOrders" plain>📦 我的订单</el-button>
        </div>
      </div>
    </div>

    <!-- 轮播图 -->
    <div class="banner">
      <el-carousel height="300px" :interval="4000" arrow="always">
        <el-carousel-item v-for="(item, index) in banners" :key="index">
          <div class="banner-item" :style="{ backgroundImage: 'url(' + item.image + ')' }">
            <div class="banner-text">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类标签 -->
    <div class="categories">
      <div
          v-for="cat in categories"
          :key="cat.name"
          class="category-item"
          :class="{ active: currentCategory === cat.value }"
          @click="selectCategory(cat.value)"
      >
        <span class="category-icon">{{ cat.icon }}</span>
        <span class="category-name">{{ cat.name }}</span>
      </div>
    </div>

    <!-- 菜品列表 -->
    <div class="food-list">
      <div class="section-title">
        <span class="title-icon">🔥</span>
        <span>今日推荐</span>
      </div>
      <div class="food-grid">
        <div v-for="food in foodList" :key="food.id" class="food-card">
          <div class="food-image">
            <img :src="getFoodImage(food)" :alt="food.name" />
            <div class="food-tag" v-if="food.category === '热菜'">热销</div>
          </div>
          <div class="food-info">
            <h3 class="food-name">{{ food.name }}</h3>
            <p class="food-desc">{{ food.description }}</p>
            <div class="food-footer">
              <span class="food-price">¥{{ food.price }}</span>
              <el-button
                  type="primary"
                  size="small"
                  circle
                  @click="addToCart(food)"
                  :disabled="!userStore.userInfo.username"
              >
                +
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">
      <p>© 2026 EatWhat 外卖 | 美食即享，快乐到家</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 数据定义
const foodList = ref([])
const currentCategory = ref('')
const cartCount = ref(0)
const defaultImage = 'https://picsum.photos/200/150?random=1'

// 本地图片映射
const localImages = {
  '宫保鸡丁': '/src/assets/images/gongbaojiding.jpg',
  '麻婆豆腐': '/src/assets/images/mapodoufu.jpg',
  '红烧肉': '/src/assets/images/hongshaorou.jpg',
  '酸菜鱼': '/src/assets/images/suancaiyu.jpg',
  '可乐': '/src/assets/images/cola.jpg',
  '雪碧': '/src/assets/images/xuebi.jpg',
  '米饭': '/src/assets/images/rice.jpg',
  '西红柿炒蛋': '/src/assets/images/xihongshijidan.jpg'
}

// 获取菜品图片
const getFoodImage = (food) => {
  // 优先使用数据库中的图片
  if (food.image && food.image !== '') return food.image
  // 使用本地图片映射
  return localImages[food.name] || defaultImage
}

// 分类数据
const categories = [
  { name: '全部', value: '', icon: '🍽️' },
  { name: '热菜', value: '热菜', icon: '🍲' },
  { name: '汤类', value: '汤类', icon: '🥣' },
  { name: '饮料', value: '饮料', icon: '🥤' },
  { name: '主食', value: '主食', icon: '🍚' }
]

// 轮播图数据
// 轮播图数据（使用本地图片）
const banners = [
  { title: '品质外卖', subtitle: '严选优质商家，品质有保障', image: '/src/assets/images/banner1.jpg' },
  { title: '限时特惠', subtitle: '全场满减，下单立减', image: '/src/assets/images/banner2.jpg' },
  { title: '新人专享', subtitle: '注册即领优惠券', image: '/src/assets/images/banner3.jpg' }
]

// 加载菜品
const loadFoods = async () => {
  try {
    const params = currentCategory.value ? { category: currentCategory.value } : {}
    const response = await api.get('/foods', { params })
    foodList.value = response.data?.data || []
  } catch (error) {
    console.error('加载菜品失败:', error)
  }
}

// 加载购物车数量
const loadCartCount = async () => {
  if (!userStore.token) return
  try {
    const response = await api.get('/cart')
    const cart = response.data?.data || []
    cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
  } catch (error) {
    console.error('加载购物车失败:', error)
  }
}

// 选择分类
const selectCategory = (value) => {
  currentCategory.value = value
  loadFoods()
}

// 加入购物车
const addToCart = async (food) => {
  if (!userStore.userInfo.username) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await api.post('/cart', { foodId: food.id, quantity: 1 })
    ElMessage.success('已加入购物车')
    await loadCartCount()
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 页面跳转
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
const goToCart = () => router.push('/cart')
const goToOrders = () => router.push('/orders')

// 退出登录
const logout = () => {
  userStore.logout()
  ElMessage.success('已退出')
  router.push('/')
}

// 监听分类变化（备用）
watch(currentCategory, () => {
  loadFoods()
})

// 页面加载
onMounted(() => {
  loadFoods()
  loadCartCount()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
  letter-spacing: 2px;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.2);
  padding: 5px 12px;
  border-radius: 20px;
}

.welcome-text {
  color: white;
  font-size: 14px;
}

.cart-badge :deep(.el-badge__content) {
  background-color: #ff6b6b;
}

/* 轮播图 */
.banner {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.banner-item {
  height: 300px;
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
}

.banner-text {
  position: relative;
  text-align: center;
  color: white;
  z-index: 1;
}

.banner-text h2 {
  font-size: 36px;
  margin-bottom: 10px;
}

.banner-text p {
  font-size: 16px;
  opacity: 0.9;
}

/* 分类 */
.categories {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 14px;
}

/* 菜品区域 */
.food-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 25px;
  color: #333;
}

.title-icon {
  font-size: 28px;
}

/* 菜品网格 */
.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.food-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.food-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.food-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.food-card:hover .food-image img {
  transform: scale(1.05);
}

.food-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.food-info {
  padding: 16px;
}

.food-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.food-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
  line-height: 1.4;
  height: 36px;
  overflow: hidden;
}

.food-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
}

/* 底部 */
.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 24px;
  margin-top: 20px;
}

.footer p {
  opacity: 0.7;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .logo-text {
    font-size: 20px;
  }

  .nav-buttons {
    justify-content: center;
  }

  .banner-item {
    height: 200px;
  }

  .banner-text h2 {
    font-size: 24px;
  }

  .section-title {
    font-size: 20px;
  }

  .food-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .category-item {
    padding: 8px 16px;
  }

  .category-icon {
    font-size: 20px;
  }

  .category-name {
    font-size: 12px;
  }
}
</style>