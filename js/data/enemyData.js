/**
 * ASTRA: Aether Guardians — Enemy Data
 */
export const ENEMY_DATA = {
  imp: {
    enemy_id: 'imp',
    name: 'Abyss Imp',
    hp: 80,
    move_speed: 1.5,
    armor_type: 'none',
    damage_to_core: 1,
    reward_aether: 5,
    color: '#8b0000'
  },
  golem: {
    enemy_id: 'golem',
    name: 'Iron Golem',
    hp: 250,
    move_speed: 0.8,
    armor_type: 'heavy',
    damage_to_core: 2,
    reward_aether: 15,
    color: '#555555'
  },
  wraith: {
    enemy_id: 'wraith',
    name: 'Void Wraith',
    hp: 60,
    move_speed: 2.0,
    armor_type: 'light',
    is_flying: true,
    damage_to_core: 1,
    reward_aether: 10,
    color: '#4400aa'
  },
  rat: {
    enemy_id: 'rat',
    name: 'Shadow Rat',
    hp: 40,
    move_speed: 2.8,
    armor_type: 'none',
    damage_to_core: 1,
    reward_aether: 3,
    color: '#332222'
  },
  boss: {
    enemy_id: 'boss',
    name: 'Abyss Gatekeeper',
    hp: 1200,
    move_speed: 1.0,
    armor_type: 'heavy',
    damage_to_core: 5,
    reward_aether: 100,
    color: '#aa0000'
  }
};
