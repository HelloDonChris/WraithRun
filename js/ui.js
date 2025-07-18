class UIManager {
  constructor() {
    this.energyBar = document.getElementById("energyFill");
    this.energyBarContainer = document.getElementById("energyBar");
  }

  updateEnergyBar(player) {
    if (this.energyBar) {
      const percentage = (player.energy / player.maxEnergy * 100);
      this.energyBar.style.width = percentage + "%";
      
      // Change color based on energy level
      if (percentage > 50) {
        this.energyBar.style.background = "limegreen";
      } else if (percentage > 25) {
        this.energyBar.style.background = "orange";
      } else {
        this.energyBar.style.background = "red";
      }
    }
  }

  showMessage(message, type = 'info') {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.className = `game-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 2000;
      border: 2px solid ${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'};
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }

  showGameOver(isWin = false) {
    const message = isWin ? 
      "Congratulations! You escaped the wraiths!" : 
      "You were consumed by the Wraith!";
    
    this.showMessage(message, isWin ? 'success' : 'error');
    
    // Restart game after delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  updateDebugInfo(player, wraiths, fps) {
    // Optional debug information display
    if (window.game && window.game.config.debug) {
      let debugEl = document.getElementById('debug-info');
      if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'debug-info';
        debugEl.style.cssText = `
          position: absolute;
          top: 50px;
          left: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          font-family: monospace;
          font-size: 11px;
          z-index: 1000;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        `;
        document.body.appendChild(debugEl);
      }
      
      const perfStats = window.game.getPerformanceStats();
      
      // Enhanced wraith AI debugging
      const wraithsWithPaths = wraiths.filter(w => w.path && w.path.length > 0).length;
      const avgPathLength = wraiths.reduce((sum, w) => sum + (w.path ? w.path.length : 0), 0) / wraiths.length;
      const stuckWraiths = wraiths.filter(w => w.stuckCounter > 10).length;
      
      debugEl.innerHTML = `
        <strong>PLAYER</strong><br>
        Position: (${Math.round(player.x)}, ${Math.round(player.y)})<br>
        Energy: ${Math.round(player.energy)}/${player.maxEnergy}<br>
        Sprinting: ${player.isSprinting}<br><br>
        
        <strong>PERFORMANCE</strong><br>
        FPS: ${Math.round(fps)} (Avg: ${perfStats.avgFps})<br>
        Update: ${perfStats.updateTime.toFixed(1)}ms<br>
        Render: ${perfStats.renderTime.toFixed(1)}ms<br>
        Perf Mode: ${perfStats.performanceMode ? 'ON' : 'OFF'}<br><br>
        
        <strong>SMART AI</strong><br>
        Wraiths: ${wraiths.length}<br>
        With Paths: ${wraithsWithPaths}/${wraiths.length}<br>
        Avg Path Length: ${avgPathLength.toFixed(1)}<br>
        Stuck: ${stuckWraiths}<br><br>
        
        <strong>CONTROLS</strong><br>
        F1: Toggle Debug (ON)<br>
        F2: Performance Mode<br>
        F3: Performance Stats<br>
        G: New Maze
      `;
    }
  }

  showPerformanceStats() {
    if (!window.game) return;
    
    const stats = window.game.getPerformanceStats();
    const message = `
Performance Statistics:
• Current FPS: ${stats.currentFps}
• Average FPS: ${stats.avgFps}
• Update Time: ${stats.updateTime.toFixed(1)}ms
• Render Time: ${stats.renderTime.toFixed(1)}ms
• Performance Mode: ${stats.performanceMode ? 'Enabled' : 'Disabled'}

${stats.avgFps < 45 ? '⚠️ Consider enabling performance mode (F2)' : '✅ Performance is good'}
    `;
    
    this.showMessage(message, 'info');
  }

  hide() {
    // Hide UI elements (useful for cutscenes or menus)
    if (this.energyBarContainer) {
      this.energyBarContainer.style.display = 'none';
    }
  }

  show() {
    // Show UI elements
    if (this.energyBarContainer) {
      this.energyBarContainer.style.display = 'block';
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
} 