/**
 * ASTRA: Aether Guardians — Assassin Unit
 * Burst single-target, high critical chance
 */
import { UnitBase } from '../UnitBase.js';

export class UnitAssassin extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    this.critChance = 0.35; // 35% critical hit chance
    this.critMultiplier = 2.5;
  }

  _performAttack(gameManager) {
    if (!this.target || this.target.isDead) return;

    this.attackFlash = 1;
    this.isAttacking = true;

    // Calculate damage with critical chance
    const isCrit = Math.random() < this.critChance;
    const damage = isCrit ? Math.floor(this.atk * this.critMultiplier) : this.atk;

    gameManager.fireProjectile(
      this.x, this.y - 10,
      this.target,
      damage,
      'shuriken'
    );

    // Show crit indicator
    if (isCrit) {
      gameManager.addFloatingText(
        this.target.x, this.target.y - 30,
        'CRIT!', '#ffd700', 18
      );
    }

    this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + (isCrit ? 10 : 5));
    setTimeout(() => { this.isAttacking = false; }, 150);
  }

  get canTargetFlying() {
    return false;
  }

  _getProjectileType() {
    return 'shuriken';
  }

  _drawBody(ctx, color) {
    // Sleek assassin body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-7, -18, 14, 22, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head with mask
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mask/scarf
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-5, -19, 10, 4);

    // Eyes glow
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(-2, -21, 1.2, 0, Math.PI * 2);
    ctx.arc(2, -21, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Daggers
    ctx.fillStyle = '#cccccc';
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-14, -16);
    ctx.lineTo(-10, -12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -10);
    ctx.lineTo(14, -16);
    ctx.lineTo(10, -12);
    ctx.closePath();
    ctx.fill();
  }
}
