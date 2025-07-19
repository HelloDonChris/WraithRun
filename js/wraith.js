class Wraith {
  constructor(x, y, id = 0) {
    this.x = x;
    this.y = y;
    this.speed = 1.0;
    this.radius = 15;
    this.id = id;
  }

  update(player, map) {
    // Don't chase player if they're in a safe room
    if (map.isInSafeRoom(player.x, player.y)) {
      return;
    }

    // Use simple direct movement toward player
    this.moveTowardPlayer(player, map);
  }

  moveTowardPlayer(player, map) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const normalizedDx = dx / dist;
      const normalizedDy = dy / dist;

      let newX = this.x + normalizedDx * this.speed;
      let newY = this.y + normalizedDy * this.speed;

      // Simple wall avoidance - try alternative directions if blocked
      if (map.isWall(newX, newY)) {
        if (!map.isWall(this.x + normalizedDx * this.speed, this.y)) {
          // Move horizontally only
          newX = this.x + normalizedDx * this.speed;
          newY = this.y;
        } else if (!map.isWall(this.x, this.y + normalizedDy * this.speed)) {
          // Move vertically only
          newX = this.x;
          newY = this.y + normalizedDy * this.speed;
        } else {
          // Can't move, stay in place
          newX = this.x;
          newY = this.y;
        }
      }

      this.x = newX;
      this.y = newY;
    }
  }

  draw(ctx) {
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

    const speeds = [0.8, 0.6, 0.9]; // Slower speeds for better gameplay

    // Spawn one wraith in each dedicated spawn room
    for (let i = 0; i < Math.min(3, map.wraithSpawnRooms.length); i++) {
      const room = map.wraithSpawnRooms[i];

      // Calculate world position from grid coordinates
      const worldX = map.mazeOffsetX + (room.gridX * map.cellSize) + (map.cellSize / 2);
      const worldY = map.mazeOffsetY + (room.gridY * map.cellSize) + (map.cellSize / 2);

      const wraith = new Wraith(worldX, worldY, i);
      wraith.speed = speeds[i] || 1.0;
      this.wraiths.push(wraith);

      console.log(`Wraith ${i} spawned at (${Math.round(worldX)}, ${Math.round(worldY)})`);
    }
  }

  spawnWraithsFallback(mapWidth, mapHeight, map) {
    const wraithCount = 3;
    const speeds = [0.8, 0.6, 0.9]; // Slower speeds for better gameplay

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