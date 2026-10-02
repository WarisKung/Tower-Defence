/**
 * ASTRA: Aether Guardians — Unit Factory
 * Creates unit instances based on type string
 */
import { UnitArcher } from './UnitArcher.js';
import { UnitKnight } from './UnitKnight.js';
import { UnitMage } from './UnitMage.js';
import { UnitPriest } from './UnitPriest.js';
import { UnitAssassin } from './UnitAssassin.js';
import { UnitSummoner } from './UnitSummoner.js';

const UNIT_CLASSES = {
  archer: UnitArcher,
  knight: UnitKnight,
  mage: UnitMage,
  priest: UnitPriest,
  assassin: UnitAssassin,
  summoner: UnitSummoner,
};

/**
 * Create a unit instance by type
 * @param {string} type - Unit type key (e.g. 'archer')
 * @param {number} x - Screen X position
 * @param {number} y - Screen Y position
 * @param {Object} unitData - Unit data from unitData.js
 * @returns {UnitBase}
 */
export function createUnit(type, x, y, unitData) {
  const UnitClass = UNIT_CLASSES[type];
  if (!UnitClass) {
    console.error(`[ASTRA] Unknown unit type: ${type}`);
    return null;
  }
  return new UnitClass(x, y, unitData);
}
