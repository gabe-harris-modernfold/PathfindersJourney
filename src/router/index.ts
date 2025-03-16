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

// Add a flag for tracking page refreshes
let isInitialPageLoad = true;

// Add sessionStorage to track page refresh
router.beforeEach((to, from, next) => {
  // Set a random key in sessionStorage
  const randomKey = 'pathfinder_session_' + Math.random().toString(36).substring(2, 15);
  
  // On initial page load (or after refresh), isInitialPageLoad will be true
  if (isInitialPageLoad) {
    isInitialPageLoad = false;
    
    // If we're not already going to the setup page, redirect there
    if (to.path !== '/') {
      return next({ path: '/' });
    }
  }
  
  next();
});

export default router;
