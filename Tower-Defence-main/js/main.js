/**
 * ASTRA: Aether Guardians — Main Entry Point
 */
import { GameManager } from './core/GameManager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Prevent context menu globally (except input manager will handle it for the game)
  document.addEventListener('contextmenu', e => e.preventDefault());
  
  const gameManager = new GameManager();
  gameManager.init();
  
  // Attach to window for debugging
  window.astraGame = gameManager;
});
