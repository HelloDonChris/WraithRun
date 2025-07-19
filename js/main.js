// Main game class that coordinates all systems
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    
    // Game state
    this.isRunning = false;
    this.gameState = 'start'; // 'start', 'playing', 'gameOver', 'victory'
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
      
      // Show simple start modal
      console.log("🎮 GAME INIT: Showing start modal...");
      this.ui.showSimpleStartModal(() => {
        this.startGame();
      });
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
    
    // Generate new map with recursive backtracking
    this.map.generateRecursiveBacktrackingMaze();
    
    // Reset player and wraiths
    const startPos = this.map.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.energy = this.player.maxEnergy;
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
    
    console.log("✅ RESTART: Game restarted successfully");
  }

  // Start the game
  startGame() {
    console.log("🎮 GAME START: Starting game");
    this.gameState = 'playing';
    
    // Generate new map with recursive backtracking
    this.map.generateRecursiveBacktrackingMaze();
    
    // Reset player and wraiths
    const startPos = this.map.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.energy = this.player.maxEnergy;
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
    
    // Show redraw map button
    this.ui.showRedrawMapButton(() => {
      this.redrawMap();
    });
    
    // Start the game loop
    this.start();
  }

  // Redraw map during gameplay
  redrawMap() {
    console.log("🔄 REDRAW: Redrawing map");
    
    // Generate new map with recursive backtracking
    this.map.generateRecursiveBacktrackingMaze();
    
    // Reset player position
    const startPos = this.map.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.energy = this.player.maxEnergy;
    
    // Respawn wraiths
    this.wraithManager = new WraithManager(this.config.mapWidth, this.config.mapHeight, this.map);
  }

  // Toggle debug mode
  toggleDebug() {
    this.config.debug = !this.config.debug;
  }

  // Legacy restart method (for keyboard shortcut compatibility)
  restart() {
    this.restartGame();
  }

  // Generate new map without restarting game (legacy method for G key)
  generateNewMap() {
    this.redrawMap();
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