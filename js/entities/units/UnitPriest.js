/**
 * ASTRA: Aether Guardians — Priest Unit
 * Healer / Buffer, heals nearby allied units
 */
import { UnitBase } from '../UnitBase.js';

export class UnitPriest extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    this.healAmount = Math.floor(this.atk * 0.8);
    this.healTarget = null;
  }

  update(dt, enemies, gameManager) {
    // Priest heals nearby allied units instead of attacking enemies
    this.animTimer += dt;
    if (this.spawnTimer > 0) this.spawnTimer -= dt;
    if (this.attackFlash > 0) this.attackFlash -= dt * 4;

    // Find most damaged nearby ally
    this.healTarget = this._findHealTarget(gameManager.units);

    if (this.healTarget) {
      this.state = 'ATTACKING'; // reuse attacking state for healing
      this.attackTimer += dt;

      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer -= this.attackCooldown;
        this._performHeal(gameManager);
      }
    } else {
      this.state = 'IDLE';
    }
  }

  _findHealTarget(units) {
    let mostDamaged = null;
    let lowestHpPercent = 1;

    for (const unit of units) {
      if (unit === this || unit.isDead) continue;

      const dist = this.distanceTo(unit);
      if (dist > this.range) continue;

      const hpPercent = unit.hp / unit.maxHP;
      if (hpPercent < 1 && hpPercent < lowestHpPercent) {
        mostDamaged = unit;
        lowestHpPercent = hpPercent;
      }
    }

    return mostDamaged;
  }

  _performHeal(gameManager) {
    if (!this.healTarget || this.healTarget.isDead) return;

    this.attackFlash = 1;

    // Heal the target
    const healAmount = Math.min(this.healAmount, this.healTarget.maxHP - this.healTarget.hp);
    this.healTarget.hp += healAmount;

    // Show heal number
    gameManager.addFloatingText(
      this.healTarget.x, this.healTarget.y - 20,
      `+${healAmount}`, '#4ade80', 14
    );

    this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + 4);
  }

  get canTargetFlying() {
    return false;
  }

  _drawBody(ctx, color) {
    // Priest robe
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-9, -16);
    ctx.lineTo(9, -16);
    ctx.lineTo(11, 6);
    ctx.lineTo(-11, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head with hood
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hood
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.quadraticCurveTo(0, -30, 8, -18);
    ctx.closePath();
    ctx.fill();

    // Cross/holy symbol
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 6;
    ctx.fillRect(-1.5, -14, 3, 10);
    ctx.fillRect(-4, -12, 8, 3);
    ctx.shadowBlur = 0;

    // Healing aura (subtle)
    if (this.state === 'ATTACKING') {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
      ctx.beginPath();
      ctx.arc(0, -5, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
