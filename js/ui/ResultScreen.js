/**
 * ASTRA: Aether Guardians — Result Screen
 */
import { GameState } from '../core/GameManager.js';

export class ResultScreen {
  constructor(gameManager) {
    this.gm = gameManager;
    
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.gm.restart();
    });
    
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      this.gm.setState(GameState.STAGE_SELECT);
    });
    
    document.getElementById('btn-result-menu').addEventListener('click', () => {
      this.gm.setState(GameState.MENU);
    });
  }
  
  show(data) {
    const titleEl = document.getElementById('result-title');
    const starsEl = document.getElementById('result-stars');
    const nextBtn = document.getElementById('btn-next-stage');
    
    if (data.victory) {
      titleEl.textContent = 'VICTORY';
      titleEl.className = 'result-title';
      nextBtn.style.display = 'block';
    } else {
      titleEl.textContent = 'DEFEAT';
      titleEl.className = 'result-title defeat';
      nextBtn.style.display = 'none';
    }
    
    document.getElementById('reward-exp').textContent = `+${data.exp}`;
    document.getElementById('reward-gold').textContent = `+${data.gold}`;
    
    // Animate stars
    starsEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      starsEl.appendChild(star);
      
      if (i <= data.stars) {
        setTimeout(() => {
          star.classList.add('earned');
        }, i * 400);
      }
    }
  }
}
