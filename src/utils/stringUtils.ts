/**
 * Utility functions for string processing
 */

/**
 * Parses a JSON string to extract clean text content
 * Removes JSON syntax characters like {}, "", and :
 * @param jsonString String that might be in JSON format
 * @returns Clean text without JSON syntax
 */
export function parseJsonString(jsonString: any): string {
  if (!jsonString) return '';
  
  try {
    // If it's a string that looks like JSON, try to parse it
    if (typeof jsonString === 'string' && (jsonString.startsWith('{') || jsonString.startsWith('['))) {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        // Return description or name if available, else stringify without syntax
        return parsed.description || parsed.DESCRIPTION || 
               parsed.name || parsed.NAME || 
               JSON.stringify(parsed).replace(/[{}"]/g, '').replace(/:/g, ' ');
      }
      return jsonString;
    }
    
    // If it's already an object, access its properties
    if (typeof jsonString === 'object' && jsonString !== null) {
      return jsonString.description || jsonString.DESCRIPTION || 
             jsonString.name || jsonString.NAME || 
             JSON.stringify(jsonString).replace(/[{}"]/g, '').replace(/:/g, ' ');
    }
    
    // If none of the above, return as is
    return String(jsonString);
  } catch (e) {
    // If parsing fails, attempt to clean up the string directly
    if (typeof jsonString === 'string') {
      return jsonString.replace(/[{}"]/g, '').replace(/:/g, ' ');
    }
    return String(jsonString);
  }
}

/**
 * Parses a companion ability object to extract the description
 * @param ability The ability object or string to parse
 * @returns Clean ability description text
 */
export function parseJsonAbility(ability: any): string {
  if (!ability) return '';
  
  try {
    // If it's a string, try to parse it if it looks like JSON
    if (typeof ability === 'string') {
      if (ability.startsWith('{') || ability.startsWith('[')) {
        try {
          const parsed = JSON.parse(ability);
          return parsed.description || parsed.name || String(parsed).replace(/[{}"]/g, '').replace(/:/g, ' ');
        } catch {
          return ability.replace(/[{}"]/g, '').replace(/:/g, ' ');
        }
      }
      return ability;
    }
    
    // If it's an object with description property, return that
    if (typeof ability === 'object' && ability !== null) {
      if (ability.description) {
        return ability.description;
      } else if (ability.name) {
        return ability.name;
      } else {
        return JSON.stringify(ability).replace(/[{}"]/g, '').replace(/:/g, ' ');
      }
    }
    
    return String(ability);
  } catch {
    return String(ability).replace(/[{}"]/g, '').replace(/:/g, ' ');
  }
}
