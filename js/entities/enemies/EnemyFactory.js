/**
 * ASTRA: Aether Guardians — Enemy Factory
 */
import { EnemyImp } from './EnemyImp.js';
import { EnemyGolem } from './EnemyGolem.js';
import { EnemyWraith } from './EnemyWraith.js';
import { EnemyRat } from './EnemyRat.js';
import { EnemyBoss } from './EnemyBoss.js';

const ENEMY_CLASSES = {
  imp: EnemyImp,
  golem: EnemyGolem,
  wraith: EnemyWraith,
  rat: EnemyRat,
  boss: EnemyBoss,
};

export function createEnemy(type, x, y, enemyData) {
  const EnemyClass = ENEMY_CLASSES[type];
  if (!EnemyClass) {
    console.error(`[ASTRA] Unknown enemy type: ${type}`);
    return null;
  }
  return new EnemyClass(x, y, enemyData);
}
