/**
 * ASTRA: Aether Guardians — Projectile
 * Projectile fired from units to enemies
 */
import { Entity } from './Entity.js';

export class Projectile extends Entity {
  constructor() {
    super(0, 0);
    this.damage = 0;
    this.speed = 400; // pixels per second
    this.target = null;
    this.type = 'arrow';
    this.aoeRadius = 0;
    this.enemies = [];
    this.trail = [];
    this.maxTrailLength = 6;
    this.damageType = 'physical';
  }

  /**
   * Initialize/reset projectile (for object pooling)
   */
  init(fromX, fromY, target, damage, type = 'arrow', aoeRadius = 0, enemies = []) {
    this.x = fromX;
    this.y = fromY;
    this.prevX = fromX;
    this.prevY = fromY;
    this.target = target;
    this.damage = damage;
    this.type = type;
    this.aoeRadius = aoeRadius;
    this.enemies = enemies;
    this.isDead = false;
    this.trail = [];
    this.spawnTimer = 0;

    // Type-specific properties
    switch (type) {
      case 'arrow':
        this.speed = 500;
        this.damageType = 'physical';
        this.color = '#4db8ff';
        break;
      case 'fireball':
        this.speed = 350;
        this.damageType = 'magic';
        this.color = '#ff6600';
        break;
      case 'magic_bolt':
        this.speed = 450;
        this.damageType = 'magic';
        this.color = '#b066ff';
        break;
      case 'shuriken':
        this.speed = 600;
        this.damageType = 'physical';
        this.color = '#cccccc';
        break;
      case 'heal':
        this.speed = 300;
        this.damageType = 'heal';
        this.color = '#4ade80';
        break;
      default:
        this.speed = 400;
        this.damageType = 'physical';
        this.color = '#ffffff';
    }
  }

  update(dt) {
    if (this.isDead) return;

    // Save trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Check if target is dead or missing
    if (!this.target || this.target.isDead) {
      this.isDead = true;
      return;
    }

    // Move toward target
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed * dt) {
      // Hit target
      this._onHit();
    } else {
      const nx = dx / dist;
      const ny = dy / dist;
      this.x += nx * this.speed * dt;
      this.y += ny * this.speed * dt;
    }
  }

  _onHit() {
    if (this.aoeRadius > 0) {
      // AoE damage
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dist = Math.sqrt(
          (enemy.x - this.target.x) ** 2 + (enemy.y - this.target.y) ** 2
        );
        if (dist <= this.aoeRadius) {
          const falloff = 1 - (dist / this.aoeRadius) * 0.5;
          enemy.takeDamage(Math.floor(this.damage * falloff), this.damageType);
        }
      }
    } else {
      // Single target damage
      this.target.takeDamage(this.damage, this.damageType);
    }

    this.isDead = true;
  }

  render(ctx, interpolation) {
    if (this.isDead) return;

    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 0.4;
      const size = 2 + (i / this.trail.length) * 2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw projectile
    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case 'arrow':
        this._drawArrow(ctx);
        break;
      case 'fireball':
        this._drawFireball(ctx);
        break;
      case 'magic_bolt':
        this._drawMagicBolt(ctx);
        break;
      case 'shuriken':
        this._drawShuriken(ctx);
        break;
      case 'heal':
        this._drawHeal(ctx);
        break;
      default:
        this._drawDefault(ctx);
    }

    ctx.restore();
  }

  _drawArrow(ctx) {
    const angle = Math.atan2(
      this.target.y - this.y,
      this.target.x - this.x
    );
    ctx.rotate(angle);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -3);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 3);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawFireball(ctx) {
    // Outer glow
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.4, '#ff6600');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawMagicBolt(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawShuriken(ctx) {
    ctx.rotate(this.x * 0.1); // Spin based on position
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * 5, Math.sin(angle) * 5);
      const midAngle = angle + Math.PI / 4;
      ctx.lineTo(Math.cos(midAngle) * 2, Math.sin(midAngle) * 2);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawHeal(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    // Plus sign
    ctx.fillRect(-4, -1.5, 8, 3);
    ctx.fillRect(-1.5, -4, 3, 8);
    ctx.shadowBlur = 0;
  }

  _drawDefault(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Reset for object pooling
   */
  reset() {
    this.isDead = false;
    this.target = null;
    this.trail = [];
    this.x = 0;
    this.y = 0;
  }
}
