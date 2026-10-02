import { UNIT_DATA } from '../data/unitData.js';
import { ENEMY_DATA } from '../data/enemyData.js';
import { GameState } from '../core/GameManager.js';

export class MainMenu {
  constructor(gameManager) {
    this.gm = gameManager;
    
    document.getElementById('btn-story').addEventListener('click', () => {
      this.gm.setState(GameState.STAGE_SELECT);
    });

    document.getElementById('btn-collection').addEventListener('click', () => {
      document.getElementById('main-menu-screen').classList.remove('active');
      document.getElementById('collection-screen').classList.add('active');
      this.renderCollection();
    });

    document.getElementById('btn-back-collection').addEventListener('click', () => {
      document.getElementById('collection-screen').classList.remove('active');
      document.getElementById('main-menu-screen').classList.add('active');
    });
    
    document.getElementById('btn-credits').addEventListener('click', () => {
      document.getElementById('credits-modal').classList.add('active');
    });
    
    document.getElementById('btn-lore').addEventListener('click', () => {
      document.getElementById('main-menu-screen').classList.remove('active');
      document.getElementById('lore-screen').classList.add('active');
    });
    
    document.getElementById('btn-back-lore').addEventListener('click', () => {
      document.getElementById('lore-screen').classList.remove('active');
      document.getElementById('main-menu-screen').classList.add('active');
    });
  }
  
  renderCollection() {
    const guardiansContainer = document.getElementById('collection-guardians');
    const enemiesContainer = document.getElementById('collection-enemies');
    
    guardiansContainer.innerHTML = '';
    enemiesContainer.innerHTML = '';

    const createCard = (title, subtitle, desc, stats, color) => {
      return `
        <div style="background: rgba(0,0,0,0.6); border: 1px solid ${color}; border-radius: 8px; padding: 1rem; color: white;">
          <h4 style="color: ${color}; font-size: 18px; margin-bottom: 4px;">${title}</h4>
          <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">${subtitle}</div>
          <p style="font-size: 14px; margin-bottom: 12px; line-height: 1.4;">${desc}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
            ${stats.map(s => `<div><span style="color: #888;">${s.label}:</span> <strong>${s.value}</strong></div>`).join('')}
          </div>
        </div>
      `;
    };

    Object.values(UNIT_DATA).forEach(unit => {
      guardiansContainer.innerHTML += createCard(
        unit.name,
        `Class: ${unit.class} | Rarity: ${unit.rarity}`,
        unit.description,
        [
          { label: 'HP', value: unit.base_stats.hp },
          { label: 'ATK', value: unit.base_stats.atk },
          { label: 'DEF', value: unit.base_stats.def },
          { label: 'Cost', value: unit.base_stats.cost }
        ],
        '#00e5ff'
      );
    });

    Object.values(ENEMY_DATA).forEach(enemy => {
      enemiesContainer.innerHTML += createCard(
        enemy.name,
        `Armor: ${enemy.armor_type} ${enemy.is_flying ? '| Flying' : ''}`,
        '',
        [
          { label: 'HP', value: enemy.hp },
          { label: 'Speed', value: enemy.move_speed },
          { label: 'Core Dmg', value: enemy.damage_to_core },
          { label: 'Reward', value: enemy.reward_aether }
        ],
        enemy.color || '#ff4444'
      );
    });
  }

  show() {
    // Any enter animations
  }
}
