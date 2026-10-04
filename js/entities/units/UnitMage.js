/**
 * ASTRA: Aether Guardians — Mage Unit
 * AoE Magic DPS, effective against armored enemies
 */
import { UnitBase } from '../UnitBase.js';

export class UnitMage extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    this.aoeRadius = 60; // AoE damage radius
  }

  _performAttack(gameManager) {
    if (!this.target || this.target.isDead) return;

    this.attackFlash = 1;
    this.isAttacking = true;

    // Fire AoE projectile
    gameManager.fireProjectile(
      this.x, this.y - 10,
      this.target,
      this.atk,
      'fireball',
      this.aoeRadius
    );

    this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + 4);
    setTimeout(() => { this.isAttacking = false; }, 200);
  }

  get canTargetFlying() {
    return true;
  }

  _getProjectileType() {
    return 'fireball';
  }

  _drawBody(ctx, color) {
    // Mage robe body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-9, -16);
    ctx.lineTo(9, -16);
    ctx.lineTo(12, 6);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wizard hat
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.lineTo(0, -36);
    ctx.lineTo(8, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    // Staff
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(13, -20);
    ctx.lineTo(13, 6);
    ctx.stroke();

    // Staff crystal
    ctx.fillStyle = '#b066ff';
    ctx.shadowColor = '#b066ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(13, -22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
