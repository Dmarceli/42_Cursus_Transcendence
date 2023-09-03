import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import ChatView from '../views/ChatView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import TwoFAVerification from '../views/TwoFAVerification.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GameView
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView
    },
    {
      path: '/2faVerification',
      name: '2faVerification',
      component: TwoFAVerification
    },
    {
      path: '/profile',
      name: 'myProfile',
      component: ProfileView
    },
    {
      path: '/profile/:intra_nick',
      name: 'otherProfile',
      component: ProfileView
    }
  ]
})

export default router
