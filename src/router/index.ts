import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DetailsView from '@/views/DetailsView.vue'
import CartView from '@/views/CartView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import ProfileView from '@/views/ProfileView.vue'
import { UserService } from '@/services/user.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Katalog' } },
    { path: '/biljka/:id', component: DetailsView, meta: { title: 'Biljka' } },
    { path: '/korpa', component: CartView, meta: { title: 'Korpa', requiresAuth: true } },
    { path: '/profil', component: ProfileView, meta: { title: 'Profil', requiresAuth: true } },
    { path: '/prijava', component: LoginView, meta: { title: 'Prijava' } },
    { path: '/registracija', component: SignupView, meta: { title: 'Registracija' } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !UserService.getActiveUser()) {
    return { path: '/prijava', query: { redirect: to.fullPath } }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Zeleni kutak`
})

export default router