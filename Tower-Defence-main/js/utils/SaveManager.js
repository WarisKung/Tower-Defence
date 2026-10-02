/**
 * ASTRA: Aether Guardians — Save Manager
 */
export class SaveManager {
  constructor() {
    this.saveKey = 'astra_td_save_v1';
    this.defaultData = {
      stagesCompleted: {},
      gold: 0,
      inventory: [],
      unitLevels: {}
    };
  }
  
  load() {
    try {
      const data = localStorage.getItem(this.saveKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return JSON.parse(JSON.stringify(this.defaultData));
  }
  
  save(data) {
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      return false;
    }
  }
}
