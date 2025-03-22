/**
 * Component Debug Plugin
 * 
 * This plugin automatically applies the debug border and component name display
 * to all components in the application.
 */
import { App, Component, ComponentOptions } from 'vue';
import { ComponentWrapper } from '@/components/common';

export const ComponentDebugPlugin = {
  install(app: App) {
    // Store the original component registration method
    const originalComponent = app.component.bind(app);

    // Override the component registration to automatically wrap components
    app.component = function(name: string, definition?: Component): any {
      if (name && definition) {
        // Skip wrapping internal Vue components and the ComponentWrapper itself
        if (name.startsWith('_') || name === 'ComponentWrapper') {
          return originalComponent(name, definition);
        }

        // Get the original render function or template
        const originalDef = definition as ComponentOptions;
        
        // Store the original setup function if it exists
        const originalSetup = originalDef.setup;

        // If component has a setup function, extend it to add ComponentWrapper as a dependency
        if (originalSetup) {
          originalDef.setup = function(props, context) {
            // Call original setup
            const setupResult = originalSetup(props, context);
            
            // Add ComponentWrapper to the component's dependencies
            if (!originalDef.components) {
              originalDef.components = {};
            }
            originalDef.components.ComponentWrapper = ComponentWrapper;
            
            return setupResult;
          };
        } else {
          // If no setup function, just add ComponentWrapper to components
          if (!originalDef.components) {
            originalDef.components = {};
          }
          originalDef.components.ComponentWrapper = ComponentWrapper;
        }

        // Get the original template
        let template = originalDef.template || '';
        
        // Only modify template if it's a string
        if (typeof template === 'string') {
          // Wrap the template with ComponentWrapper
          template = `<ComponentWrapper componentName="${name}">${template}</ComponentWrapper>`;
          originalDef.template = template;
        }
        
        // Register the modified component
        return originalComponent(name, originalDef);
      }
      
      // If only name is provided, this is a component lookup
      return originalComponent(name);
    };
  }
};

export default ComponentDebugPlugin;
