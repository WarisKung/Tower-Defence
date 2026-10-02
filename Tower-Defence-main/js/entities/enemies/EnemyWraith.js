/**
 * ASTRA: Aether Guardians — Wraith Enemy
 * Flying enemy, bypasses ground units
 */
import { EnemyBase } from '../EnemyBase.js';

export class EnemyWraith extends EnemyBase {
  constructor(x, y, enemyData) {
    super(x, y, enemyData);
    this.isFlying = true;
    this.opacity = 0.8;
  }

  _drawBody(ctx, color) {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = color;
    
    // Ghostly body
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(15, -15, 12, 0);
    ctx.quadraticCurveTo(8, 10, 15, 15);
    ctx.lineTo(-15, 15);
    ctx.quadraticCurveTo(-8, 10, -12, 0);
    ctx.quadraticCurveTo(-15, -15, 0, -20);
    ctx.fill();
    
    // Glowing eyes
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-4, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.globalAlpha = 1;
  }
}
