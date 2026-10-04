/**
 * ASTRA: Aether Guardians — Grid Manager
 * Isometric grid system with tile management
 */
export class GridManager {
  /**
   * @param {Object} gridData - { cols, rows, tiles: 2D array of tile types }
   * @param {number} tileSize - base tile width (height is half)
   */
  constructor(gridData, tileSize = 64, offsetX = 0, offsetY = -120, options = {}) {
    this.cols = gridData.cols;
    this.rows = gridData.rows;
    this.projection = options.projection || 'isometric';
    this.style = options.style || 'default';
    this.tileWidth = options.cellWidth || tileSize;
    this.tileHeight = options.cellHeight || (tileSize / 2);
    this.tiles = gridData.tiles;

    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // Occupied tiles (units placed)
    this.occupied = new Set();

    // Tile colors. Stage 1 gets a fallen-kingdom palette; Stage 2 keeps the existing forest palette.
    const fallen = this.style === 'fallen_kingdom';
    this.colors = {
      path: fallen
        ? { fill: '#c9a56a', stroke: '#80643a', glow: 'rgba(255, 202, 116, 0.10)' }
        : { fill: '#c29d59', stroke: '#8c6b36', glow: 'rgba(194, 157, 89, 0.1)' },
      placement: fallen
        ? { fill: '#2e7fa8', stroke: '#58d7ff', glow: 'rgba(77, 184, 255, 0.15)' }
        : { fill: '#4ade80', stroke: '#16a34a', glow: 'rgba(74, 222, 128, 0.15)' },
      blocked: fallen
        ? { fill: '#111b31', stroke: '#1c2b49', glow: 'none' }
        : { fill: '#14532d', stroke: '#064e3b', glow: 'none' },
      core: { fill: '#1a1035', stroke: '#4db8ff', glow: 'rgba(77, 184, 255, 0.3)' },
      spawn: { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
      highlight: { fill: 'rgba(255, 255, 255, 0.25)', stroke: 'rgba(255, 255, 255, 0.8)' },
      valid: { fill: 'rgba(34, 197, 94, 0.4)', stroke: 'rgba(34, 197, 94, 0.9)' },
      invalid: { fill: 'rgba(239, 68, 68, 0.4)', stroke: 'rgba(239, 68, 68, 0.9)' },
    };

    // Tile colors (overlay mode — when background image is drawn)
    // Stage-image overlay palette: warm stone road + Aether blue/cyan UI accents.
    this.overlayColors = {
      path: { fill: 'rgba(224, 184, 112, 0.08)', stroke: 'rgba(255, 214, 135, 0.34)' },
      placement: { fill: 'rgba(77, 184, 255, 0.07)', stroke: 'rgba(105, 218, 255, 0.42)' },
      blocked: { fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)' },
      core: { fill: 'rgba(77, 184, 255, 0.12)', stroke: '#69daff' },
      spawn: { fill: 'rgba(255, 77, 109, 0.10)', stroke: '#ff4d6d' },
    };
  }

  /**
   * Convert grid (col, row) to screen (x, y) — isometric projection
   */
  gridToScreen(col, row) {
    if (this.projection === 'orthographic') {
      return {
        x: this.offsetX + (col + 0.5) * this.tileWidth,
        y: this.offsetY + (row + 0.5) * this.tileHeight,
      };
    }

    const x = this.offsetX + (col - row) * (this.tileWidth / 2);
    const y = this.offsetY + (col + row) * (this.tileHeight / 2);
    return { x, y };
  }

  /**
   * Convert screen (x, y) to grid (col, row) — inverse isometric
   */
  screenToGrid(screenX, screenY) {
    const relX = screenX - this.offsetX;
    const relY = screenY - this.offsetY;

    if (this.projection === 'orthographic') {
      return {
        col: Math.floor(relX / this.tileWidth),
        row: Math.floor(relY / this.tileHeight),
      };
    }

    const col = Math.floor((relX / (this.tileWidth / 2) + relY / (this.tileHeight / 2)) / 2);
    const row = Math.floor((relY / (this.tileHeight / 2) - relX / (this.tileWidth / 2)) / 2);

    return { col, row };
  }

  /**
   * Check if grid coordinates are valid
   */
  isValid(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  /**
   * Get tile type at position
   */
  getTileType(col, row) {
    if (!this.isValid(col, row)) return -1;
    return this.tiles[row][col];
  }

  /**
   * Check if a unit can be placed at position
   */
  canPlace(col, row) {
    if (!this.isValid(col, row)) return false;
    if (this.getTileType(col, row) !== 2) return false; // Must be placement tile
    if (this.occupied.has(`${col},${row}`)) return false;
    return true;
  }

  /**
   * Mark a tile as occupied
   */
  markOccupied(col, row) {
    this.occupied.add(`${col},${row}`);
  }

  /**
   * Unmark a tile
   */
  markUnoccupied(col, row) {
    this.occupied.delete(`${col},${row}`);
  }

  /**
   * Render the isometric grid
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} overlayMode - if true, tiles are semi-transparent over a background image
   */
  renderGrid(ctx, overlayMode = false) {
    const palette = overlayMode ? this.overlayColors : null;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tileType = this.tiles[row][col];
        if (tileType === -1) continue;

        const { x, y } = this.gridToScreen(col, row);

        let colors;
        if (palette) {
          // Overlay mode — blocked tiles are invisible
          if (tileType === 0) continue;
          colors = palette[['blocked', 'path', 'placement', 'core', 'spawn'][tileType]] || palette.blocked;
        } else {
          colors = this._getTileColors(tileType);
        }

        this._drawIsometricTile(ctx, x, y, colors.fill, colors.stroke);

        // Draw subtle marker on placement tiles
        if (tileType === 2 && !this.occupied.has(`${col},${row}`)) {
          this._drawPlacementMarker(ctx, x, y, overlayMode);
        }

        // Stage 1 gets restrained ruined-kingdom props instead of forest trees.
        if (tileType === 0 && !overlayMode) {
          if (this.style === 'fallen_kingdom') {
            this._drawFallenKingdomDecoration(ctx, x, y, col, row);
          } else {
            this._drawTree(ctx, x, y, col, row);
          }
        }
      }
    }
  }

  /**
   * Render path direction indicators
   */
  renderPaths(ctx) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === 1) {
          const { x, y } = this.gridToScreen(col, row);
          // Subtle path glow
          ctx.fillStyle = this.colors.path.glow;
          this._fillIsometricTile(ctx, x, y);
        }
      }
    }
  }

  /**
   * Find the single connected route from spawn tile (4) to core tile (3).
   * Stage 1 uses this instead of a manually-authored `paths` array.
   */
  getPathFromGrid() {
    const start = this._findTile(4);
    const goal = this._findTile(3);
    if (!start || !goal) return [];

    const queue = [start];
    const visited = new Set([`${start.col},${start.row}`]);
    const previous = new Map();
    const directions = [
      { col: 1, row: 0 },
      { col: -1, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: -1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.col === goal.col && current.row === goal.row) break;

      for (const dir of directions) {
        const next = {
          col: current.col + dir.col,
          row: current.row + dir.row,
        };
        if (!this.isValid(next.col, next.row)) continue;

        const type = this.getTileType(next.col, next.row);
        if (type !== 1 && type !== 3) continue;

        const key = `${next.col},${next.row}`;
        if (visited.has(key)) continue;

        visited.add(key);
        previous.set(key, current);
        queue.push(next);
      }
    }

    const goalKey = `${goal.col},${goal.row}`;
    if (!visited.has(goalKey)) return [];

    const result = [];
    let current = goal;
    while (current) {
      result.unshift(current);
      const prev = previous.get(`${current.col},${current.row}`);
      current = prev || null;
    }
    return result;
  }

  getSpawnPosition() {
    const spawn = this._findTile(4);
    return spawn ? this.gridToScreen(spawn.col, spawn.row) : null;
  }

  _findTile(tileType) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === tileType) {
          return { col, row };
        }
      }
    }
    return null;
  }

  renderSpawns(ctx) {
    const spawn = this._findTile(4);
    if (!spawn) return;

    const { x, y } = this.gridToScreen(spawn.col, spawn.row);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 77, 109, 0.85)';
    ctx.fillStyle = 'rgba(255, 77, 109, 0.12)';
    ctx.lineWidth = 2;
    this._drawIsometricTile(ctx, x, y, ctx.fillStyle, ctx.strokeStyle, 2);
    ctx.restore();
  }

  /**
   * Render Aether Crystal core position
   */
  renderCore(ctx, corePos) {
    const { x, y } = this.gridToScreen(corePos.col, corePos.row);

    // Glow circle
    const gradient = ctx.createRadialGradient(x, y, 5, x, y, 40);
    gradient.addColorStop(0, 'rgba(77, 184, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(155, 89, 240, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Crystal diamond shape
    ctx.save();
    ctx.translate(x, y - 8);
    ctx.fillStyle = '#4db8ff';
    ctx.shadowColor = '#4db8ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Render tile highlight (hover)
   */
  renderHighlight(ctx, tile) {
    if (!tile || !this.isValid(tile.col, tile.row)) return;
    const { x, y } = this.gridToScreen(tile.col, tile.row);
    this._drawIsometricTile(ctx, x, y, this.colors.highlight.fill, this.colors.highlight.stroke, 2);
  }

  /**
   * Render placement indicator (valid/invalid)
   */
  renderPlacementIndicator(ctx, tile, isValid) {
    if (!tile) return;
    const { x, y } = this.gridToScreen(tile.col, tile.row);
    const colors = isValid ? this.colors.valid : this.colors.invalid;
    this._drawIsometricTile(ctx, x, y, colors.fill, colors.stroke, 2);
  }

  // === Private Drawing Helpers ===

  _getTileColors(tileType) {
    switch (tileType) {
      case 0: return this.colors.blocked;
      case 1: return this.colors.path;
      case 2: return this.colors.placement;
      case 3: return this.colors.core;
      case 4: return this.colors.spawn;
      default: return this.colors.blocked;
    }
  }

  _drawIsometricTile(ctx, x, y, fillColor, strokeColor, lineWidth = 1) {
    if (this.projection === 'orthographic') {
      const left = x - this.tileWidth / 2;
      const top = y - this.tileHeight / 2;
      ctx.fillStyle = fillColor;
      ctx.fillRect(left, top, this.tileWidth, this.tileHeight);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(left, top, this.tileWidth, this.tileHeight);
      return;
    }

    const hw = this.tileWidth / 2;
    const hh = this.tileHeight / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - hh);
    ctx.lineTo(x + hw, y);
    ctx.lineTo(x, y + hh);
    ctx.lineTo(x - hw, y);
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  _fillIsometricTile(ctx, x, y) {
    if (this.projection === 'orthographic') {
      ctx.fillRect(
        x - this.tileWidth / 2,
        y - this.tileHeight / 2,
        this.tileWidth,
        this.tileHeight
      );
      return;
    }

    const hw = this.tileWidth / 2;
    const hh = this.tileHeight / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - hh);
    ctx.lineTo(x + hw, y);
    ctx.lineTo(x, y + hh);
    ctx.lineTo(x - hw, y);
    ctx.closePath();
    ctx.fill();
  }

  _drawPlacementMarker(ctx, x, y, bright = false) {
    ctx.strokeStyle = bright ? 'rgba(77, 184, 255, 0.40)' : 'rgba(77, 184, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  }
  _drawFallenKingdomDecoration(ctx, x, y, col, row) {
    // Deterministic variation: decoration never changes between frames.
    const seed = Math.sin(col * 91.17 + row * 37.73) * 43758.5453;
    const r = seed - Math.floor(seed);
    if (r > 0.34) return;

    ctx.save();

    // Small ruined stone fragments.
    if (r < 0.13) {
      ctx.fillStyle = 'rgba(76, 87, 112, 0.72)';
      ctx.strokeStyle = 'rgba(139, 151, 180, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 8);
      ctx.lineTo(x - 5, y - 8);
      ctx.lineTo(x + 5, y - 3);
      ctx.lineTo(x + 13, y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(194, 157, 89, 0.22)';
      ctx.fillRect(x - 3, y - 5, 4, 8);
    }

    // Broken pillar / wall remnant.
    else if (r < 0.24) {
      const h = 12 + r * 24;
      ctx.fillStyle = 'rgba(47, 57, 79, 0.86)';
      ctx.fillRect(x - 7, y - h, 14, h);
      ctx.fillStyle = 'rgba(105, 119, 145, 0.40)';
      ctx.fillRect(x - 6, y - h, 12, 3);
      ctx.fillStyle = 'rgba(20, 25, 42, 0.65)';
      ctx.fillRect(x - 2, y - h + 7, 4, Math.max(4, h - 11));
    }

    // Tiny Aether crystal shard.
    else {
      const glow = ctx.createRadialGradient(x, y - 9, 1, x, y - 9, 18);
      glow.addColorStop(0, 'rgba(79, 209, 255, 0.24)');
      glow.addColorStop(1, 'rgba(79, 209, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y - 9, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4fd1ff';
      ctx.shadowColor = '#4fd1ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x + 5, y - 9);
      ctx.lineTo(x, y - 2);
      ctx.lineTo(x - 5, y - 9);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  _drawTree(ctx, x, y, col, row) {
    // Pseudo-random based on coordinates to keep it static per tile
    const rand = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
    const r = rand - Math.floor(rand);
    if (r > 0.4) return; // Only 40% of blocked tiles have trees

    const height = 15 + r * 25;

    // Trunk
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(x - 2, y - height, 4, height);

    // Leaves
    ctx.fillStyle = r > 0.2 ? '#22c55e' : '#16a34a';
    ctx.beginPath();
    ctx.arc(x, y - height, 12 + r * 10, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(x - 3, y - height - 3, 6 + r * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
