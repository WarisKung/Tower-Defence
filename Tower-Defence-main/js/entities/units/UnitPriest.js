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
    this.knightBuffTimer = 0;
    this.buffedAllies = new Set();
  }

  update(dt, enemies, gameManager) {
    if (this.isDead) {
      this._cleanupBuffs();
      return;
    }

    // Priest heals nearby allied units instead of attacking enemies
    this.animTimer += dt;
    if (this.spawnTimer > 0) this.spawnTimer -= dt;
    if (this.attackFlash > 0) this.attackFlash -= dt * 4;

    this.knightBuffTimer += dt;
    let doKnightBuff = false;
    if (this.knightBuffTimer >= 5.0) {
      this.knightBuffTimer -= 5.0;
      doKnightBuff = true;
    }

    const currentAlliesInRange = new Set();

    for (const unit of gameManager.units) {
      if (unit === this || unit.isDead) continue;
      
      const dist = this.distanceTo(unit);
      if (dist <= this.range) {
        currentAlliesInRange.add(unit);

        // Buff Knight blocks
        if (unit.unitId === 'knight' && doKnightBuff) {
          if (unit.hitsTaken > 0) {
            unit.hitsTaken--;
            unit.hp = Math.min(unit.maxHP, unit.maxHP - unit.hitsTaken * unit.HIT_BLOCK_SIZE);
            gameManager.addFloatingText(unit.x, unit.y - 40, '🛡 +1', '#4ade80', 14);
          }
        }

        // Buff ATK for non-knights
        if (unit.unitId !== 'knight') {
          if (!unit.priestBuffs) unit.priestBuffs = 0;
          if (!this.buffedAllies.has(unit)) {
            if (unit.priestBuffs === 0) {
              unit.originalAtk = unit.atk;
              unit.atk = unit.originalAtk * 1.5;
            }
            unit.priestBuffs++;
            this.buffedAllies.add(unit);
          }
        }
      }
    }

    // Remove buffs from units that left range
    for (const unit of this.buffedAllies) {
      if (!currentAlliesInRange.has(unit) || unit.isDead) {
        this._removeBuffFrom(unit);
      }
    }

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

  _removeBuffFrom(unit) {
    if (this.buffedAllies.has(unit)) {
      unit.priestBuffs--;
      if (unit.priestBuffs === 0 && unit.originalAtk) {
        unit.atk = unit.originalAtk;
      }
      this.buffedAllies.delete(unit);
    }
  }

  _cleanupBuffs() {
    for (const unit of this.buffedAllies) {
      this._removeBuffFrom(unit);
    }
    this.buffedAllies.clear();
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
