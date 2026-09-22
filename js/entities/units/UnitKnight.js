/**
 * ASTRA: Aether Guardians — Knight Unit
 * Tank / Melee, blocks enemy movement
 */
import { UnitBase } from '../UnitBase.js';

export class UnitKnight extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    this.blockCount = 0;
    this.maxBlock = 3; // Can block up to 3 enemies
    this.blockedEnemies = [];
  }

  update(dt, enemies, gameManager) {
    // Knight melee: block nearby enemies
    this.blockedEnemies = [];
    this.blockCount = 0;

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.isFlying) continue;

      const dist = this.distanceTo(enemy);
      if (dist <= this.range && this.blockCount < this.maxBlock) {
        // Block enemy movement
        if (!enemy.blockedBy || enemy.blockedBy.isDead) {
          enemy.blockedBy = this;
          this.blockedEnemies.push(enemy);
          this.blockCount++;
        }
      }
    }

    // Melee attack blocked enemies
    this.target = this.blockedEnemies[0] || this._findTarget(enemies);

    if (this.target) {
      this.state = 'ATTACKING';
      this.attackTimer += dt;

      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer -= this.attackCooldown;
        this._performMeleeAttack(gameManager);
      }
    } else {
      this.state = 'IDLE';
    }

    // Update base (animation, etc.)
    this.animTimer += dt;
    if (this.attackFlash > 0) this.attackFlash -= dt * 4;
    if (this.spawnTimer > 0) this.spawnTimer -= dt;
  }

  _performMeleeAttack(gameManager) {
    if (!this.target || this.target.isDead) return;

    this.attackFlash = 1;
    // Direct damage (no projectile)
    const dmg = this.target.takeDamage(this.atk, 'physical');
    gameManager.addFloatingText(this.target.x, this.target.y - 20, `-${dmg}`, '#ff8888');

    this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + 3);
  }

  get canTargetFlying() {
    return false;
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
