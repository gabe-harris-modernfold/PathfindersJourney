import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import { componentDebug } from './directives/componentDebug'
import ComponentDebugPlugin from './plugins/componentDebug'

// Create the app instance
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Register global directives
app.directive('component-debug', componentDebug)

// Apply component debug plugin to all components
app.use(ComponentDebugPlugin)

// Set up global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount the app
app.mount('#app')