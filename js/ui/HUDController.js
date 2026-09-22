/**
 * ASTRA: Aether Guardians — HUD Controller
 */
import { UNIT_DATA } from '../data/unitData.js';

export class HUDController {
  constructor(gameManager) {
    this.gm = gameManager;
    
    // DOM Elements
    this.waveCounter = document.getElementById('wave-counter');
    this.aetherCounter = document.getElementById('aether-counter');
    this.coreHpBar = document.getElementById('core-hp-bar');
    this.coreHpText = document.getElementById('core-hp-text');
    this.unitSlotsContainer = document.getElementById('unit-slots');
    
    this.btnStartWave = document.getElementById('btn-start-wave');
    this.btnSpeed = document.getElementById('btn-speed');
    this.btnPause = document.getElementById('btn-pause');
    
    // Pause Overlay Buttons
    this.btnResume = document.getElementById('btn-resume');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnQuit = document.getElementById('btn-quit');
    
    this._bindEvents();
  }
  
  init() {
    this._populateUnitSlots();
    this.updateCoreUI();
    this.update();
  }
  
  _bindEvents() {
    this.btnStartWave.addEventListener('click', () => {
      this.gm.startWave();
    });
    
    this.btnSpeed.addEventListener('click', () => {
      if (this.gm.gameLoop.speedMultiplier === 1) {
        this.gm.gameLoop.setSpeed(2);
        this.btnSpeed.textContent = '2x';
        this.btnSpeed.style.color = 'var(--color-aether-cyan)';
      } else {
        this.gm.gameLoop.setSpeed(1);
        this.btnSpeed.textContent = '1x';
        this.btnSpeed.style.color = '';
      }
    });
    
    this.btnPause.addEventListener('click', () => {
      this.gm.togglePause();
    });
    
    // Pause Menu Events
    if (this.btnResume) {
      this.btnResume.addEventListener('click', () => {
        this.gm.togglePause();
      });
    }
    
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        this.gm.restart();
      });
    }
    
    if (this.btnQuit) {
      this.btnQuit.addEventListener('click', () => {
        this.gm.quitToMenu();
      });
    }
  }
  
  _populateUnitSlots() {
    this.unitSlotsContainer.innerHTML = '';
    
    // Create a slot for each unit class
    Object.keys(UNIT_DATA).forEach(key => {
      const unit = UNIT_DATA[key];
      
      const slot = document.createElement('div');
      slot.className = 'unit-slot';
      slot.dataset.type = key;
      
      const icon = document.createElement('div');
      icon.className = 'unit-slot-icon';
      icon.textContent = this._getUnitIcon(unit.class);
      
      const name = document.createElement('div');
      name.className = 'unit-slot-name';
      name.textContent = unit.class;
      
      const cost = document.createElement('div');
      cost.className = 'unit-slot-cost';
      cost.innerHTML = `<span class="aether-icon">◆</span> ${unit.base_stats.cost}`;
      
      slot.appendChild(icon);
      slot.appendChild(name);
      slot.appendChild(cost);
      
      slot.addEventListener('click', () => {
        if (slot.classList.contains('disabled')) return;
        
        if (this.gm.selectedUnitType === key) {
          this.deselectUnit();
        } else {
          this.selectUnit(key, slot);
        }
      });
      
      this.unitSlotsContainer.appendChild(slot);
    });
  }
  
  _getUnitIcon(unitClass) {
    const icons = {
      'นักธนู': '🏹',
      'อัศวิน': '🛡️',
      'นักเวทย์': '✨',
      'นักบวช': '✝️',
      'นักฆ่า': '🗡️',
      'ผู้อัญเชิญ': '👁️',
    };
    return icons[unitClass] || '⚔️';
  }
  
  selectUnit(type, slotElement) {
    this.deselectUnit();
    this.gm.selectedUnitType = type;
    slotElement.classList.add('selected');
    
    // Clear selected placed unit if any
    this.gm.selectedPlacedUnit = null;
    this.gm.unitInfoPanel.showPreview(UNIT_DATA[type]);
  }
  
  deselectUnit() {
    this.gm.selectedUnitType = null;
    document.querySelectorAll('.unit-slot').forEach(slot => {
      slot.classList.remove('selected');
    });
    
    // Only hide if it's currently showing a preview
    if (this.gm.unitInfoPanel.isPreview) {
      this.gm.unitInfoPanel.hide();
    }
  }
  
  update() {
    if (!this.gm.resourceSystem) return;
    
    // Update Aether
    const currentAether = this.gm.resourceSystem.getAether();
    this.aetherCounter.innerHTML = `<span class="aether-icon">◆</span> ${currentAether}`;
    
    // Check affordability for unit slots
    document.querySelectorAll('.unit-slot').forEach(slot => {
      const type = slot.dataset.type;
      const unit = UNIT_DATA[type];
      if (currentAether < unit.base_stats.cost) {
        slot.classList.add('disabled');
        if (this.gm.selectedUnitType === type) {
          this.deselectUnit();
        }
      } else {
        slot.classList.remove('disabled');
      }
    });
    
    // Update Waves
    if (this.gm.waveManager) {
      const current = this.gm.waveManager.getCurrentWaveNumber();
      const total = this.gm.waveManager.getTotalWaves();
      this.waveCounter.textContent = `${Math.min(current, total)} / ${total}`;
      
      // Update start button state
      if (this.gm.isWaveActive && !this.gm.waveManager.isCurrentWaveComplete()) {
        this.btnStartWave.classList.add('active-wave');
        this.btnStartWave.textContent = '▶ Wave Active';
      } else {
        this.btnStartWave.classList.remove('active-wave');
        this.btnStartWave.textContent = '▶ Start Wave';
      }
    }
  }
  
  onCoreHit() {
    // Shake effect
    const container = document.getElementById('hud-core-hp');
    container.classList.remove('anim-shake');
    void container.offsetWidth; // trigger reflow
    container.classList.add('anim-shake');
    
    this.updateCoreUI();
  }
  
  updateCoreUI() {
    // Update bar
    const hpPercent = this.gm.coreHP / this.gm.coreMaxHP;
    this.coreHpBar.style.width = `${hpPercent * 100}%`;
    this.coreHpText.textContent = `${this.gm.coreHP} / ${this.gm.coreMaxHP}`;
    
    if (hpPercent < 0.3) {
      this.coreHpBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else if (hpPercent < 0.6) {
      this.coreHpBar.style.background = 'linear-gradient(90deg, #eab308, #facc15)';
    } else {
      this.coreHpBar.style.background = 'linear-gradient(90deg, #00e5ff, #0077ff)';
    }
  }
  
  onWaveStart() {
    this.update();
  }
}
