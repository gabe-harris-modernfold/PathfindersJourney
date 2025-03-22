/**
 * Component Debug Directive
 * 
 * This directive adds a data-component-name attribute to Vue components
 * to display the component name on the top middle of the component with a light blue border
 */
import { DirectiveBinding, ObjectDirective } from 'vue'

export const componentDebug: ObjectDirective = {
  /**
   * Called when the directive is mounted to the element
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // Get component name from binding or fallback to a generic name
    const componentName = binding.value || 'Component'
    
    // Add data-component-name attribute
    el.setAttribute('data-component-name', componentName)
  },
  
  /**
   * Called when the directive is updated
   */
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // Update component name if it changes
    const componentName = binding.value || 'Component'
    el.setAttribute('data-component-name', componentName)
  }
}

export default componentDebug
