// Main game class that coordinates all systems
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    
    // Game state
    this.isRunning = false;
    this.gameState = 'playing'; // 'playing', 'gameOver', 'victory'
    this.lastTime = 0;
    this.fps = 60;
    

    
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
    console.log("🎮 GAME INIT: Starting initialization...");
    
    try {
      // Set canvas to full screen resolution
      console.log("🎮 GAME INIT: Resizing canvas...");
      this.resizeCanvas();
      console.log("✅ GAME INIT: Canvas resized successfully");
      
      // Initialize game systems
      console.log("🎮 GAME INIT: Initializing camera...");
      this.camera.resize(this.canvas);
      console.log("✅ GAME INIT: Camera initialized successfully");
      
      // Generate map
      console.log("🎮 GAME INIT: Creating map...");
      this.map = new Map(this.config.mapWidth, this.config.mapHeight);
      console.log("✅ GAME INIT: Map created successfully");
      
      // Create player at entrance
      console.log("🎮 GAME INIT: Creating player...");
      const startPos = this.map.getPlayerStartPosition();
      this.player = new Player(startPos.x, startPos.y);
      console.log("✅ GAME INIT: Player created at:", startPos);
      
      // Create wraiths (pass the map directly)
      console.log("🎮 GAME INIT: Creating wraiths...");
      this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
      console.log("✅ GAME INIT: Wraiths created");
      
      // Setup resize handler
      console.log("🎮 GAME INIT: Setting up resize handler...");
      window.addEventListener('resize', () => {
        console.log("🔄 RESIZE: Window resized, updating game...");
        // Update config dimensions to match new window size
        this.config.mapWidth = window.innerWidth;
        this.config.mapHeight = window.innerHeight;
        
        this.resizeCanvas();
        this.camera.resize(this.canvas);
        console.log("✅ RESIZE: Game updated for new window size");
      });
      console.log("✅ GAME INIT: Resize handler set up");
      
      // Start the game loop
      console.log("🎮 GAME INIT: Starting game loop...");
      this.start();
      console.log("✅ GAME INIT: Game initialization complete!");
    } catch (error) {
      console.error("Error during game initialization:", error);
      console.error("Stack trace:", error.stack);
    }
  }

  start() {
    console.log("🚀 GAME START: Starting game loop...");
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    console.log("✅ GAME START: Game loop initiated");
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

      // Update game systems
      this.update(deltaTime);
      
      // Render the game
      this.render();

      // Continue the loop
      requestAnimationFrame((time) => this.gameLoop(time));
    } catch (error) {
      console.error("Game loop error:", error);
      console.error("Stack trace:", error.stack);
      // Stop the game loop to prevent infinite errors
      this.isRunning = false;
    }
  }

  update(deltaTime) {
    // Only update game if still playing
    if (this.gameState !== 'playing') {
      return;
    }

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

  // Handle game over/victory
  finishGame(isVictory) {
    console.log(`🎯 GAME FINISH: ${isVictory ? 'Victory!' : 'Game Over!'}`);
    
    // Set game state to prevent further updates
    this.gameState = isVictory ? 'victory' : 'gameOver';
    
    // Show game over modal
    this.ui.showGameOverModal(isVictory, () => {
      // Restart callback
      this.restartGame();
    });
  }

  // Restart the game (reset game state)
  restartGame() {
    console.log("🔄 RESTART: Restarting game...");
    
    // Reset game state
    this.gameState = 'playing';
    
    // Reinitialize game systems
    this.map = new Map(this.config.mapWidth, this.config.mapHeight);
    const startPos = this.map.getPlayerStartPosition();
    this.player = new Player(startPos.x, startPos.y);
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
    
    console.log("✅ RESTART: Game restarted successfully");
  }

  // Toggle debug mode
  toggleDebug() {
    this.config.debug = !this.config.debug;
  }

  // Legacy restart method (for keyboard shortcut compatibility)
  restart() {
    this.restartGame();
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

// Track network requests that might cause loading spinner
let networkRequestCount = 0;
const originalFetch = window.fetch;
window.fetch = function(...args) {
  networkRequestCount++;
  console.log(`🌐 NETWORK: Request #${networkRequestCount} - ${args[0]}`);
  return originalFetch.apply(this, args);
};

// Track setInterval and setTimeout
let intervalCount = 0;
let timeoutCount = 0;
const originalSetInterval = window.setInterval;
const originalSetTimeout = window.setTimeout;

window.setInterval = function(callback, delay) {
  intervalCount++;
  console.log(`⏰ INTERVAL: Created interval #${intervalCount} with delay ${delay}ms`);
  return originalSetInterval.apply(this, arguments);
};

window.setTimeout = function(callback, delay) {
  timeoutCount++;
  console.log(`⏰ TIMEOUT: Created timeout #${timeoutCount} with delay ${delay}ms`);
  return originalSetTimeout.apply(this, arguments);
};

// Track XMLHttpRequest
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  xhr.open = function(method, url) {
    console.log(`🌐 XHR: ${method} ${url}`);
    return originalOpen.apply(this, arguments);
  };
  return xhr;
};

// Track image loading
const originalImage = window.Image;
window.Image = function() {
  const img = new originalImage();
  const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(img, 'src', {
    set: function(value) {
      console.log(`🖼️ IMAGE: Loading ${value}`);
      originalSrc.set.call(this, value);
    },
    get: function() {
      return originalSrc.get.call(this);
    }
  });
  return img;
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("📄 DOM: Content loaded, initializing game...");
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
    if (e.key === 'R' && e.ctrlKey) {
      e.preventDefault();
      game.restart();
    }
    if (e.key === 'G') {
      e.preventDefault();
      game.generateNewMap();
    }
  });
  
  console.log("✅ DOM: Game initialization complete");
}); 