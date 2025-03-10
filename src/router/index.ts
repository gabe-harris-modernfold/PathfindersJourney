import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Import views
import GameSetupView from '@/views/GameSetupView.vue';
import GameBoardView from '@/views/GameBoardView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'setup',
    component: GameSetupView
  },
  {
    path: '/game',
    name: 'game',
    component: GameBoardView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
