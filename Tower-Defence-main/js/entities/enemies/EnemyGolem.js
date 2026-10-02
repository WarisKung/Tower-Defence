/**
 * ASTRA: Aether Guardians — Golem Enemy
 * Armored, slow, reduces physical damage
 */
import { EnemyBase } from '../EnemyBase.js';

export class EnemyGolem extends EnemyBase {
  constructor(x, y, enemyData) {
    super(x, y, enemyData);
    this.width = 28;
    this.height = 28;
  }

  _drawBody(ctx, color) {
    ctx.fillStyle = color;
    // Bulky body
    ctx.beginPath();
    ctx.roundRect(-14, -18, 28, 26, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stone texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(10, 2);
    ctx.moveTo(-6, -12);
    ctx.lineTo(12, -8);
    ctx.stroke();

    // Single glowing eye
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
