// Main game class that coordinates all systems
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    
    // Game state
    this.isRunning = false;
    this.lastTime = 0;
    this.fps = 60;
    
    // Performance monitoring
    this.performanceStats = {
      frameCount: 0,
      totalFrameTime: 0,
      updateTime: 0,
      renderTime: 0,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      lastStatsUpdate: 0
    };
    
    // Game systems
    this.camera = new Camera();
    this.input = new InputManager();
    this.ui = new UIManager();
    this.map = null;
    this.player = null;
    this.wraithManager = null;
    
    // Configuration
    this.config = {
      debug: false,
      mapWidth: window.innerWidth,
      mapHeight: window.innerHeight,
      targetFps: 60,
      performanceMode: false // Auto-enable if performance is poor
    };

    this.init();
  }

  init() {
    console.log("Initializing game...");
    
    try {
      // Set canvas to full screen resolution
      this.resizeCanvas();
      console.log("Canvas resized");
      
      // Initialize game systems
      this.camera.resize(this.canvas);
      console.log("Camera initialized");
      
      // Generate map
      console.log("Creating map...");
      this.map = new Map(this.config.mapWidth, this.config.mapHeight);
      console.log("Map created successfully");
      
      // Create player at entrance
      console.log("Creating player...");
      const startPos = this.map.getPlayerStartPosition();
      this.player = new Player(startPos.x, startPos.y);
      console.log("Player created at:", startPos);
      
      // Create wraiths (pass the map directly)
      console.log("Creating wraiths...");
      this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
      console.log("Wraiths created");
      
      // Setup resize handler
      window.addEventListener('resize', () => {
        // Update config dimensions to match new window size
        this.config.mapWidth = window.innerWidth;
        this.config.mapHeight = window.innerHeight;
        
        this.resizeCanvas();
        this.camera.resize(this.canvas);
      });
      
      // Start the game loop
      console.log("Starting game loop...");
      this.start();
    } catch (error) {
      console.error("Error during game initialization:", error);
      console.error("Stack trace:", error.stack);
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop(currentTime = performance.now()) {
    if (!this.isRunning) return;

    try {
      // Calculate delta time and FPS
      const deltaTime = currentTime - this.lastTime;
      this.fps = 1000 / deltaTime;
      this.lastTime = currentTime;

      // Performance monitoring
      const frameStartTime = performance.now();
      
      // Update game systems
      const updateStartTime = performance.now();
      this.update(deltaTime);
      this.performanceStats.updateTime = performance.now() - updateStartTime;
      
      // Render the game
      const renderStartTime = performance.now();
      this.render();
      this.performanceStats.renderTime = performance.now() - renderStartTime;
      
      // Update performance statistics
      this.updatePerformanceStats(performance.now() - frameStartTime);

      // Continue the loop
      requestAnimationFrame((time) => this.gameLoop(time));
    } catch (error) {
      console.error("Game loop error:", error);
      // Try to recover by restarting
      setTimeout(() => {
        if (this.isRunning) {
          this.restart();
        }
      }, 1000);
    }
  }

  update(deltaTime) {
    // Update player
    this.player.update(this.input, this.map);
    
    // Update wraiths
    this.wraithManager.update(this.player, this.map);
    
    // Check collisions
    this.player.checkCollisionWithWraiths(this.wraithManager.getWraiths());
    
    // Update camera to follow player
    this.camera.followPlayer(this.player, this.config.mapWidth, this.config.mapHeight);
    
    // Update UI
    this.ui.updateEnergyBar(this.player);
    
    // Update debug info if enabled
    if (this.config.debug) {
      this.ui.updateDebugInfo(this.player, this.wraithManager.getWraiths(), this.fps);
    }
  }

  render() {
    // Clear only the visible area for better performance
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transformation
    this.camera.apply(this.ctx);

    // Draw game world with culling optimizations
    this.map.draw(this.ctx, this.camera);
    
    // Only draw player if visible (should always be, but good practice)
    if (this.camera.isInView({
      x: this.player.x - this.player.radius, 
      y: this.player.y - this.player.radius, 
      width: this.player.radius * 2, 
      height: this.player.radius * 2
    })) {
      this.player.draw(this.ctx);
    }
    
    this.wraithManager.draw(this.ctx, this.camera);

    // Restore camera transformation
    this.camera.restore(this.ctx);
  }

  // Toggle debug mode
  toggleDebug() {
    this.config.debug = !this.config.debug;
  }

  // Restart the game
  restart() {
    this.stop();
    
    // Reinitialize game systems
    this.map = new Map(this.config.mapWidth, this.config.mapHeight);
    const startPos = this.map.getPlayerStartPosition();
    this.player = new Player(startPos.x, startPos.y);
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
    
    this.start();
  }

  // Generate new map without restarting game
  generateNewMap() {
    console.log("Generating new map...");
    this.map = new Map(this.config.mapWidth, this.config.mapHeight);
    
    // Move player to new entrance
    const startPos = this.map.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.energy = this.player.maxEnergy; // Restore energy
    
    // Respawn wraiths with the new map
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
    
    this.ui.showMessage("New map generated! Press G to generate another.", 'info');
  }

  // Update performance statistics and adaptive features
  updatePerformanceStats(frameTime) {
    this.performanceStats.frameCount++;
    this.performanceStats.totalFrameTime += frameTime;
    
    // Update FPS tracking
    this.performanceStats.minFps = Math.min(this.performanceStats.minFps, this.fps);
    this.performanceStats.maxFps = Math.max(this.performanceStats.maxFps, this.fps);
    
    // Calculate average FPS every second
    const currentTime = performance.now();
    if (currentTime - this.performanceStats.lastStatsUpdate > 1000) {
      this.performanceStats.avgFps = this.performanceStats.frameCount;
      this.performanceStats.frameCount = 0;
      this.performanceStats.lastStatsUpdate = currentTime;
      
      // Auto-enable performance mode if FPS is consistently low
      if (this.performanceStats.avgFps < 45 && !this.config.performanceMode) {
        this.config.performanceMode = true;
        console.log("Performance mode enabled automatically due to low FPS");
        if (this.config.debug) {
          this.ui.showMessage("Performance mode enabled", 'info');
        }
      }
      
      // Reset min/max FPS tracking
      this.performanceStats.minFps = this.fps;
      this.performanceStats.maxFps = this.fps;
    }
  }

  // Get performance statistics
  getPerformanceStats() {
    return {
      ...this.performanceStats,
      currentFps: Math.round(this.fps),
      performanceMode: this.config.performanceMode
    };
  }

  // Toggle performance mode manually
  togglePerformanceMode() {
    this.config.performanceMode = !this.config.performanceMode;
    console.log(`Performance mode ${this.config.performanceMode ? 'enabled' : 'disabled'}`);
  }

  // Resize canvas to fill screen
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size to window size
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    
    // Scale canvas back down using CSS
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    
    // Reset context transformation and scale for device pixel ratio
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

// Global game instance
let game;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  
  // Make game accessible globally for debugging
  window.Game = Game;
  window.game = game;
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      game.toggleDebug();
    }
    if (e.key === 'F2') {
      e.preventDefault();
      game.togglePerformanceMode();
    }
    if (e.key === 'F3') {
      e.preventDefault();
      game.ui.showPerformanceStats();
    }
    if (e.key === 'R' && e.ctrlKey) {
      e.preventDefault();
      game.restart();
    }
    if (e.key === 'G') {
      e.preventDefault();
      game.generateNewMap();
    }
  });
}); 