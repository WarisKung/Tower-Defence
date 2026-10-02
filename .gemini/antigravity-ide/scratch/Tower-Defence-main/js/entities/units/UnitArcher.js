/**
 * ASTRA: Aether Guardians — Archer Unit
 * Ranged DPS, can target flying enemies
 */
import { UnitBase } from '../UnitBase.js';

export class UnitArcher extends UnitBase {
  constructor(x, y, unitData) {
    super(x, y, unitData);
  }

  get canTargetFlying() {
    return true; // Archers can hit flying enemies
  }

  _getProjectileType() {
    return 'arrow';
  }

  _drawBody(ctx, color) {
    // Slender archer body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-8, -20, 16, 24, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -22, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bow on the side
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(12, -8, 12, -Math.PI * 0.6, Math.PI * 0.6, false);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, -18);
    ctx.lineTo(12, 2);
    ctx.stroke();
  }
}
