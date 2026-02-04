// src/index.ts
import InstaChecker from './InstaChecker';

// For ES modules
export default InstaChecker;
export { InstaChecker };

// For CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstaChecker;
  module.exports.default = InstaChecker;
}
