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

  showGameOverModal(isVictory, restartCallback) {
    console.log(`🎭 UI: Showing simple game over modal - ${isVictory ? 'Victory' : 'Defeat'}`);
    
    // Remove any existing modal
    const existingModal = document.getElementById('gameOverModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'gameOverModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      border: 3px solid ${isVictory ? '#00ff00' : '#ff0000'};
      border-radius: 15px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 0 30px ${isVictory ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
    `;

    // Create title
    const title = document.createElement('h1');
    title.textContent = isVictory ? '🏆 VICTORY!' : '💀 GAME OVER';
    title.style.cssText = `
      color: ${isVictory ? '#00ff00' : '#ff0000'};
      font-size: 2.5em;
      margin: 0 0 20px 0;
      text-shadow: 0 0 10px ${isVictory ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'};
    `;

    // Create message
    const message = document.createElement('p');
    message.textContent = isVictory ? 
      'Congratulations! You escaped the wraiths!' : 
      'You were consumed by the wraiths!';
    message.style.cssText = `
      color: white;
      font-size: 1.2em;
      margin: 0 0 30px 0;
      line-height: 1.4;
    `;

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = '🔄 PLAY AGAIN';
    restartButton.style.cssText = `
      background: ${isVictory ? '#00aa00' : '#aa0000'};
      color: white;
      border: none;
      padding: 20px 40px;
      font-size: 1.3em;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      width: 100%;
    `;

    // Add hover effect
    restartButton.addEventListener('mouseenter', () => {
      restartButton.style.background = isVictory ? '#00cc00' : '#cc0000';
      restartButton.style.transform = 'translateY(-2px)';
      restartButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
    });

    restartButton.addEventListener('mouseleave', () => {
      restartButton.style.background = isVictory ? '#00aa00' : '#aa0000';
      restartButton.style.transform = 'translateY(0)';
      restartButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });

    // Add click handler
    restartButton.addEventListener('click', () => {
      console.log('🎮 UI: Restart button clicked');
      modal.remove();
      restartCallback();
    });

    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(restartButton);
    modal.appendChild(modalContent);

    // Add to page
    document.body.appendChild(modal);

    // Add keyboard support (Enter or Space to restart)
    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('🎮 UI: Restart triggered by keyboard');
        modal.remove();
        document.removeEventListener('keydown', keyHandler);
        restartCallback();
      }
    };
    document.addEventListener('keydown', keyHandler);

    console.log('✅ UI: Simple game over modal displayed');
  }

  showSimpleStartModal(startCallback) {
    console.log('🎭 UI: Showing simple start modal');
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'startModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      border: 3px solid #00ffff;
      border-radius: 15px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
    `;

    // Create title
    const title = document.createElement('h1');
    title.textContent = '👻 WRAITH RUN';
    title.style.cssText = `
      color: #00ffff;
      font-size: 3em;
      margin: 0 0 20px 0;
      text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    `;

    // Create description
    const description = document.createElement('p');
    description.textContent = 'Escape the wraiths through the maze!';
    description.style.cssText = `
      color: white;
      font-size: 1.2em;
      margin: 0 0 30px 0;
      line-height: 1.4;
    `;

    // Create start button
    const startButton = document.createElement('button');
    startButton.textContent = '🚀 START GAME';
    startButton.style.cssText = `
      background: #00aa00;
      color: white;
      border: none;
      padding: 20px 40px;
      font-size: 1.3em;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      width: 100%;
    `;

    // Add hover effect
    startButton.addEventListener('mouseenter', () => {
      startButton.style.background = '#00cc00';
      startButton.style.transform = 'translateY(-2px)';
      startButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
    });

    startButton.addEventListener('mouseleave', () => {
      startButton.style.background = '#00aa00';
      startButton.style.transform = 'translateY(0)';
      startButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });

    // Add click handler
    startButton.addEventListener('click', () => {
      console.log('🎮 UI: Start button clicked');
      modal.remove();
      startCallback();
    });

    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(startButton);
    modal.appendChild(modalContent);

    // Add to page
    document.body.appendChild(modal);

    // Add keyboard support (Enter to start)
    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('🎮 UI: Start triggered by keyboard');
        modal.remove();
        document.removeEventListener('keydown', keyHandler);
        startCallback();
      }
    };
    document.addEventListener('keydown', keyHandler);

    console.log('✅ UI: Simple start modal displayed');
  }

  showRedrawMapButton(redrawCallback) {
    console.log('🎭 UI: Showing redraw map button');
    
    // Remove existing button
    const existingButton = document.getElementById('redrawMapButton');
    if (existingButton) {
      existingButton.remove();
    }

    // Create redraw map button
    const redrawButton = document.createElement('button');
    redrawButton.id = 'redrawMapButton';
    redrawButton.textContent = '🗺️ REDRAW MAP';
    redrawButton.style.cssText = `
      position: fixed;
      top: 80px;
      left: 20px;
      z-index: 1000;
      background: #FF9800;
      color: white;
      border: none;
      padding: 12px 18px;
      font-size: 0.9em;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      min-width: 120px;
    `;

    // Add hover effect
    redrawButton.addEventListener('mouseenter', () => {
      redrawButton.style.background = '#F57C00';
      redrawButton.style.transform = 'translateX(5px)';
      redrawButton.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.4)';
    });

    redrawButton.addEventListener('mouseleave', () => {
      redrawButton.style.background = '#FF9800';
      redrawButton.style.transform = 'translateX(0)';
      redrawButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.3)';
    });

    // Add click handler
    redrawButton.addEventListener('click', () => {
      console.log('🎮 UI: Redraw map button clicked');
      redrawCallback();
    });

    // Add to page
    document.body.appendChild(redrawButton);

    console.log('✅ UI: Redraw map button displayed');
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
      
      debugEl.innerHTML = `
        <strong>PLAYER</strong><br>
        Position: (${Math.round(player.x)}, ${Math.round(player.y)})<br>
        Energy: ${Math.round(player.energy)}/${player.maxEnergy}<br>
        Sprinting: ${player.isSprinting}<br><br>
        
        <strong>PERFORMANCE</strong><br>
        FPS: ${Math.round(fps)}<br><br>
        
        <strong>WRAITHS</strong><br>
        Count: ${wraiths.length}<br><br>
        
        <strong>CONTROLS</strong><br>
        F1: Toggle Debug<br>
        G: New Maze<br>
        Ctrl+R: Restart
      `;
    }
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