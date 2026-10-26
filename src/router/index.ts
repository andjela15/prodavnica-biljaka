import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CartView from '@/views/CartView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Katalog' } },
    { path: '/korpa', component: CartView, meta: { title: 'Korpa' } },
    { path: '/prijava', component: LoginView, meta: { title: 'Prijava' } },
    { path: '/registracija', component: SignupView, meta: { title: 'Registracija' } }
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Zeleni kutak`
})

export default router
