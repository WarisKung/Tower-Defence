/**
 * ASTRA: Aether Guardians — Main Menu
 */
import { GameState } from '../core/GameManager.js';

export class MainMenu {
  constructor(gameManager) {
    this.gm = gameManager;
    
    document.getElementById('btn-story').addEventListener('click', () => {
      // For MVP, just go to stage select
      this.gm.setState(GameState.STAGE_SELECT);
    });
    

    document.getElementById('btn-collection').addEventListener('click', () => {
      alert("Collection feature coming soon!");
    });
    
    document.getElementById('btn-settings').addEventListener('click', () => {
      alert("Settings coming soon!");
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
  
  show() {
    // Any enter animations
  }
}
