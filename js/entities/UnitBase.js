/**
 * ASTRA: Aether Guardians — Unit Base Class
 * Base class for all Guardian Units
 */
import { Entity } from './Entity.js';

export class UnitBase extends Entity {
  constructor(x, y, unitData) {
    super(x, y);
    
    this.unitData = unitData;

    // Identity
    this.unitId = unitData.unit_id;
    this.name = unitData.name;
    this.unitClass = unitData.class;
    this.rarity = unitData.rarity;
    this.element = unitData.element;

    // Stats
    this.maxHP = unitData.base_stats.hp;
    this.hp = this.maxHP;
    this.atk = unitData.base_stats.atk;
    this.def = unitData.base_stats.def;
    this.attackSpeed = unitData.base_stats.attack_speed;
    this.range = unitData.base_stats.range * 32; // Convert grid range to pixels
    this.cost = unitData.base_stats.cost;

    // Skills
    this.skills = unitData.skills || [];
    this.ultimateEnergy = 0;
    this.ultimateMaxEnergy = 100;

    // Level
    this.level = 1;
    this.maxLevel = unitData.level_max || 60;

    // Grid position
    this.gridCol = 0;
    this.gridRow = 0;

    // Combat
    this.attackTimer = 0;
    this.attackCooldown = 1 / this.attackSpeed;
    this.target = null;
    this.isAttacking = false;

    // Visual
    this.width = 28;
    this.height = 36;
    this.attackFlash = 0;

    // Class-specific visual
    this.classIcon = this._getClassIcon();
    this.classColor = this._getClassColor();
  }

  update(dt, enemies, gameManager) {
    super.update(dt);

    if (this.isDead) return;

    // Attack flash decay
    if (this.attackFlash > 0) {
      this.attackFlash -= dt * 4;
    }

    // Find target
    this.target = this._findTarget(enemies);

    if (this.target) {
      this.state = 'ATTACKING';
      this.attackTimer += dt;

      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer -= this.attackCooldown;
        this._performAttack(gameManager);
      }
    } else {
      this.state = 'IDLE';
      this.attackTimer = Math.min(this.attackTimer, this.attackCooldown * 0.8);
    }
  }

  /**
   * Find nearest enemy in range
   */
  _findTarget(enemies) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;

      // Check if this unit can target flying enemies
      if (enemy.isFlying && !this.canTargetFlying) continue;

      const dist = this.distanceTo(enemy);
      if (dist <= this.range && dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    }

    return nearest;
  }

  /**
   * Perform attack — override in subclasses for special behavior
   */
  _performAttack(gameManager) {
    if (!this.target || this.target.isDead) return;

    this.attackFlash = 1;
    this.isAttacking = true;

    // Default: fire projectile
    gameManager.fireProjectile(
      this.x, this.y - 10,
      this.target,
      this.atk,
      this._getProjectileType()
    );

    // Gain ultimate energy
    this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + 5);

    setTimeout(() => { this.isAttacking = false; }, 200);
  }

  /**
   * Upgrade this unit
   */
  upgrade() {
    if (this.level >= this.maxLevel) return false;

    this.level++;
    // Stat scaling: +8% per level
    const scale = 1 + (this.level - 1) * 0.08;
    this.maxHP = Math.floor(this.maxHP * 1.08);
    this.hp = this.maxHP;
    this.atk = Math.floor(this.atk * 1.08);
    this.def = Math.floor(this.def * 1.05);
    return true;
  }

  /**
   * Get upgrade cost
   */
  getUpgradeCost() {
    return Math.floor(this.cost * 0.5 * this.level);
  }

  /**
   * Get sell value
   */
  getSellValue() {
    return Math.floor(this.cost * 0.7);
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    const actualDamage = Math.max(1, damage - this.def);
    this.hp -= actualDamage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.state = 'DEAD';
    }
    return actualDamage;
  }

  /**
   * Render the unit
   */
  render(ctx, interpolation) {
    const pos = this.getInterpolatedPos(interpolation);
    const x = pos.x;
    const y = pos.y;

    // Spawn animation
    let drawScale = 1;
    if (this.spawnTimer > 0) {
      const t = 1 - this.spawnTimer / 0.4;
      drawScale = t < 0.5
        ? 1.2 * (t / 0.5)
        : 1.2 - 0.2 * ((t - 0.5) / 0.5);
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(drawScale, drawScale);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyColor = this.attackFlash > 0
      ? this._lerpColor(this.classColor, '#ffffff', this.attackFlash)
      : this.classColor;

    // Draw unit body (stylized humanoid)
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

    // HP bar (if damaged)
    if (this.hp < this.maxHP) {
      this._renderHPBar(ctx, x, y - 28);
    }
  }

  /**
   * Draw unit body shape
   */
  _drawBody(ctx, color) {
    // Base body — rounded rectangle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-10, -22, 20, 26, 4);
    ctx.fill();

    // Dark outline
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    // Head highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(-2, -26, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render selection indicator
   */
  renderSelection(ctx) {
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * Render attack range circle
   */
  renderRange(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(77, 184, 255, 0.2)';
    ctx.fillStyle = 'rgba(77, 184, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  _renderHPBar(ctx, x, y) {
    const barWidth = 24;
    const barHeight = 3;
    const hpPercent = this.hp / this.maxHP;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

    const color = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillStyle = color;
    ctx.fillRect(x - barWidth / 2, y, barWidth * hpPercent, barHeight);
  }

  _getProjectileType() {
    return 'arrow';
  }

  _getClassIcon() {
    const icons = {
      'นักธนู': '🏹',
      'อัศวิน': '🛡️',
      'นักเวทย์': '✨',
      'นักบวช': '✝️',
      'นักฆ่า': '🗡️',
      'ผู้อัญเชิญ': '👁️',
    };
    return icons[this.unitClass] || '⚔️';
  }

  _getClassColor() {
    const colors = {
      'นักธนู': '#4db8ff',
      'อัศวิน': '#8b8bcc',
      'นักเวทย์': '#b066ff',
      'นักบวช': '#4ade80',
      'นักฆ่า': '#ef4444',
      'ผู้อัญเชิญ': '#f59e0b',
    };
    return colors[this.unitClass] || '#888888';
  }

  _lerpColor(color1, color2, t) {
    // Simple hex color lerp
    const c1 = this._hexToRgb(color1);
    const c2 = this._hexToRgb(color2);
    const r = Math.floor(c1.r + (c2.r - c1.r) * t);
    const g = Math.floor(c1.g + (c2.g - c1.g) * t);
    const b = Math.floor(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r},${g},${b})`;
  }

  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 255, g: 255, b: 255 };
  }

  // Whether this unit can target flying enemies
  get canTargetFlying() {
    return false; // Override in subclasses
  }
}
