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
  // Skip logging empty errors that come from native event handlers
  // These are often harmless and related to event bubbling
  if (info === 'native event handler' && (!err || Object.keys(err).length === 0)) {
    return;
  }
  
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount the app
app.mount('#app')