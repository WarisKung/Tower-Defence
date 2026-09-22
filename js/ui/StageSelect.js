/**
 * ASTRA: Aether Guardians — Stage Select
 */
import { GameState } from '../core/GameManager.js';
import { STAGE_DATA } from '../data/stageData.js';

export class StageSelect {
  constructor(gameManager) {
    this.gm = gameManager;
    this.grid = document.getElementById('stage-grid');
    
    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this.gm.setState(GameState.MENU);
    });
    
    this.storyPanel = document.getElementById('story-preview-panel');
    this.storyTitle = document.getElementById('story-title');
    this.storyContent = document.getElementById('story-content');
    
    document.getElementById('btn-start-from-story').addEventListener('click', () => {
      if (this.selectedStageId) {
        this.gm.selectStage(this.selectedStageId);
      }
    });
  }
  
  show() {
    this.storyPanel.classList.add('hidden');
    this.selectedStageId = null;
    this._populateStages();
  }
  
  _populateStages() {
    this.grid.innerHTML = '';
    
    const playerData = this.gm.saveManager.load();
    const completed = playerData.stagesCompleted || {};
    
    // For MVP, we just have one stage defined, but let's show a few
    const stageIds = ['stage_1', 'stage_2', 'stage_3', 'stage_4'];
    
    stageIds.forEach((id, index) => {
      const data = STAGE_DATA[id];
      const isLocked = index > 0 && !completed[stageIds[index-1]];
      const stageInfo = completed[id] || { completed: false, stars: 0 };
      
      const card = document.createElement('div');
      card.className = `stage-card ${isLocked ? 'locked' : ''}`;
      
      let starsHtml = '';
      for (let i = 1; i <= 3; i++) {
        starsHtml += `<span class="${i <= stageInfo.stars ? 'filled' : 'empty'}">★</span>`;
      }
      
      card.innerHTML = `
        <div class="stage-number">0${index + 1}</div>
        <div class="stage-name">${data ? data.name : 'Unknown Territory'}</div>
        <div class="stage-stars">${isLocked ? 'Locked' : starsHtml}</div>
      `;
      
      if (!isLocked && data) {
        card.addEventListener('click', () => {
          // Highlight selected
          document.querySelectorAll('.stage-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          
          // Show story
          this.selectedStageId = id;
          this.storyTitle.textContent = data.name;
          this.storyContent.textContent = data.description || 'Prepare for battle...';
          this.storyPanel.classList.remove('hidden');
        });
      }
      
      this.grid.appendChild(card);
    });
  }
}
