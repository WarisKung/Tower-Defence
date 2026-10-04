/**
 * ASTRA: Aether Guardians — Summoner Unit
 * Minion control, creates summons that block enemy paths
 */
import { UnitBase } from '../UnitBase.js';

export class UnitSummoner extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
    
    this.blockedEnemies = new Set();
    this.blockTimer = 0;
    this.BLOCK_TICK_INTERVAL = 2.0;
    this.maxBlocks = 5;
    this.currentBlocks = 0;
    this.blockRegenTimer = 0;
    this.BLOCK_REGEN_INTERVAL = 3.0;
  }

  update(dt, enemies, gameManager) {
    if (this.isDead) return;
    
    super.update(dt, enemies, gameManager);

    // Block regen
    if (this.currentBlocks < this.maxBlocks) {
       this.blockRegenTimer += dt;
       if (this.blockRegenTimer >= this.BLOCK_REGEN_INTERVAL) {
           this.blockRegenTimer -= this.BLOCK_REGEN_INTERVAL;
           this.currentBlocks++;
           gameManager.addFloatingText(this.x, this.y - 30, '🛡 +1', '#f59e0b', 14);
       }
    } else {
       this.blockRegenTimer = 0;
    }

    // Release enemies that died or moved out of range, or if we have 0 blocks
    const toRemove = [];
    for (const enemy of this.blockedEnemies) {
      if (enemy.isDead || this.distanceTo(enemy) > this.range || this.currentBlocks <= 0) {
        toRemove.push(enemy);
      }
    }
    toRemove.forEach(e => this._releaseBlock(e));

    // Block all enemies in range if we have blocks
    let isBlockingAnyone = this.blockedEnemies.size > 0;
    if (this.currentBlocks > 0) {
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
    }

    if (isBlockingAnyone) {
      this.blockTimer += dt;
      if (this.blockTimer >= this.BLOCK_TICK_INTERVAL) {
        this.blockTimer -= this.BLOCK_TICK_INTERVAL;
        this.currentBlocks--;
        if (this.currentBlocks < 0) this.currentBlocks = 0;
        this.attackFlash = 1;
        gameManager.addFloatingText(this.x, this.y - 30, '🛡 -1', '#ef4444', 14);
      }
    } else {
      this.blockTimer = 0;
    }
  }

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

  get canTargetFlying() {
    return false;
  }

  _getProjectileType() {
    return 'magic_bolt';
  }

  render(ctx, interpolation) {
    super.render(ctx, interpolation);
    
    if (this.isDead) return;

    // Render block count
    const pos = this.getInterpolatedPos(interpolation);
    const x = pos.x;
    const y = pos.y;
    this._renderBlockBar(ctx, x, y - 36);
  }

  _renderBlockBar(ctx, x, y) {
    const segW = 10;
    const segH = 6;
    const gap = 2;
    const total = this.maxBlocks;
    const current = this.currentBlocks;
    const totalW = total * segW + (total - 1) * gap;
    const startX = x - totalW / 2;

    for (let i = 0; i < total; i++) {
      const sx = startX + i * (segW + gap);
      ctx.fillStyle = i < current ? '#f59e0b' : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(sx, y, segW, segH, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    // Draw the number text above the bar
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(`${current}/${total}`, x, y - 4);
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
