/**
 * ASTRA: Aether Guardians — Rat Enemy
 * Fast, low HP swarm enemy
 */
import { EnemyBase } from '../EnemyBase.js';

export class EnemyRat extends EnemyBase {
  constructor(x, y, enemyData) {
    super(x, y, enemyData);
    this.width = 16;
    this.height = 12;
  }

  _drawBody(ctx, color) {
    ctx.fillStyle = color;
    
    // Small body
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(-15, -5, -20, 0);
    ctx.stroke();

    // Red eyes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
