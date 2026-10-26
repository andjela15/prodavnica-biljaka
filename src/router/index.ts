import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // adresa "/" (početna) prikazuje HomeView
    { path: '/', component: HomeView }
  ],
})

export default router
