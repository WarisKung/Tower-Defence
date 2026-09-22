/**
 * ASTRA: Aether Guardians — Input Manager
 * Mouse/touch handling for canvas interactions
 */
export class InputManager {
  constructor(gameManager) {
    this.gm = gameManager;
    this.enabled = false;
    this.hoveredTile = null;
    this.hoveredTowerSpot = null;

    // Bind handlers
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);

    // Attach to entity canvas (top interactive layer)
    this.canvas = gameManager.entityCanvas;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('contextmenu', this._onContextMenu);
  }

  disable() {
    this.enabled = false;
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    this.hoveredTile = null;
    this.hoveredTowerSpot = null;
  }

  /**
   * Convert mouse event coordinates to game world coordinates
   */
  _getGameCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.gm.gameWidth / rect.width;
    const scaleY = this.gm.gameHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _onMouseMove(e) {
    if (!this.enabled) return;

    const { x, y } = this._getGameCoords(e);

    // Convert to world coords through camera
    const world = this.gm.camera.screenToWorld(x, y);

    if (this.gm.gridManager) {
      const grid = this.gm.gridManager.screenToGrid(world.x, world.y);
      this.hoveredTile = this.gm.gridManager.isValid(grid.col, grid.row) ? grid : null;
      this.hoveredTowerSpot = null;
    } else {
      this.hoveredTile = null;
      this.hoveredTowerSpot = this.gm.getTowerSpotAt(world.x, world.y);
    }
  }

  _onClick(e) {
    if (!this.enabled) return;

    const { x, y } = this._getGameCoords(e);
    const world = this.gm.camera.screenToWorld(x, y);
    // If we have a unit type selected, try to place it
    if (this.gm.selectedUnitType) {
      let success = false;
      if (this.gm.gridManager) {
        const grid = this.gm.gridManager.screenToGrid(world.x, world.y);
        success = this.gm.gridManager.isValid(grid.col, grid.row)
          && this.gm.placeUnit(grid.col, grid.row, this.gm.selectedUnitType);
      } else {
        const spot = this.gm.getTowerSpotAt(world.x, world.y);
        success = Boolean(spot) && this.gm.placeUnitAtTowerSpot(spot.id, this.gm.selectedUnitType);
      }
      if (success) {
        this.gm.hud.update();
      }
      return;
    }

    // Otherwise check if we clicked on a placed unit
    const clickedUnit = this._findUnitAt(world.x, world.y);
    if (clickedUnit) {
      this.gm.selectedPlacedUnit = clickedUnit;
      this.gm.unitInfoPanel.show(clickedUnit);
    } else {
      this.gm.selectedPlacedUnit = null;
      this.gm.unitInfoPanel.hide();
    }
  }

  _onContextMenu(e) {
    e.preventDefault();
    // Right click deselects
    this.gm.selectedUnitType = null;
    this.gm.selectedPlacedUnit = null;
    this.gm.unitInfoPanel.hide();
    this.gm.hud.deselectUnit();
  }

  /**
   * Find a placed unit near the click position
   */
  _findUnitAt(worldX, worldY) {
    const threshold = 24;
    for (const unit of this.gm.units) {
      const dx = worldX - unit.x;
      const dy = worldY - unit.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        return unit;
      }
    }
    return null;
  }
}
