class Camera {
  constructor(width = 800, height = 600) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }

  followPlayer(player, mapWidth, mapHeight) {
    this.x = player.x - this.width / 2;
    this.y = player.y - this.height / 2;
    
    // Keep camera within bounds
    this.x = Math.max(0, Math.min(this.x, mapWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, mapHeight - this.height));
  }

  isInView(object) {
    return (
      object.x + (object.width || object.size || 0) >= this.x && 
      object.x <= this.x + this.width &&
      object.y + (object.height || object.size || 0) >= this.y && 
      object.y <= this.y + this.height
    );
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  resize(canvas) {
    // Use full window size for better visibility
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Camera;
} 