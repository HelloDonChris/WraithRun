// Utility functions for the game

class Utils {
  // Calculate distance between two points
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate angle between two points
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  // Normalize a vector
  static normalize(x, y) {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
  }

  // Linear interpolation
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Clamp a value between min and max
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Random integer between min and max (inclusive)
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Random float between min and max
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Check if two circles collide
  static circleCollision(x1, y1, r1, x2, y2, r2) {
    const distance = this.distance(x1, y1, x2, y2);
    return distance < r1 + r2;
  }

  // Check if point is inside rectangle
  static pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  // Check if point is inside circle
  static pointInCircle(px, py, cx, cy, radius) {
    return this.distance(px, py, cx, cy) <= radius;
  }

  // Convert degrees to radians
  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  // Convert radians to degrees
  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  // Format time in MM:SS format
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Deep clone an object
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  // Throttle function calls
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Debounce function calls
  static debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} 