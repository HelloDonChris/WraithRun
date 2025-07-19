class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.walls = [];
    this.safeRooms = [];
    this.entrance = null;
    this.exit = null;

    this.generate();
  }

  generate() {
    console.log("Generating recursive backtracking maze...");
    this.generateRecursiveBacktrackingMaze();
  }

  generateRecursiveBacktrackingMaze() {
    console.log("🔧 MAZE: Generating recursive backtracking maze...");

    // Clear existing data
    this.walls = [];
    this.safeRooms = [];

    // Setup basic maze parameters
    const cellSize = 40;
    this.cellSize = cellSize;
    this.gridWidth = 18;
    this.gridHeight = 13;

    this.mazeWidth = this.gridWidth * cellSize;
    this.mazeHeight = this.gridHeight * cellSize;
    this.mazeOffsetX = (this.width - this.mazeWidth) / 2;
    this.mazeOffsetY = (this.height - this.mazeHeight) / 2;

    // Generate maze using recursive backtracking
    this.createRecursiveBacktrackingMaze();

    // Post-processing
    this.createEntranceExit();
    this.ensureConnectivity();
    this.createWraithSpawnRooms();
    this.convertGridToWalls();
    this.addSafeRooms();

    console.log("✅ MAZE: Recursive backtracking maze generated successfully");
  }



  createRecursiveBacktrackingMaze() {
    // Initialize all cells as walls
    this.initializeAllWalls();

    const stack = [];
    const visited = new Set();

    // Start from center top
    const start = { x: Math.floor(this.gridWidth / 2), y: 1 };
    stack.push(start);
    visited.add(`${start.x},${start.y}`);
    this.grid[start.y][start.x] = false;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, visited);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.removeWallBetween(current, next);
        visited.add(`${next.x},${next.y}`);
        stack.push(next);
      } else {
        stack.pop();
      }
    }
  }

  // Helper methods for maze generation
  initializeAllWalls() {
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x] = true; // All walls initially
      }
    }
  }

  getUnvisitedNeighbors(cell, visited) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -2 }, { dx: 2, dy: 0 },
      { dx: 0, dy: 2 }, { dx: -2, dy: 0 }
    ];

    for (const dir of directions) {
      const nx = cell.x + dir.dx;
      const ny = cell.y + dir.dy;

      if (nx > 0 && nx < this.gridWidth - 1 &&
        ny > 0 && ny < this.gridHeight - 1 &&
        !visited.has(`${nx},${ny}`)) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  removeWallBetween(cell1, cell2) {
    const wallX = (cell1.x + cell2.x) / 2;
    const wallY = (cell1.y + cell2.y) / 2;
    this.grid[wallY][wallX] = false;
    this.grid[cell2.y][cell2.x] = false;
  }



  // Ensure entrance and exit are connected to the maze
  ensureConnectivity() {
    const centerX = Math.floor(this.gridWidth / 2);

    // Only ensure minimal connectivity - just entrance and exit access
    // Don't create a full spine that might override the maze algorithm

    // Ensure entrance connectivity (just 2 cells down)
    this.grid[1][centerX] = false;
    if (this.gridHeight > 3) {
      this.grid[2][centerX] = false;
    }

    // Ensure exit connectivity (just 2 cells up)
    this.grid[this.gridHeight - 2][centerX] = false;
    if (this.gridHeight > 3) {
      this.grid[this.gridHeight - 3][centerX] = false;
    }

    console.log(`🔗 CONNECTIVITY: Ensured minimal connectivity for entrance/exit at column ${centerX}`);
  }

  createEntranceExit() {
    const centerX = Math.floor(this.gridWidth / 2);
    this.grid[0][centerX] = false;
    this.grid[this.gridHeight - 1][centerX] = false;

    this.entrance = {
      x: this.mazeOffsetX + (centerX * this.cellSize),
      y: this.mazeOffsetY - 20,
      width: this.cellSize,
      height: 40
    };

    this.exit = {
      x: this.mazeOffsetX + (centerX * this.cellSize),
      y: this.mazeOffsetY + this.mazeHeight - 20,
      width: this.cellSize,
      height: 40
    };
  }

  createWraithSpawnRooms() {
    this.wraithSpawnRooms = [
      { gridX: 2, gridY: 2, size: 1, id: 0 },
      { gridX: this.gridWidth - 3, gridY: 2, size: 1, id: 1 },
      { gridX: this.gridWidth - 3, gridY: this.gridHeight - 3, size: 1, id: 2 }
    ];

    for (const room of this.wraithSpawnRooms) {
      this.grid[room.gridY][room.gridX] = false;
    }
  }

  convertGridToWalls() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.grid[y][x]) { // If it's a wall in the grid
          const worldX = this.mazeOffsetX + (x * this.cellSize);
          const worldY = this.mazeOffsetY + (y * this.cellSize);

          // Add wall blocks to fill the cell
          for (let wy = worldY; wy < worldY + this.cellSize; wy += 25) {
            for (let wx = worldX; wx < worldX + this.cellSize; wx += 25) {
              this.walls.push({ x: wx, y: wy, size: 25 });
            }
          }
        }
      }
    }
  }

  addSafeRooms() {
    // Find dead ends for safe rooms
    const safeSpots = this.findDeadEnds();

    safeSpots.forEach(spot => {
      const worldX = this.mazeOffsetX + (spot.x * this.cellSize) + (this.cellSize / 2);
      const worldY = this.mazeOffsetY + (spot.y * this.cellSize) + (this.cellSize / 2);
      const roomSize = this.cellSize * 0.7;

      this.safeRooms.push({
        x: worldX - roomSize / 2,
        y: worldY - roomSize / 2,
        size: roomSize
      });
    });
  }

  findDeadEnds() {
    const spots = [];

    for (let y = 1; y < this.gridHeight - 1; y++) {
      for (let x = 1; x < this.gridWidth - 1; x++) {
        if (!this.grid[y][x]) { // If it's a path
          const pathNeighbors = this.countPathNeighbors(x, y);
          if (pathNeighbors === 1) {
            spots.push({ x, y });
          }
        }
      }
    }

    // Select 3 spots distributed vertically
    spots.sort((a, b) => a.y - b.y);
    const selectedSpots = [];
    if (spots.length > 0) {
      const earlyIndex = Math.floor(spots.length * 0.2);
      const middleIndex = Math.floor(spots.length * 0.5);
      const lateIndex = Math.floor(spots.length * 0.8);

      if (spots[earlyIndex]) selectedSpots.push(spots[earlyIndex]);
      if (spots[middleIndex]) selectedSpots.push(spots[middleIndex]);
      if (spots[lateIndex]) selectedSpots.push(spots[lateIndex]);
    }

    return selectedSpots;
  }

  countPathNeighbors(x, y) {
    let count = 0;
    const directions = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx >= 0 && nx < this.gridWidth &&
        ny >= 0 && ny < this.gridHeight &&
        !this.grid[ny][nx]) {
        count++;
      }
    }

    return count;
  }

  // === COLLISION DETECTION (Used by Player & Wraiths) ===

  isWall(px, py) {
    if (!this.grid || !this.gridWidth || !this.gridHeight) {
      return true;
    }

    const gridX = Math.floor((px - this.mazeOffsetX) / this.cellSize);
    const gridY = Math.floor((py - this.mazeOffsetY) / this.cellSize);

    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return true;
    }

    return this.grid[gridY][gridX];
  }

  canMoveTo(x, y, radius) {
    if (x < radius || x > this.width - radius ||
      y < radius || y > this.height - radius) {
      return false;
    }

    const checkPositions = [
      { x: x - radius, y: y - radius },
      { x: x + radius, y: y - radius },
      { x: x - radius, y: y + radius },
      { x: x + radius, y: y + radius }
    ];

    for (let pos of checkPositions) {
      if (this.isWall(pos.x, pos.y)) {
        return false;
      }
    }

    return true;
  }

  // === GAME STATE CHECKS (Used by Player) ===

  isInSafeRoom(px, py) {
    return this.safeRooms.some(r => {
      return (
        px > r.x && px < r.x + r.size &&
        py > r.y && py < r.y + r.size
      );
    });
  }

  isInExit(px, py) {
    return (
      px > this.exit.x && px < this.exit.x + this.exit.width &&
      py > this.exit.y && py < this.exit.y + this.exit.height
    );
  }

  getPlayerStartPosition() {
    return {
      x: this.entrance.x + this.entrance.width / 2,
      y: this.mazeOffsetY + this.cellSize / 2
    };
  }

  // === RENDERING ===

  draw(ctx, camera) {
    // Draw background
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw walls
    ctx.fillStyle = "#222";
    for (let wall of this.walls) {
      if (camera.isInView(wall)) {
        ctx.fillRect(wall.x, wall.y, wall.size, wall.size);
      }
    }

    // Draw entrance
    if (camera.isInView(this.entrance)) {
      ctx.fillStyle = "#0066ff";
      ctx.fillRect(this.entrance.x, this.entrance.y, this.entrance.width, this.entrance.height);
      ctx.strokeStyle = "#0099ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.entrance.x, this.entrance.y, this.entrance.width, this.entrance.height);
    }

    // Draw exit
    if (camera.isInView(this.exit)) {
      ctx.fillStyle = "#ff6600";
      ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
      ctx.strokeStyle = "#ff9900";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
    }

    // Draw safe rooms
    for (let r of this.safeRooms) {
      if (camera.isInView({ x: r.x, y: r.y, width: r.size, height: r.size })) {
        ctx.fillStyle = "#2d5a2d";
        ctx.fillRect(r.x, r.y, r.size, r.size);
        ctx.strokeStyle = "#44aa44";
        ctx.lineWidth = 3;
        ctx.strokeRect(r.x, r.y, r.size, r.size);

        // Add inner glow
        ctx.fillStyle = "#55bb55";
        const glowSize = r.size * 0.4;
        ctx.fillRect(
          r.x + (r.size - glowSize) / 2,
          r.y + (r.size - glowSize) / 2,
          glowSize,
          glowSize
        );
      }
    }

    // Draw wraith spawn rooms in debug mode
    if (window.game && window.game.config.debug && this.wraithSpawnRooms) {
      for (let room of this.wraithSpawnRooms) {
        const worldX = this.mazeOffsetX + (room.gridX * this.cellSize);
        const worldY = this.mazeOffsetY + (room.gridY * this.cellSize);
        const worldSize = room.size * this.cellSize;

        if (camera.isInView({ x: worldX, y: worldY, width: worldSize, height: worldSize })) {
          ctx.strokeStyle = "#ff4444";
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]);
          ctx.strokeRect(worldX, worldY, worldSize, worldSize);
          ctx.setLineDash([]);

          ctx.fillStyle = "#ff4444";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            `SPAWN ${room.id}`,
            worldX + worldSize / 2,
            worldY + worldSize / 2
          );
        }
      }
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Map;
}