/**
 * ASTRA: Aether Guardians — Scene Transition
 */
export class SceneTransition {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'scene-transition';
    
    this.wipe = document.createElement('div');
    this.wipe.className = 'scene-transition-wipe';
    this.el.appendChild(this.wipe);
    
    document.body.appendChild(this.el);
  }
  
  play() {
    return new Promise(resolve => {
      this.wipe.className = 'scene-transition-wipe entering';
      setTimeout(() => {
        resolve(); // Halfway point to change state
        this.wipe.className = 'scene-transition-wipe leaving';
      }, 400);
    });
  }
}
