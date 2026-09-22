/**
 * ASTRA: Aether Guardians — Game Manager
 * Finite State Machine for game state management
 */
import { GameLoop } from './GameLoop.js';
import { GridManager } from './GridManager.js';
import { Camera } from './Camera.js';
import { InputManager } from './InputManager.js';
import { AetherResourceSystem } from './AetherResourceSystem.js';
import { WaveManager } from './WaveManager.js';
import { HUDController } from '../ui/HUDController.js';
import { UnitInfoPanel } from '../ui/UnitInfoPanel.js';
import { MainMenu } from '../ui/MainMenu.js';
import { StageSelect } from '../ui/StageSelect.js';
import { ResultScreen } from '../ui/ResultScreen.js';
import { DialogueSystem } from '../ui/DialogueSystem.js';
import { SceneTransition } from '../ui/SceneTransition.js';
import { SaveManager } from '../utils/SaveManager.js';
import { SoundManager } from '../utils/SoundManager.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { Projectile } from '../entities/Projectile.js';
import { UNIT_DATA } from '../data/unitData.js';
import { ENEMY_DATA } from '../data/enemyData.js';
import { STAGE_DATA } from '../data/stageData.js';
import { createUnit } from '../entities/units/UnitFactory.js';
import { createEnemy } from '../entities/enemies/EnemyFactory.js';

/**
 * Game states enum
 */
export const GameState = {
  MENU: 'MENU',
  STAGE_SELECT: 'STAGE_SELECT',
  PRE_BATTLE: 'PRE_BATTLE',   // Dialogue/cutscene before battle
  BATTLE: 'BATTLE',
  PAUSE: 'PAUSE',
  POST_BATTLE: 'POST_BATTLE', // Dialogue after battle
  RESULT: 'RESULT',
};

export class GameManager {
  constructor() {
    // State
    this.state = GameState.MENU;
    this.previousState = null;

    // Canvas setup
    this.bgCanvas = document.getElementById('bg-canvas');
    this.entityCanvas = document.getElementById('entity-canvas');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.entityCtx = this.entityCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');

    // Game dimensions
    this.gameWidth = 1280;
    this.gameHeight = 720;

    // Core systems
    this.gameLoop = new GameLoop();
    this.camera = new Camera(this.gameWidth, this.gameHeight);
    this.gridManager = null;
    this.towerSpots = [];
    this.inputManager = null;
    this.resourceSystem = null;
    this.waveManager = null;
    this.saveManager = new SaveManager();
    this.soundManager = new SoundManager();

    // UI systems
    this.hud = null;
    this.unitInfoPanel = null;
    this.mainMenu = null;
    this.stageSelect = null;
    this.resultScreen = null;
    this.dialogueSystem = null;
    this.sceneTransition = null;

    // Game entities
    this.units = [];
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];

    // Object pools
    this.projectilePool = new ObjectPool(() => new Projectile(), 50);

    // Battle state
    this.currentStageId = null;
    this.currentStageData = null;
    this.coreHP = 20;
    this.coreMaxHP = 20;
    this.selectedUnitType = null;
    this.selectedPlacedUnit = null;
    this.isWaveActive = false;

    // Player data
    this.playerData = this.saveManager.load();

    this._setupCanvases();
  }

  /**
   * Initialize and start the game
   */
  init() {
    console.log('[ASTRA] Initializing game...');

    // Initialize UI systems
    this._initUI();

    // Start game loop
    this.gameLoop.start(
      (dt) => this.update(dt),
      (interp) => this.render(interp)
    );

    // Transition to main menu
    this.setState(GameState.MENU);
    console.log('[ASTRA] Game initialized successfully!');
  }

  /**
   * Setup canvas dimensions and scaling
   */
  _setupCanvases() {
    const canvases = [this.bgCanvas, this.entityCanvas, this.fxCanvas];
    canvases.forEach(canvas => {
      canvas.width = this.gameWidth;
      canvas.height = this.gameHeight;
    });
    this._handleResize();
    window.addEventListener('resize', () => this._handleResize());
  }

  _handleResize() {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const canvases = [this.bgCanvas, this.entityCanvas, this.fxCanvas];
    canvases.forEach(canvas => {
      // Fill the viewport. The map and its normalized coordinates stretch
      // together, so no letterboxing is introduced on non-16:9 displays.
      canvas.style.width = `${windowW}px`;
      canvas.style.height = `${windowH}px`;
    });

    // Store scale for input coordinate conversion
    this.displayScaleX = windowW / this.gameWidth;
    this.displayScaleY = windowH / this.gameHeight;
    this.displayOffsetX = 0;
    this.displayOffsetY = 0;
  }

  /**
   * Initialize UI systems
   */
  _initUI() {
    this.sceneTransition = new SceneTransition();
    this.mainMenu = new MainMenu(this);
    this.stageSelect = new StageSelect(this);
    this.hud = new HUDController(this);
    this.unitInfoPanel = new UnitInfoPanel(this);
    this.resultScreen = new ResultScreen(this);
    this.dialogueSystem = new DialogueSystem(this);
  }

  /**
   * Change game state with transition
   */
  async setState(newState) {
    const oldState = this.state;
    this.previousState = oldState;
    this.state = newState;

    console.log(`[ASTRA] State: ${oldState} → ${newState}`);

    // Handle state exit
    this._onStateExit(oldState);

    // Handle state enter
    this._onStateEnter(newState);
  }

  _onStateExit(state) {
    switch (state) {
      case GameState.MENU:
        this._hideScreen('main-menu-screen');
        break;
      case GameState.STAGE_SELECT:
        this._hideScreen('stage-select-screen');
        break;
      case GameState.BATTLE:
      case GameState.PAUSE:
        break;
      case GameState.RESULT:
        this._hideScreen('result-screen');
        break;
    }
  }

  _onStateEnter(state) {
    switch (state) {
      case GameState.MENU:
        this._showScreen('main-menu-screen');
        this._hideScreen('game-container');
        this.mainMenu.show();
        break;

      case GameState.STAGE_SELECT:
        this._showScreen('stage-select-screen');
        this.stageSelect.show();
        break;

      case GameState.PRE_BATTLE:
        this._startBattle();
        break;

      case GameState.BATTLE:
        this._showScreen('game-container');
        if (this.inputManager) {
          this.inputManager.enable();
        }
        break;

      case GameState.PAUSE:
        document.getElementById('pause-overlay').classList.remove('hidden');
        break;

      case GameState.RESULT:
        this._showResultScreen();
        break;
    }
  }

  /**
   * Start a battle stage
   */
  _startBattle() {
    const stageData = STAGE_DATA[this.currentStageId];
    if (!stageData) {
      console.error(`[ASTRA] Stage not found: ${this.currentStageId}`);
      this.setState(GameState.STAGE_SELECT);
      return;
    }

    this.currentStageData = stageData;

    // Reset battle state
    this.units = [];
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.coreHP = stageData.coreHP;
    this.coreMaxHP = this.coreHP;
    this.selectedUnitType = null;
    this.selectedPlacedUnit = null;
    this.isWaveActive = false;

    // Stage 1 uses image-relative coordinates; earlier stages may still use a grid.
    this.gridManager = stageData.coordinateSystem === 'normalized'
      ? null
      : new GridManager(
        stageData.grid,
        stageData.tileSize || 64,
        stageData.gridOffsetX ?? 0,
        stageData.gridOffsetY ?? -120
      );
    this.towerSpots = (stageData.towerSpots || []).map(spot => ({ ...spot, occupied: false }));

    // Initialize resource system
    this.resourceSystem = new AetherResourceSystem(stageData.startingAether || 200);

    // Initialize wave manager
    this.waveManager = new WaveManager(stageData.waves, this);

    // Initialize input
    this.inputManager?.disable();
    this.inputManager = new InputManager(this);

    // Update HUD
    this.hud.init();

    // Show game container
    this._showScreen('game-container');

    // Render background grid (only once)
    this._renderBackground();

    // Enter battle state
    this.setState(GameState.BATTLE);
  }

  /**
   * Select a stage and start battle
   */
  selectStage(stageId) {
    this.currentStageId = stageId;
    this.setState(GameState.PRE_BATTLE);
  }

  /**
   * Main update loop — called at fixed timestep
   */
  update(dt) {
    if (this.state !== GameState.BATTLE) return;

    // Update resource system (passive Aether generation)
    if (this.isWaveActive) {
      this.resourceSystem.update(dt);
    }

    // Update wave manager
    if (this.isWaveActive) {
      this.waveManager.update(dt);
    }

    // Update units
    for (let i = this.units.length - 1; i >= 0; i--) {
      const unit = this.units[i];
      unit.update(dt, this.enemies, this);
      if (unit.isDead) {
        this.units.splice(i, 1);
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this);

      if (enemy.isDead) {
        // Grant rewards
        this.resourceSystem.addAether(enemy.rewardAether);
        this.enemies.splice(i, 1);
      } else if (enemy.reachedEnd) {
        // Damage core
        this.coreHP -= enemy.damageToCore;
        this.enemies.splice(i, 1);
        this.hud.onCoreHit();

        if (this.coreHP <= 0) {
          this.coreHP = 0;
          this._onDefeat();
          return;
        }
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);
      if (proj.isDead) {
        this.projectilePool.release(proj);
        this.projectiles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].life -= dt;
      this.floatingTexts[i].y -= 30 * dt;
      if (this.floatingTexts[i].life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update HUD
    this.hud.update();

    // Check victory
    if (this.waveManager.isComplete() && this.enemies.length === 0 && this.isWaveActive) {
      this._onVictory();
    }
  }

  /**
   * Main render loop — called every frame
   */
  render(interpolation) {
    if (this.state !== GameState.BATTLE && this.state !== GameState.PAUSE) return;

    const ctx = this.entityCtx;
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

    // Apply camera transform
    ctx.save();
    this.camera.applyTransform(ctx);

    // Render grid highlight (hovered tile)
    if (this.gridManager && this.inputManager) {
      this.gridManager.renderHighlight(ctx, this.inputManager.hoveredTile);
    }

    // Render placement indicators
    if (this.selectedUnitType && this.gridManager && this.inputManager && this.inputManager.hoveredTile) {
      this.gridManager.renderPlacementIndicator(
        ctx,
        this.inputManager.hoveredTile,
        this.gridManager.canPlace(this.inputManager.hoveredTile.col, this.inputManager.hoveredTile.row)
      );
    }

    if (this.selectedUnitType && this.inputManager?.hoveredTowerSpot) {
      this._renderTowerSpotHighlight(ctx, this.inputManager.hoveredTowerSpot);
    }

    // Render enemies (sorted by Y for depth)
    const sortedEnemies = [...this.enemies].sort((a, b) => a.y - b.y);
    for (const enemy of sortedEnemies) {
      enemy.render(ctx, interpolation);
    }

    // Render units (sorted by Y for depth)
    const sortedUnits = [...this.units].sort((a, b) => a.y - b.y);
    for (const unit of sortedUnits) {
      unit.render(ctx, interpolation);
      // Highlight selected unit
      if (unit === this.selectedPlacedUnit) {
        unit.renderSelection(ctx);
        unit.renderRange(ctx);
      }
    }

    // Render projectiles
    for (const proj of this.projectiles) {
      proj.render(ctx, interpolation);
    }

    ctx.restore();

    // Render FX layer (floating texts, particles)
    const fxCtx = this.fxCtx;
    fxCtx.clearRect(0, 0, this.gameWidth, this.gameHeight);

    fxCtx.save();
    this.camera.applyTransform(fxCtx);

    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      fxCtx.globalAlpha = alpha;
      fxCtx.font = `bold ${ft.size || 16}px Outfit`;
      fxCtx.fillStyle = ft.color || '#ff4444';
      fxCtx.textAlign = 'center';
      fxCtx.fillText(ft.text, ft.x, ft.y);
    }
    fxCtx.globalAlpha = 1;
    fxCtx.restore();
  }

  /**
   * Render static background (isometric grid)
   */
  async _renderBackground() {
    const ctx = this.bgCtx;
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

    // Dark base
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

    const stageImagePath = this.currentStageData?.backgroundImage;

    if (this.currentStageData.coordinateSystem === 'normalized') {
      ctx.save();
      this.camera.applyTransform(ctx);
      const mapSize = this.currentStageData.mapSize || { width: this.gameWidth, height: this.gameHeight };
      const left = -mapSize.width / 2;
      const top = -mapSize.height / 2;

      if (stageImagePath) {
        await new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, left, top, mapSize.width, mapSize.height);
            resolve();
          };
          img.onerror = resolve;
          img.src = stageImagePath;
        });
      }

      this._renderNormalizedCore(ctx);
      this._renderTowerSpots(ctx);
      ctx.restore();
      return;
    }

    const tw = this.gridManager.tileWidth;
    const th = this.gridManager.tileHeight;
    const cols = this.gridManager.cols;
    const rows = this.gridManager.rows;
    const offX = this.gridManager.offsetX;
    const offY = this.gridManager.offsetY;

    // Compute grid bounding box in world space
    // leftmost = col=0,row=max; rightmost = col=max,row=0
    // topmost  = col=0,row=0;   bottommost = col=max,row=max
    const gLeft   = offX + (0 - (rows-1)) * (tw / 2);
    const gRight  = offX + ((cols-1) - 0) * (tw / 2);
    const gTop    = offY;
    const gBottom = offY + ((cols-1) + (rows-1)) * (th / 2);
    const gWidth  = gRight - gLeft;
    const gHeight = gBottom - gTop;

    ctx.save();
    this.camera.applyTransform(ctx);

    if (stageImagePath) {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Draw image in world space aligned to grid bounding box
          ctx.drawImage(img, gLeft, gTop, gWidth, gHeight);
          resolve();
        };
        img.onerror = () => {
          ctx.fillStyle = '#0a0a12';
          ctx.fillRect(gLeft, gTop, gWidth, gHeight);
          resolve();
        };
        img.src = stageImagePath;
      });
    }

    // Render grid overlay
    this.gridManager.renderGrid(ctx, !!stageImagePath);

    // Render path indicators
    this.gridManager.renderPaths(ctx);

    // Render core/crystal position
    if (this.currentStageData && this.currentStageData.corePosition) {
      this.gridManager.renderCore(ctx, this.currentStageData.corePosition);
    }

    ctx.restore();
  }

  /**
   * Place a unit on the grid
   */
  placeUnit(col, row, unitType) {
    const unitData = UNIT_DATA[unitType];
    if (!unitData) return false;

    // Check if we can place here
    if (!this.gridManager.canPlace(col, row)) return false;

    // Check cost
    if (!this.resourceSystem.canAfford(unitData.base_stats.cost)) return false;

    // Spend Aether
    this.resourceSystem.spendAether(unitData.base_stats.cost);

    // Create unit
    const screenPos = this.gridManager.gridToScreen(col, row);
    const unit = createUnit(unitType, screenPos.x, screenPos.y, unitData);
    unit.gridCol = col;
    unit.gridRow = row;

    this.units.push(unit);
    this.gridManager.markOccupied(col, row);

    // Deselect unit type
    this.selectedUnitType = null;
    this.hud.deselectUnit();

    return true;
  }

  placeUnitAtTowerSpot(spotId, unitType) {
    const spot = this.towerSpots.find(candidate => candidate.id === spotId);
    const unitData = UNIT_DATA[unitType];
    if (!spot || spot.occupied || !unitData || !this.resourceSystem.canAfford(unitData.base_stats.cost)) return false;

    this.resourceSystem.spendAether(unitData.base_stats.cost);
    const position = this.normalizedToWorld(spot);
    const unit = createUnit(unitType, position.x, position.y, unitData);
    unit.towerSpotId = spot.id;
    this.units.push(unit);
    spot.occupied = true;
    this.selectedUnitType = null;
    this.hud.deselectUnit();
    return true;
  }

  getTowerSpotAt(worldX, worldY) {
    const mapSize = this.currentStageData?.mapSize || { width: this.gameWidth, height: this.gameHeight };
    return this.towerSpots.find(spot => {
      if (spot.occupied) return false;
      const position = this.normalizedToWorld(spot);
      return Math.hypot(worldX - position.x, worldY - position.y) <= spot.radius * mapSize.width;
    }) || null;
  }

  releaseTowerSpot(spotId) {
    const spot = this.towerSpots.find(candidate => candidate.id === spotId);
    if (spot) spot.occupied = false;
  }

  normalizedToWorld(point) {
    const mapSize = this.currentStageData?.mapSize || { width: this.gameWidth, height: this.gameHeight };
    return {
      x: (point.x - 0.5) * mapSize.width,
      y: (point.y - 0.5) * mapSize.height,
    };
  }

  /**
   * Spawn an enemy from wave data
   */
  spawnEnemy(enemyType, pathIndex = 0) {
    const enemyData = ENEMY_DATA[enemyType];
    if (!enemyData) return;

    const path = this.currentStageData.paths[pathIndex] || this.currentStageData.paths[0];
    if (!path || path.length === 0) return;

    const normalizedPath = this.currentStageData.coordinateSystem === 'normalized' && this.currentStageData.spawn
      ? [this.currentStageData.spawn, ...path.slice(1)]
      : path;
    const startWaypoint = normalizedPath[0];
    const screenPos = this.currentStageData.coordinateSystem === 'normalized'
      ? this.normalizedToWorld(startWaypoint)
      : this.gridManager.gridToScreen(startWaypoint.col, startWaypoint.row);

    const enemy = createEnemy(enemyType, screenPos.x, screenPos.y, enemyData);

    // Convert path waypoints to screen coordinates
    enemy.setPath(normalizedPath.map(wp => this.currentStageData.coordinateSystem === 'normalized'
      ? this.normalizedToWorld(wp)
      : this.gridManager.gridToScreen(wp.col, wp.row)));

    this.enemies.push(enemy);
  }

  /**
   * Fire a projectile from unit to enemy
   */
  fireProjectile(fromX, fromY, target, damage, type = 'arrow', aoeRadius = 0) {
    const proj = this.projectilePool.get();
    proj.init(fromX, fromY, target, damage, type, aoeRadius, this.enemies);
    this.projectiles.push(proj);
  }

  /**
   * Add floating damage text
   */
  addFloatingText(x, y, text, color = '#ff4444', size = 16) {
    this.floatingTexts.push({
      x, y, text, color, size,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  /**
   * Start the next wave
   */
  startWave() {
    if (this.isWaveActive && !this.waveManager.isCurrentWaveComplete()) return;
    this.isWaveActive = true;
    this.waveManager.startNextWave();
    this.hud.onWaveStart();
  }

  _onVictory() {
    this.isWaveActive = false;
    const stars = this._calculateStars();

    // Save progress
    this.playerData.stagesCompleted[this.currentStageId] = {
      completed: true,
      stars: Math.max(stars, this.playerData.stagesCompleted[this.currentStageId]?.stars || 0),
    };
    this.saveManager.save(this.playerData);

    setTimeout(() => this.setState(GameState.RESULT), 1000);
    this._resultData = { victory: true, stars, exp: 500, gold: 300 };
  }

  _onDefeat() {
    this.isWaveActive = false;
    setTimeout(() => this.setState(GameState.RESULT), 1000);
    this._resultData = { victory: false, stars: 0, exp: 100, gold: 50 };
  }

  _calculateStars() {
    const hpPercent = this.coreHP / this.coreMaxHP;
    if (hpPercent >= 0.9) return 3;
    if (hpPercent >= 0.5) return 2;
    return 1;
  }

  _showResultScreen() {
    const data = this._resultData || { victory: false, stars: 0, exp: 0, gold: 0 };
    this.resultScreen.show(data);
    this._showScreen('result-screen');
  }

  /**
   * Pause / Resume
   */
  togglePause() {
    if (this.state === GameState.BATTLE) {
      this.setState(GameState.PAUSE);
      this.gameLoop.pause();
    } else if (this.state === GameState.PAUSE) {
      document.getElementById('pause-overlay').classList.add('hidden');
      this.state = GameState.BATTLE;
      this.gameLoop.resume();
    }
  }

  /**
   * Restart current stage
   */
  restart() {
    document.getElementById('pause-overlay').classList.add('hidden');
    this.gameLoop.resume();
    this._startBattle();
  }

  /**
   * Quit to menu
   */
  quitToMenu() {
    document.getElementById('pause-overlay').classList.add('hidden');
    this.gameLoop.resume();
    this.setState(GameState.MENU);
  }

  // === Screen Management ===
  _showScreen(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  _hideScreen(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  _renderNormalizedCore(ctx) {
    const core = this.currentStageData.core;
    if (!core) return;
    const { x, y } = this.normalizedToWorld(core);
    const gradient = ctx.createRadialGradient(x, y, 6, x, y, 42);
    gradient.addColorStop(0, 'rgba(77, 184, 255, 0.55)');
    gradient.addColorStop(1, 'rgba(77, 184, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  _renderTowerSpots(ctx) {
    const mapSize = this.currentStageData.mapSize || { width: this.gameWidth, height: this.gameHeight };
    for (const spot of this.towerSpots) {
      if (spot.occupied) continue;
      const { x, y } = this.normalizedToWorld(spot);
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.48)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, spot.radius * mapSize.width, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _renderTowerSpotHighlight(ctx, spot) {
    const mapSize = this.currentStageData.mapSize || { width: this.gameWidth, height: this.gameHeight };
    const { x, y } = this.normalizedToWorld(spot);
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, spot.radius * mapSize.width, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
