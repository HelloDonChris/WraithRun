class Player {
  constructor(x = 100, y = 50) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.speed = 1.5;
    this.sprintSpeed = 3;
    this.energy = 100;
    this.maxEnergy = 100;
    this.isSprinting = false;
  }

  update(input, map) {
    let dx = 0, dy = 0;
    
    // Keyboard input
    if (input.keys["ArrowUp"] || input.keys["w"]) dy -= 1;
    if (input.keys["ArrowDown"] || input.keys["s"]) dy += 1;
    if (input.keys["ArrowLeft"] || input.keys["a"]) dx -= 1;
    if (input.keys["ArrowRight"] || input.keys["d"]) dx += 1;
    
    // Mobile joystick input
    if (input.mobile.joystick.active) {
      dx += input.mobile.joystick.dx;
      dy += input.mobile.joystick.dy;
    }

    const moving = dx !== 0 || dy !== 0;
    
    // Energy management
    this.updateEnergy(moving, map);

    // Movement
    if (moving) {
      this.move(dx, dy, map);
    }

    // Check win condition
    if (map.isInExit(this.x, this.y)) {
      this.onReachExit();
    }
  }

  updateEnergy(moving, map) {
    if (moving) {
      // Energy decreases while running
      this.isSprinting = this.energy > 0;
      this.energy -= 0.3;
      if (this.energy < 0) this.energy = 0;
    } else {
      // Energy increases while static
      this.isSprinting = false;
      if (map.isInSafeRoom(this.x, this.y)) {
        this.energy += 1.5; // Faster recovery in safe room
      } else {
        this.energy += 0.4; // Slower recovery outside safe room
      }
      if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
    }
  }

  move(dx, dy, map) {
    const speed = this.energy > 0 ? this.sprintSpeed : this.speed;
    const norm = Math.sqrt(dx*dx + dy*dy) || 1;
    const newX = this.x + (dx / norm) * speed;
    const newY = this.y + (dy / norm) * speed;
    
    // Use regular collision detection (optimized version has issues with centered maze)
    if (map.canMoveTo(newX, this.y, this.radius)) {
      this.x = newX;
    }
    if (map.canMoveTo(this.x, newY, this.radius)) {
      this.y = newY;
    }
  }

  draw(ctx) {
    // Draw orb with energy-based glow
    const energyRatio = this.energy / this.maxEnergy;
    
    // Outer glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${0.2 * energyRatio})`;
    ctx.fill();
    
    // Middle glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${0.4 * energyRatio})`;
    ctx.fill();
    
    // Core orb
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${0.7 + 0.3 * energyRatio})`;
    ctx.fill();
    
    // Inner bright core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.8 * energyRatio})`;
    ctx.fill();
  }

  onReachExit() {
    alert("Congratulations! You escaped the wraiths!");
    window.location.reload();
  }

  // Check collision with wraiths
  checkCollisionWithWraiths(wraiths) {
    for (let wraith of wraiths) {
      const dx = this.x - wraith.x;
      const dy = this.y - wraith.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < this.radius + 12) {
        alert("You were consumed by the Wraith!");
        window.location.reload();
        return true;
      }
    }
    return false;
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
} 