/**
 * ASTRA: Aether Guardians — Grid Manager
 * Isometric grid system with tile management
 */
export class GridManager {
  /**
   * @param {Object} gridData - { cols, rows, tiles: 2D array of tile types }
   * @param {number} tileSize - base tile width (height is half)
   */
  constructor(gridData, tileSize = 64, offsetX = 0, offsetY = -120) {
    this.cols = gridData.cols;
    this.rows = gridData.rows;
    this.tileWidth = tileSize;
    this.tileHeight = tileSize / 2;
    this.tiles = gridData.tiles;

    this.offsetX = offsetX;
    this.offsetY = offsetY; 

    // Occupied tiles (units placed)
    this.occupied = new Set();

    // Tile colors (normal mode)
    this.colors = {
      path:       { fill: '#1a1a35', stroke: '#2d2d55', glow: 'rgba(155, 89, 240, 0.15)' },
      placement:  { fill: '#141428', stroke: '#2a2a50', glow: 'rgba(77, 184, 255, 0.1)' },
      blocked:    { fill: '#0d0d1a', stroke: '#1a1a30', glow: 'none' },
      core:       { fill: '#1a1035', stroke: '#4db8ff', glow: 'rgba(77, 184, 255, 0.3)' },
      highlight:  { fill: 'rgba(77, 184, 255, 0.15)', stroke: 'rgba(77, 184, 255, 0.6)' },
      valid:      { fill: 'rgba(34, 197, 94, 0.2)', stroke: 'rgba(34, 197, 94, 0.8)' },
      invalid:    { fill: 'rgba(239, 68, 68, 0.2)', stroke: 'rgba(239, 68, 68, 0.8)' },
    };

    // Tile colors (overlay mode — when background image is drawn)
    this.overlayColors = {
      path:       { fill: 'rgba(140, 80, 220, 0.10)', stroke: 'rgba(180, 100, 255, 0.50)' },
      placement:  { fill: 'rgba(77, 184, 255, 0.08)', stroke: 'rgba(77, 184, 255, 0.45)' },
      blocked:    { fill: 'rgba(0,0,0,0)',             stroke: 'rgba(0,0,0,0)' },
      core:       { fill: 'rgba(77, 184, 255, 0.15)', stroke: '#4db8ff' },
    };
  }

  /**
   * Convert grid (col, row) to screen (x, y) — isometric projection
   */
  gridToScreen(col, row) {
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
          colors = palette[['blocked','path','placement','core'][tileType]] || palette.blocked;
        } else {
          colors = this._getTileColors(tileType);
        }

        this._drawIsometricTile(ctx, x, y, colors.fill, colors.stroke);

        // Draw subtle marker on placement tiles
        if (tileType === 2 && !this.occupied.has(`${col},${row}`)) {
          this._drawPlacementMarker(ctx, x, y, overlayMode);
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
      default: return this.colors.blocked;
    }
  }

  _drawIsometricTile(ctx, x, y, fillColor, strokeColor, lineWidth = 1) {
    const hw = this.tileWidth / 2;
    const hh = this.tileHeight / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - hh);      // Top
    ctx.lineTo(x + hw, y);      // Right
    ctx.lineTo(x, y + hh);      // Bottom
    ctx.lineTo(x - hw, y);      // Left
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  _fillIsometricTile(ctx, x, y) {
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
}
