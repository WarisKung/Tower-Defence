/**
 * ASTRA: Aether Guardians — Boss Enemy
 * High HP, multi-phase boss
 */
import { EnemyBase } from '../EnemyBase.js';

export class EnemyBoss extends EnemyBase {
  constructor(x, y, enemyData) {
    super(x, y, enemyData);
    this.width = 48;
    this.height = 48;
    this.phase = 1;
  }

  update(dt, gameManager) {
    super.update(dt, gameManager);
    
    // Phase change logic
    if (this.hp < this.maxHP * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.moveSpeed *= 1.5; // Enrage speed
      gameManager.addFloatingText(this.x, this.y - 40, 'ENRAGED!', '#ff0000', 20);
    }
  }

  _drawBody(ctx, color) {
    ctx.fillStyle = color;
    
    // Massive imposing body
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(20, -10);
    ctx.lineTo(15, 20);
    ctx.lineTo(-15, 20);
    ctx.lineTo(-20, -10);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = this.phase === 2 ? '#ff0000' : 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Horns
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(15, -20);
    ctx.lineTo(25, -35);
    ctx.lineTo(10, -25);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-15, -20);
    ctx.lineTo(-25, -35);
    ctx.lineTo(-10, -25);
    ctx.fill();

    // Eyes
    ctx.fillStyle = this.phase === 2 ? '#ff0000' : '#ffaa00';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-6, -10, 4, 0, Math.PI * 2);
    ctx.arc(6, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
