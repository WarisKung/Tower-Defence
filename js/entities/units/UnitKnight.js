/**
 * ASTRA: Aether Guardians — Knight Unit
 * Tank / Blocker — blocks 1 enemy, absorbs up to N hits (100 dmg each), then vanishes.
 * Upgrade adds +50 maxHP → +1 hit count per upgrade.
 */
import { UnitBase } from '../UnitBase.js';

export class UnitKnight extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);

    // Hits-to-vanish mechanic
    // Each "hit block" = 100 HP → base 100 HP = 1 hit, upgrades add 50 HP each
    this.HIT_BLOCK_SIZE = 100;
    this.hitsTaken      = 0;
    this.maxHits        = Math.round(this.maxHP / this.HIT_BLOCK_SIZE);

    // Block all enemies
    this.blockedEnemies = new Set();

    // Timer: lose 1 hit block every 4 seconds while blocking
    this.BLOCK_TICK_INTERVAL = 4.0; // seconds per hit block
    this.blockTimer           = 0;

    // No attack
    this.atk = 0;
    this.def = 0;
  }

  /* ─── UPGRADE ─────────────────────────────────────────────────────────── */
  upgrade() {
    if (this.level >= this.maxLevel) return false;
    this.level++;

    // +50 HP per upgrade → +1 hit block
    this.maxHP  += 50;
    this.hp      = this.maxHP;
    this.maxHits = Math.round(this.maxHP / this.HIT_BLOCK_SIZE);

    return true;
  }

  getUpgradeCost() {
    return Math.floor(this.cost * 0.5 * this.level);
  }

  /* ─── UPDATE ──────────────────────────────────────────────────────────── */
  update(dt, enemies, gameManager) {
    if (this.isDead) return;

    // Release enemies that died or moved out of range
    const toRemove = [];
    for (const enemy of this.blockedEnemies) {
      if (enemy.isDead || this.distanceTo(enemy) > this.range) {
        toRemove.push(enemy);
      }
    }
    toRemove.forEach(e => this._releaseBlock(e));

    // Block all enemies in range
    let isBlockingAnyone = this.blockedEnemies.size > 0;
    for (const enemy of enemies) {
      if (enemy.isDead || enemy.isFlying) continue;

      const dist = this.distanceTo(enemy);
      if (dist <= this.range) {
        if (!enemy.blockedBy || enemy.blockedBy === this) {
          this.blockedEnemies.add(enemy);
          enemy.blockedBy = this;
          isBlockingAnyone = true;
        }
      }
    }

    if (isBlockingAnyone) {
      this.state = 'ATTACKING';
      this.blockTimer += dt;
      if (this.blockTimer >= this.BLOCK_TICK_INTERVAL) {
        this.blockTimer -= this.BLOCK_TICK_INTERVAL;
        this._consumeHitBlock(gameManager);
      }
    } else {
      this.state = 'IDLE';
      this.blockTimer = 0;
    }

    // Animate
    if (this.attackFlash > 0) this.attackFlash -= dt * 4;
    if (this.spawnTimer  > 0) this.spawnTimer  -= dt;
  }

  /* ─── TAKE DAMAGE ────────────────────────────────────────────────────── */
  // Knight is invulnerable to normal hits — durability drains by timer only
  takeDamage(_damage) {
    return 0;
  }

  /* ─── CONSUME HIT BLOCK (called every 4 s while blocking) ───────────── */
  _consumeHitBlock(gameManager) {
    this.hitsTaken++;
    this.hp          = Math.max(0, this.maxHP - this.hitsTaken * this.HIT_BLOCK_SIZE);
    this.attackFlash  = 1;

    // Show visual feedback
    if (gameManager) {
      gameManager.addFloatingText(this.x, this.y - 30, '🛡 -1', '#aaaaee', 14);
    }

    if (this.hitsTaken >= this.maxHits) {
      this.hp     = 0;
      this.isDead  = true;
      this.state   = 'DEAD';
      this._releaseBlock();
    }
  }

  /* ─── HELPERS ─────────────────────────────────────────────────────────── */
  _releaseBlock(enemy = null) {
    if (enemy) {
      if (enemy.blockedBy === this) enemy.blockedBy = null;
      this.blockedEnemies.delete(enemy);
    } else {
      for (const e of this.blockedEnemies) {
        if (e.blockedBy === this) e.blockedBy = null;
      }
      this.blockedEnemies.clear();
    }
  }

  get canTargetFlying() { return false; }

  /* ─── RENDER ──────────────────────────────────────────────────────────── */
  render(ctx, interpolation) {
    if (this.isDead) return;

    const pos = this.getInterpolatedPos(interpolation);
    const x   = pos.x;
    const y   = pos.y;

    let drawScale = 1;
    if (this.spawnTimer > 0) {
      const t = 1 - this.spawnTimer / 0.4;
      drawScale = t < 0.5 ? 1.2 * (t / 0.5) : 1.2 - 0.2 * ((t - 0.5) / 0.5);
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(drawScale, drawScale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyColor = this.attackFlash > 0
      ? this._lerpColor(this.classColor, '#ffffff', this.attackFlash)
      : this.classColor;

    this._drawBody(ctx, bodyColor);

    // Class icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.classIcon, 0, -6);

    // Level badge
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(-12, -20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 8px Outfit';
    ctx.fillText(this.level, -12, -19);

    ctx.restore();

    // Segmented hit-bar (shows remaining hit blocks)
    this._renderHitBar(ctx, x, y - 32);
  }

  /** Segmented bar: each segment = 1 hit block, blue = remaining, dim = used */
  _renderHitBar(ctx, x, y) {
    const segW      = 10;
    const segH      = 6;
    const gap       = 2;
    const total     = this.maxHits;
    const remaining = total - this.hitsTaken;
    const totalW    = total * segW + (total - 1) * gap;
    const startX    = x - totalW / 2;

    for (let i = 0; i < total; i++) {
      const sx = startX + i * (segW + gap);
      ctx.fillStyle = i < remaining ? '#4db8ff' : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(sx, y, segW, segH, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  _drawBody(ctx, color) {
    // Heavy knight body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-11, -18, 22, 24, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head with helmet
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet visor
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-5, -22, 10, 4);

    // Shield
    ctx.fillStyle = '#6666aa';
    ctx.strokeStyle = '#8888cc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-10, 4);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-6, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shield emblem
    ctx.fillStyle = '#aaaaee';
    ctx.beginPath();
    ctx.arc(-10, -5, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

