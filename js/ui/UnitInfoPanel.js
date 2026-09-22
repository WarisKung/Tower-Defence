/**
 * ASTRA: Aether Guardians — Unit Info Panel
 */
export class UnitInfoPanel {
  constructor(gameManager) {
    this.gm = gameManager;
    this.panel = document.getElementById('unit-info-panel');
    this.btnClose = document.getElementById('btn-close-info');
    this.btnUpgrade = document.getElementById('btn-upgrade');
    this.btnSell = document.getElementById('btn-sell');
    
    this.currentUnit = null;
    
    this._bindEvents();
  }
  
  _bindEvents() {
    this.btnClose.addEventListener('click', () => {
      this.hide();
      this.gm.selectedPlacedUnit = null;
    });
    
    this.btnUpgrade.addEventListener('click', () => {
      if (!this.currentUnit) return;
      
      const cost = this.currentUnit.getUpgradeCost();
      if (this.gm.resourceSystem.spendAether(cost)) {
        this.currentUnit.upgrade();
        this.updateDisplay();
        this.gm.hud.update();
        
        // Float text
        this.gm.addFloatingText(this.currentUnit.x, this.currentUnit.y - 40, 'UPGRADE!', '#00e5ff');
      }
    });
    
    this.btnSell.addEventListener('click', () => {
      if (!this.currentUnit) return;
      
      const value = this.currentUnit.getSellValue();
      this.gm.resourceSystem.addAether(value);
      
      // Remove unit
      this.currentUnit.isDead = true;
      if (this.currentUnit.towerSpotId) {
        this.gm.releaseTowerSpot(this.currentUnit.towerSpotId);
      } else {
        this.gm.gridManager.markUnoccupied(this.currentUnit.gridCol, this.currentUnit.gridRow);
      }
      
      this.gm.addFloatingText(this.currentUnit.x, this.currentUnit.y - 20, `+${value}`, '#00e5ff');
      
      this.hide();
      this.gm.selectedPlacedUnit = null;
      this.gm.hud.update();
    });
  }
  
  show(unit) {
    this.currentUnit = unit;
    this.isPreview = false;
    this.updateDisplay();
    this.panel.classList.remove('hidden');
  }
  
  showPreview(unitData) {
    this.currentUnit = null;
    this.previewData = unitData;
    this.isPreview = true;
    this.updateDisplay();
    this.panel.classList.remove('hidden');
  }
  
  hide() {
    this.panel.classList.add('hidden');
    this.currentUnit = null;
  }
  
  updateDisplay() {
    if (!this.currentUnit && !this.isPreview) return;
    
    // Support both placed unit and preview data
    let u, level, maxLevel, hp, atk, def, spd, desc, name, unitClass, rarity, classIcon, classColor, range;
    
    if (this.isPreview) {
      u = this.previewData;
      level = 1;
      maxLevel = u.level_max || 60;
      hp = u.base_stats.hp;
      atk = u.base_stats.atk;
      def = u.base_stats.def;
      spd = u.base_stats.attack_speed;
      desc = u.description;
      name = u.name;
      unitClass = u.class;
      rarity = u.rarity;
      classIcon = this._getIconForClass(u.class);
      classColor = this._getColorForClass(u.class);
      range = u.base_stats.range;
    } else {
      u = this.currentUnit;
      level = u.level;
      maxLevel = u.maxLevel;
      hp = u.maxHP;
      atk = u.atk;
      def = u.def;
      spd = u.attackSpeed;
      desc = u.unitData.description;
      name = u.name;
      unitClass = u.unitClass;
      rarity = u.rarity;
      classIcon = u.classIcon;
      classColor = u.classColor;
      range = u.unitData.base_stats.range;
    }
    
    // Header
    document.getElementById('unit-info-name').textContent = name;
    document.getElementById('unit-info-class').textContent = unitClass;
    document.getElementById('unit-info-rarity').textContent = rarity;
    
    // Set rarity color
    const rarityEl = document.getElementById('unit-info-rarity');
    rarityEl.style.color = `var(--color-rarity-${rarity.toLowerCase()})`;
    
    // Portrait
    document.getElementById('unit-portrait').textContent = classIcon;
    document.getElementById('unit-portrait').style.borderColor = classColor;
    
    // Stats
    const statsHtml = `
      <div class="stat-item">
        <span class="stat-label">เลเวล</span>
        <span class="stat-value">${level} / ${maxLevel}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">พลังชีวิต</span>
        <span class="stat-value">${hp}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">โจมตี</span>
        <span class="stat-value">${atk}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ป้องกัน</span>
        <span class="stat-value">${def}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ความเร็ว</span>
        <span class="stat-value">${spd}/s</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ระยะโจมตี</span>
        <span class="stat-value">${range} ช่อง</span>
      </div>
    `;
    document.getElementById('unit-stats').innerHTML = statsHtml;
    
    // Skills / Description
    const descHtml = `
      <div class="skill-item">
        <div class="skill-name">ข้อมูลทักษะ</div>
        <div class="skill-desc">${desc}</div>
      </div>
    `;
    document.getElementById('unit-skills').innerHTML = descHtml;
    
    // Buttons
    if (this.isPreview) {
      document.querySelector('.unit-info-actions').style.display = 'none';
    } else {
      document.querySelector('.unit-info-actions').style.display = 'flex';
      
      if (level < maxLevel) {
        const upgradeCost = u.getUpgradeCost();
        document.getElementById('upgrade-cost').textContent = upgradeCost;
        this.btnUpgrade.style.display = '';
        
        if (this.gm.resourceSystem.getAether() >= upgradeCost) {
          this.btnUpgrade.style.opacity = '1';
          this.btnUpgrade.style.pointerEvents = 'auto';
        } else {
          this.btnUpgrade.style.opacity = '0.5';
          this.btnUpgrade.style.pointerEvents = 'none';
        }
      } else {
        this.btnUpgrade.style.display = 'none'; // Max level
      }
      
      document.getElementById('sell-value').textContent = u.getSellValue();
    }
  }

  _getIconForClass(unitClass) {
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

  _getColorForClass(unitClass) {
    const colors = {
      'นักธนู': '#4db8ff',
      'อัศวิน': '#8b8bcc',
      'นักเวทย์': '#b066ff',
      'นักบวช': '#4ade80',
      'นักฆ่า': '#ef4444',
      'ผู้อัญเชิญ': '#f59e0b',
    };
    return colors[unitClass] || '#888888';
  }
}
