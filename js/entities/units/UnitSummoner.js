/**
 * ASTRA: Aether Guardians — Summoner Unit
 * Minion control, creates summons that block enemy paths
 */
import { UnitBase } from '../UnitBase.js';

export class UnitSummoner extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    this.summonTimer = 0;
    this.summonCooldown = 8; // Summon every 8 seconds
    this.summons = []; // Active summons
    this.maxSummons = 2;
    this.summonHP = 150;
    this.summonDuration = 15;
  }

  update(dt, enemies, gameManager) {
    super.update(dt, enemies, gameManager);

    // Update summon timer
    this.summonTimer += dt;

    // Update existing summons
    for (let i = this.summons.length - 1; i >= 0; i--) {
      this.summons[i].life -= dt;
      if (this.summons[i].life <= 0 || this.summons[i].hp <= 0) {
        this.summons.splice(i, 1);
      }
    }

    // Auto-summon when possible
    if (this.summonTimer >= this.summonCooldown && this.summons.length < this.maxSummons) {
      this.summonTimer = 0;
      this._createSummon(gameManager);
    }

    // Also perform ranged attacks (weaker)
    // Already handled by parent class
  }

  _createSummon(gameManager) {
    // Place summon near the summoner
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 40;

    const summon = {
      x: this.x + offsetX,
      y: this.y + offsetY,
      hp: this.summonHP,
      maxHP: this.summonHP,
      life: this.summonDuration,
      maxLife: this.summonDuration,
    };

    this.summons.push(summon);
    this.attackFlash = 1;

    gameManager.addFloatingText(
      summon.x, summon.y - 10,
      'SUMMON!', '#f59e0b', 14
    );
  }

  get canTargetFlying() {
    return false;
  }

  _getProjectileType() {
    return 'magic_bolt';
  }

  render(ctx, interpolation) {
    // Render summons first
    for (const summon of this.summons) {
      this._renderSummon(ctx, summon);
    }

    // Render the summoner itself
    super.render(ctx, interpolation);
  }

  _renderSummon(ctx, summon) {
    ctx.save();
    ctx.translate(summon.x, summon.y);

    const alpha = Math.min(1, summon.life / 2); // Fade out near end
    ctx.globalAlpha = alpha;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Summon body (golem-like)
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.roundRect(-8, -14, 16, 18, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(-3, -8, 2, 0, Math.PI * 2);
    ctx.arc(3, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;
    ctx.restore();

    // HP bar
    if (summon.hp < summon.maxHP) {
      const barWidth = 16;
      const barHeight = 2;
      const hpPercent = summon.hp / summon.maxHP;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(summon.x - barWidth / 2 - 1, summon.y - 18, barWidth + 2, barHeight + 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(summon.x - barWidth / 2, summon.y - 17, barWidth * hpPercent, barHeight);
    }
  }

  _drawBody(ctx, color) {
    // Summoner robed body
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

    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mystical eye symbol
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Floating orbs
    const orbAngle = this.animTimer * 2;
    for (let i = 0; i < 3; i++) {
      const angle = orbAngle + (i / 3) * Math.PI * 2;
      const ox = Math.cos(angle) * 16;
      const oy = Math.sin(angle) * 8 - 10;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      ctx.arc(ox, oy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
