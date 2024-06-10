import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TripHistoryPage from '../components/features/TripHistoryPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/maps',
      name: 'maps',
      component: () => import('../components/Maps.vue')
    },
    {
      path: '/trip-history',
      name: 'TripHistoryPage',
      component: TripHistoryPage
    }

  ]
})

export default router
