import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cart from '../views/Cart.vue'
import Orders from '../views/Orders.vue'
import Register from '../views/Register.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/cart', component: Cart },
    { path: '/orders', component: Orders }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router