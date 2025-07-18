class Wraith {
  constructor(x, y, id = 0) {
    this.x = x;
    this.y = y;
    this.speed = 1.0;
    this.radius = 15;
    this.id = id;
    
    // Smart pathfinding properties
    this.path = null;
    this.currentPathIndex = 0;
    this.lastPlayerX = 0;
    this.lastPlayerY = 0;
    this.pathfindingCooldown = id * 15; // Stagger pathfinding to spread CPU load
    this.recalculateInterval = 45 + (id * 10); // Different intervals: 45, 55, 65 frames
    this.stuckCounter = 0;
    this.lastPosition = { x: this.x, y: this.y };
  }

  update(player, map) {
    // Don't chase player if they're in a safe room
    if (map.isInSafeRoom(player.x, player.y)) {
      // Clear path when player is safe
      this.path = null;
      return;
    }

    // Use smart A* pathfinding
    this.smartPathfinding(player, map);
  }

  smartPathfinding(player, map) {
    // Temporarily disable complex pathfinding to fix infinite loading
    // Use simple movement for now - much more reliable
    this.simpleMovement(player, map);
  }

  calculatePathToPlayer(player, map) {
    // Use the map's A* pathfinding
    if (!map.findPath) {
      console.warn("Map doesn't support pathfinding");
      return;
    }

    const startTime = performance.now();
    
    // Find path from wraith to player
    this.path = map.findPath(this.x, this.y, player.x, player.y);
    this.currentPathIndex = 0;
    
    // Performance monitoring
    const pathfindTime = performance.now() - startTime;
    if (pathfindTime > 5) {
      console.warn(`Wraith ${this.id} pathfinding took ${pathfindTime.toFixed(2)}ms`);
    }
    
    // If no direct path found, try nearby positions
    if (!this.path) {
      this.findAlternatePath(player, map);
    }
  }

  findAlternatePath(player, map) {
    // Try to find path to positions near the player
    const searchRadius = 60;
    const attempts = 4;
    
    for (let i = 0; i < attempts; i++) {
      const angle = (i / attempts) * Math.PI * 2;
      const targetX = player.x + Math.cos(angle) * searchRadius;
      const targetY = player.y + Math.sin(angle) * searchRadius;
      
      this.path = map.findPath(this.x, this.y, targetX, targetY);
      if (this.path) {
        this.currentPathIndex = 0;
        break;
      }
    }
  }

  followPath(map) {
    if (!this.path || this.currentPathIndex >= this.path.length) {
      this.path = null;
      return;
    }

    const target = this.path[this.currentPathIndex];
    if (!target) return;

    // Calculate direction to current target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If close enough to current waypoint, move to next one
    if (distance < 15) {
      this.currentPathIndex++;
      return;
    }

    // Move toward current waypoint
    if (distance > 0) {
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;
      
      const newX = this.x + moveX;
      const newY = this.y + moveY;
      
      // Check if movement is valid
      if (!map.isWall(newX, newY)) {
        this.x = newX;
        this.y = newY;
      } else {
        // If blocked, force path recalculation
        this.pathfindingCooldown = 0;
      }
    }
  }

  isStuck() {
    // Check if wraith hasn't moved much recently
    const distanceMoved = Math.sqrt(
      Math.pow(this.x - this.lastPosition.x, 2) + 
      Math.pow(this.y - this.lastPosition.y, 2)
    );
    
    if (distanceMoved < 3) {
      this.stuckCounter++;
    } else {
      this.stuckCounter = Math.max(0, this.stuckCounter - 2); // Decay stuck counter when moving
    }
    
    // Consider stuck if not moving for 45 frames (about 0.75 seconds at 60fps)
    return this.stuckCounter > 45;
  }

  updateStuckDetection() {
    // Update position tracking more consistently
    if (this.stuckCounter % 15 === 0) { // Every 15 frames
      this.lastPosition.x = this.x;
      this.lastPosition.y = this.y;
    }
  }

  handleStuckState() {
    // When stuck, try emergency maneuvers
    if (this.isStuck()) {
      console.log(`Wraith ${this.id} is stuck, attempting recovery`);
      
      // Clear current path to force recalculation
      this.path = null;
      this.pathfindingCooldown = 0;
      
      // Try to move to a nearby open space
      this.emergencyMovement();
      
      // Reset stuck counter after attempting recovery
      this.stuckCounter = 0;
    }
  }

  emergencyMovement() {
    // Try moving in different directions to get unstuck
    const directions = [
      { dx: 0, dy: -this.speed * 2 },  // Up
      { dx: this.speed * 2, dy: 0 },   // Right
      { dx: 0, dy: this.speed * 2 },   // Down
      { dx: -this.speed * 2, dy: 0 },  // Left
      // Diagonal movements
      { dx: this.speed * 1.5, dy: -this.speed * 1.5 }, // Up-Right
      { dx: this.speed * 1.5, dy: this.speed * 1.5 },  // Down-Right
      { dx: -this.speed * 1.5, dy: this.speed * 1.5 }, // Down-Left
      { dx: -this.speed * 1.5, dy: -this.speed * 1.5 } // Up-Left
    ];
    
    // Shuffle directions for randomness
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    // Try each direction
    for (const dir of directions) {
      const newX = this.x + dir.dx;
      const newY = this.y + dir.dy;
      
      // Get map reference
      const map = window.game ? window.game.map : null;
      if (map && !map.isWall(newX, newY)) {
        this.x = newX;
        this.y = newY;
        console.log(`Wraith ${this.id} moved to (${newX}, ${newY}) to escape stuck state`);
        break;
      }
    }
  }

  simpleMovement(player, map) {
    // Fallback simple movement (kept as backup)
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 0) {
      const normalizedDx = dx / dist;
      const normalizedDy = dy / dist;
      
      let newX = this.x + normalizedDx * this.speed;
      let newY = this.y + normalizedDy * this.speed;
      
      if (map.isWall(newX, newY)) {
        if (!map.isWall(this.x + normalizedDx * this.speed, this.y)) {
          newX = this.x + normalizedDx * this.speed;
          newY = this.y;
        } else if (!map.isWall(this.x, this.y + normalizedDy * this.speed)) {
          newX = this.x;
          newY = this.y + normalizedDy * this.speed;
        } else {
          newX = this.x;
          newY = this.y;
        }
      }
      
      this.x = newX;
      this.y = newY;
    }
  }

  draw(ctx) {
    // Draw debug path if enabled
    if (window.game && window.game.config.debug && this.path && this.path.length > 1) {
      this.drawPath(ctx);
    }

    // Draw shadow/aura
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(139, 0, 0, 0.3)";
    ctx.fill();
    
    // Draw main wraith body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    
    // Add red glow outline
    ctx.strokeStyle = "#8B0000";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw wraith ID in debug mode
    if (window.game && window.game.config.debug) {
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`W${this.id}`, this.x, this.y - this.radius - 10);
    }
  }

  drawPath(ctx) {
    if (!this.path || this.path.length < 2) return;

    // Draw the planned path
    ctx.strokeStyle = `rgba(255, ${50 + this.id * 50}, 0, 0.6)`; // Different colors per wraith
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    
    // Draw line through all waypoints
    for (let i = this.currentPathIndex; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
    
    // Draw current target waypoint
    if (this.currentPathIndex < this.path.length) {
      const target = this.path[this.currentPathIndex];
      ctx.fillStyle = `rgba(255, ${100 + this.id * 50}, 0, 0.8)`;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw all waypoints as small dots
    for (let i = this.currentPathIndex; i < this.path.length; i++) {
      const waypoint = this.path[i];
      ctx.fillStyle = `rgba(255, ${150 + this.id * 30}, 0, 0.4)`;
      ctx.beginPath();
      ctx.arc(waypoint.x, waypoint.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class WraithManager {
  constructor(mapWidth, mapHeight, map = null) {
    this.wraiths = [];
    this.spawnWraiths(mapWidth, mapHeight, map);
  }

  spawnWraiths(mapWidth, mapHeight, map) {
    if (!map || !map.wraithSpawnRooms || map.wraithSpawnRooms.length === 0) {
      console.warn("Map spawn rooms not available, using fallback positions");
      this.spawnWraithsFallback(mapWidth, mapHeight, map);
      return;
    }

    const speeds = [1.5, 1.3, 1.7]; // Faster speeds for urgency!
    
    // Spawn one wraith in each dedicated spawn room
    for (let i = 0; i < Math.min(3, map.wraithSpawnRooms.length); i++) {
      const room = map.wraithSpawnRooms[i];
      
      // Calculate world position from grid coordinates (center of cell) with maze offset
      const worldX = map.mazeOffsetX + (room.gridX * map.cellSize) + (map.cellSize / 2);
      const worldY = map.mazeOffsetY + (room.gridY * map.cellSize) + (map.cellSize / 2);
      
      const wraith = new Wraith(worldX, worldY, i);
      wraith.speed = speeds[i] || 1.0;
      this.wraiths.push(wraith);
      
      console.log(`Wraith ${i} spawned in room ${room.id} at world (${Math.round(worldX)}, ${Math.round(worldY)})`);
    }
  }

  spawnWraithsFallback(mapWidth, mapHeight, map) {
    // Fallback spawning if spawn rooms aren't available
    const wraithCount = 3;
    const speeds = [1.5, 1.3, 1.7];
    
    let fallbackPositions;
    if (map && map.mazeOffsetX && map.mazeOffsetY) {
      // Spawn within the centered maze area
      const centerX = map.mazeOffsetX + map.mazeWidth / 2;
      const centerY = map.mazeOffsetY + map.mazeHeight / 2;
      
      fallbackPositions = [
        { x: centerX - 100, y: centerY + 50 },
        { x: centerX + 100, y: centerY + 50 },
        { x: centerX, y: centerY - 50 }
      ];
    } else {
      // Original fallback positions
      fallbackPositions = [
        { x: mapWidth * 0.2, y: mapHeight * 0.8 },
        { x: mapWidth * 0.8, y: mapHeight * 0.8 },
        { x: mapWidth * 0.8, y: mapHeight * 0.5 }
      ];
    }
    
    for (let i = 0; i < wraithCount; i++) {
      const pos = fallbackPositions[i];
      const wraith = new Wraith(pos.x, pos.y, i);
      wraith.speed = speeds[i] || 1.0;
      this.wraiths.push(wraith);
      
      console.log(`Wraith ${i} spawned at fallback position (${pos.x}, ${pos.y})`);
    }
    
    console.log(`DEBUG: Fallback spawning complete. Total wraiths: ${this.wraiths.length}`);
  }



  update(player, map) {
    for (const wraith of this.wraiths) {
      wraith.update(player, map);
    }
  }

  draw(ctx, camera) {
    for (const wraith of this.wraiths) {
      // Only draw if in camera view for performance
      if (camera.isInView({
        x: wraith.x - wraith.radius, 
        y: wraith.y - wraith.radius, 
        width: wraith.radius * 2, 
        height: wraith.radius * 2
      })) {
        wraith.draw(ctx);
      }
    }
  }

  getWraiths() {
    return this.wraiths;
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Wraith, WraithManager };
} 