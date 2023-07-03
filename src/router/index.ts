import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../pages/HomePage.vue'),
        },
        {
          path: 'drawing',
          name: 'drawing',
          component: () => import('../pages/DrawingPage.vue'),
        },
      ],
    },
  ],
})

export default router
