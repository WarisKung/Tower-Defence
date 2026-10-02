/**
 * ASTRA: Aether Guardians — Skill System
 */
export class SkillSystem {
  constructor(gameManager) {
    this.gm = gameManager;
    
    // GridManager tile size is usually 64. 3 tiles = 192 pixels.
    this.skills = {
      meteor: {
        id: 'meteor',
        name: 'METEOR',
        type: 'damage',
        cooldown: 15,
        currentCooldown: 0,
        radius: 192, 
      },
      freeze: {
        id: 'freeze',
        name: 'FREEZE',
        type: 'cc',
        cooldown: 12,
        currentCooldown: 0,
        radius: 192,
      }
    };

    this.activeEffects = [];
  }

  initUI() {
    const btnMeteor = document.getElementById('skill-meteor');
    const btnFreeze = document.getElementById('skill-freeze');
    
    if (btnMeteor) btnMeteor.addEventListener('click', () => this.selectSkill('meteor'));
    if (btnFreeze) btnFreeze.addEventListener('click', () => this.selectSkill('freeze'));
  }

  update(dt) {
    // Update cooldowns
    Object.values(this.skills).forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= dt;
        if (skill.currentCooldown <= 0) skill.currentCooldown = 0;
        this.updateSkillUI(skill);
      }
    });

    // Update active effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.life -= dt;
      if (effect.life <= 0) {
        this.activeEffects.splice(i, 1);
      }
    }
  }

  updateSkillUI(skill) {
    const slot = document.getElementById(`skill-${skill.id}`);
    const status = document.getElementById(`status-${skill.id}`);
    const overlay = document.getElementById(`cd-${skill.id}`);
    
    if (!slot) return;

    if (skill.currentCooldown > 0) {
      status.textContent = skill.currentCooldown.toFixed(1) + 's';
      status.style.color = '#ff4444';
      overlay.style.height = `${(skill.currentCooldown / skill.cooldown) * 100}%`;
      slot.classList.add('cooldown');
    } else {
      status.textContent = 'READY';
      status.style.color = '#00e5ff';
      overlay.style.height = '0%';
      slot.classList.remove('cooldown');
    }
  }

  selectSkill(skillId) {
    const skill = this.skills[skillId];
    if (skill.currentCooldown > 0) return;

    if (this.gm.selectedSkill === skillId) {
       this.cancelSkill();
       return;
    }

    this.gm.selectedSkill = skillId;
    this.gm.selectedUnitType = null; 
    this.gm.hud.deselectUnit();
    
    document.querySelectorAll('.skill-slot').forEach(el => el.classList.remove('selected'));
    document.getElementById(`skill-${skillId}`).classList.add('selected');
    
    this.gm.addFloatingText(this.gm.gameWidth/2, this.gm.gameHeight/2 - 100, 'Select Target', '#00e5ff', 32);
  }

  cancelSkill() {
    this.gm.selectedSkill = null;
    document.querySelectorAll('.skill-slot').forEach(el => el.classList.remove('selected'));
  }

  castSkill(skillId, x, y) {
    const skill = this.skills[skillId];
    if (!skill || skill.currentCooldown > 0) return false;

    if (skillId === 'meteor') {
      this._castMeteor(x, y, skill.radius);
    } else if (skillId === 'freeze') {
      this._castFreeze(x, y, skill.radius);
    }

    skill.currentCooldown = skill.cooldown;
    this.updateSkillUI(skill);
    this.cancelSkill();
    return true;
  }

  _castMeteor(x, y, radius) {
    this.gm.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist <= radius) {
        enemy.applyBurn(3, 5); // 3 HP/s for 5 seconds
      }
    });

    this.activeEffects.push({ type: 'meteor', x, y, radius, life: 1.0, maxLife: 1.0 });
  }

  _castFreeze(x, y, radius) {
    this.gm.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist <= radius) {
        enemy.applyFreeze(3.0); // 3 seconds
      }
    });

    this.activeEffects.push({ type: 'freeze', x, y, radius, life: 3.0, maxLife: 3.0 });
  }

  render(ctx) {
    ctx.save();
    this.activeEffects.forEach(effect => {
      if (effect.type === 'meteor') {
         ctx.fillStyle = `rgba(255, 68, 68, ${effect.life * 0.3})`;
         ctx.beginPath();
         ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI*2);
         ctx.fill();

         const progress = 1 - (effect.life / effect.maxLife);
         const fallY = effect.y - 800 * (1 - progress);
         if (progress < 1) {
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(effect.x, fallY, 30, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
            ctx.beginPath();
            ctx.arc(effect.x, fallY - 20, 20, 0, Math.PI*2);
            ctx.fill();
         } else {
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * (1 - effect.life), 0, Math.PI*2);
            ctx.stroke();
         }
      } else if (effect.type === 'freeze') {
         ctx.fillStyle = `rgba(100, 200, 255, ${Math.min(effect.life, 0.3)})`;
         ctx.strokeStyle = `rgba(100, 200, 255, ${Math.min(effect.life, 0.8)})`;
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI*2);
         ctx.fill();
         ctx.stroke();
      }
    });
    ctx.restore();
  }

  renderAoE(ctx, x, y, skillId) {
    const skill = this.skills[skillId];
    if (!skill) return;

    ctx.save();
    ctx.fillStyle = skillId === 'meteor' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(100, 200, 255, 0.2)';
    ctx.strokeStyle = skillId === 'meteor' ? 'rgba(255, 68, 68, 0.8)' : 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
    ctx.restore();
  }
}
