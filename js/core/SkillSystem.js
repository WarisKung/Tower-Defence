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
        cooldown: 12,
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
      },
      chain_lightning: {
        id: 'chain_lightning',
        name: 'CHAIN LIGHTNING',
        type: 'single_chain',
        cooldown: 10,
        currentCooldown: 0,
        damage: 45,
        maxJumps: 4, // ปรับจำนวนครั้งที่กระโดดได้ตรงนี้
        jumpRadius: 180,
        damageFalloff: 0.82,
      },
      void_impact: {
        id: 'void_impact',
        name: 'VOID IMPACT',
        type: 'burst',
        cooldown: 35,
        currentCooldown: 0,
        damage: 160,
        radius: 110,
        stunChance: 0.35,
        stunDuration: 2.0,
      }
    };

    this.activeEffects = [];
  }

  initUI() {
    const btnMeteor = document.getElementById('skill-meteor');
    const btnFreeze = document.getElementById('skill-freeze');
    const btnChainLightning = document.getElementById('skill-chain_lightning');
    const btnVoidImpact = document.getElementById('skill-void_impact');
    
    if (btnMeteor) btnMeteor.addEventListener('click', () => this.selectSkill('meteor'));
    if (btnFreeze) btnFreeze.addEventListener('click', () => this.selectSkill('freeze'));
    if (btnChainLightning) btnChainLightning.addEventListener('click', () => this.selectSkill('chain_lightning'));
    if (btnVoidImpact) btnVoidImpact.addEventListener('click', () => this.selectSkill('void_impact'));
  }

  reset() {
    this.cancelSkill();
    this.activeEffects = [];
    Object.values(this.skills).forEach(skill => {
      skill.currentCooldown = 0;
      this.updateSkillUI(skill);
    });
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

    let casted = false;

    if (skillId === 'meteor') {
      this._castMeteor(x, y, skill.radius);
      casted = true;
    } else if (skillId === 'freeze') {
      this._castFreeze(x, y, skill.radius);
      casted = true;
    } else if (skillId === 'chain_lightning') {
      casted = this._castChainLightning(x, y, skill);
    } else if (skillId === 'void_impact') {
      this._castVoidImpact(x, y, skill);
      casted = true;
    }

    if (!casted) return false;

    skill.currentCooldown = skill.cooldown;
    this.updateSkillUI(skill);
    this.cancelSkill();
    return true;
  }

  _castMeteor(x, y, radius) {
    this.gm.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist <= radius) {
        enemy.applyBurn(5, 8); // 5 HP/s for 8 seconds
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

  _findEnemyAt(x, y, maxDistance = 30) {
    let nearest = null;
    let nearestDistance = maxDistance;

    for (const enemy of this.gm.enemies) {
      if (enemy.isDead) continue;
      const distance = Math.hypot(enemy.x - x, enemy.y - y);
      if (distance <= nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  _castChainLightning(x, y, skill) {
    // Chain Lightning ต้องเริ่มจากศัตรูเป้าหมายโดยตรง
    const firstTarget = this._findEnemyAt(x, y, 34);
    if (!firstTarget) return false;

    const targets = [firstTarget];
    let current = firstTarget;

    // เลือกศัตรูที่ใกล้ที่สุดที่ยังไม่ถูกยิงจนถึงจำนวนการกระโดด maxJumps
    // เป้าหมายแรกไม่นับเป็นการกระโดด ดังนั้น maxJumps = 4 จะยิงได้สูงสุด 5 เป้าหมาย
    while (targets.length <= skill.maxJumps) {
      let next = null;
      let nextDistance = skill.jumpRadius;

      for (const enemy of this.gm.enemies) {
        if (enemy.isDead || targets.indexOf(enemy) !== -1) continue;
        const distance = Math.hypot(enemy.x - current.x, enemy.y - current.y);
        if (distance <= nextDistance) {
          next = enemy;
          nextDistance = distance;
        }
      }

      if (!next) break;
      targets.push(next);
      current = next;
    }

    // Damage decreases slightly on every jump
    for (let i = 0; i < targets.length; i++) {
      const damage = Math.max(1, Math.round(skill.damage * Math.pow(skill.damageFalloff, i)));
      const dealt = targets[i].takeDamage(damage, 'magic');
      this.gm.addFloatingText(targets[i].x, targets[i].y - 22, `⚡${dealt}`, '#7dd3fc', 13);
    }

    this.activeEffects.push({
      type: 'chain_lightning',
      targets,
      life: 0.45,
      maxLife: 0.45,
    });

    return true;
  }

  _castVoidImpact(x, y, skill) {
    // ถ้าคลิกบนศัตรู ให้ใช้ตำแหน่งศัตรูเป็นศูนย์กลางระเบิด
    const target = this._findEnemyAt(x, y, 34);
    const centerX = target ? target.x : x;
    const centerY = target ? target.y : y;

    for (const enemy of this.gm.enemies) {
      if (enemy.isDead) continue;

      const distance = Math.hypot(enemy.x - centerX, enemy.y - centerY);
      if (distance <= skill.radius) {
        const dealt = enemy.takeDamage(skill.damage, 'magic');
        this.gm.addFloatingText(enemy.x, enemy.y - 22, `✦${dealt}`, '#c084fc', 14);

        if (Math.random() < skill.stunChance) {
          enemy.applyStun(skill.stunDuration);
        }
      }
    }

    this.activeEffects.push({
      type: 'void_impact',
      x: centerX,
      y: centerY,
      radius: skill.radius,
      life: 0.9,
      maxLife: 0.9,
    });
  }

  render(ctx) {
    ctx.save();
    this.activeEffects.forEach(effect => {
      const elapsed = effect.maxLife - effect.life;

      if (effect.type === 'meteor') {
        // --- Phase 1: Meteor falling (first 0.4s) ---
        const fallDuration = 0.4;

        if (elapsed < fallDuration) {
          const t = elapsed / fallDuration;
          const meteorY = effect.y - 600 * (1 - t * t); // ease-in quadratic
          const meteorSize = 20 + t * 15;

          // Trailing fire
          for (let i = 0; i < 5; i++) {
            const trailT = Math.max(0, t - i * 0.04);
            const trailY = effect.y - 600 * (1 - trailT * trailT);
            ctx.globalAlpha = 0.5 - i * 0.1;
            ctx.fillStyle = i < 2 ? '#ffaa00' : '#ff4400';
            ctx.beginPath();
            ctx.arc(effect.x + (Math.random() - 0.5) * 6, trailY, meteorSize - i * 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          // Meteor body
          const gradient = ctx.createRadialGradient(effect.x, meteorY, 0, effect.x, meteorY, meteorSize);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.3, '#ffcc00');
          gradient.addColorStop(0.7, '#ff6600');
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(effect.x, meteorY, meteorSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- Phase 2: Impact + ground burn ---
        if (elapsed >= fallDuration) {
          const impactT = (elapsed - fallDuration) / (effect.maxLife - fallDuration);

          // Impact shockwave ring
          if (impactT < 0.5) {
            const ringR = effect.radius * (impactT / 0.5);
            ctx.strokeStyle = `rgba(255, 150, 0, ${1 - impactT * 2})`;
            ctx.lineWidth = 4 * (1 - impactT * 2);
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Ground fire area
          const fireAlpha = Math.max(0, 0.25 * (1 - impactT));
          const fireGrad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
          fireGrad.addColorStop(0, `rgba(255, 100, 0, ${fireAlpha})`);
          fireGrad.addColorStop(0.6, `rgba(255, 50, 0, ${fireAlpha * 0.5})`);
          fireGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          ctx.fill();

          // Flame particles
          for (let i = 0; i < 8; i++) {
            const angle = (elapsed * 2 + i / 8 * Math.PI * 2);
            const dist = effect.radius * (0.3 + Math.sin(elapsed * 5 + i) * 0.3);
            const fx = effect.x + Math.cos(angle) * dist;
            const fy = effect.y + Math.sin(angle) * dist;
            const flicker = 0.4 + Math.sin(elapsed * 10 + i * 2) * 0.3;
            ctx.fillStyle = `rgba(255, ${100 + i * 15}, 0, ${flicker * (1 - impactT)})`;
            ctx.beginPath();
            ctx.arc(fx, fy, 4 + Math.sin(elapsed * 8 + i) * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else if (effect.type === 'chain_lightning') {
        const alpha = Math.max(0, effect.life / effect.maxLife);

        // Draw lightning bolts between each chained target.
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 5;

        for (let i = 0; i < effect.targets.length - 1; i++) {
          const a = effect.targets[i];
          const b = effect.targets[i + 1];
          const segments = 5;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          for (let s = 1; s <= segments; s++) {
            const t = s / segments;
            const x = a.x + (b.x - a.x) * t + (Math.random() - 0.5) * 12;
            const y = a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 12;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        for (const target of effect.targets) {
          ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
          ctx.beginPath();
          ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (effect.type === 'void_impact') {
        const progress = 1 - effect.life / effect.maxLife;
        const alpha = Math.max(0, 1 - progress);
        const ringRadius = effect.radius * Math.min(1, progress * 1.35);

        // Void core.
        const grad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * alpha})`);
        grad.addColorStop(0.15, `rgba(192, 132, 252, ${0.65 * alpha})`);
        grad.addColorStop(0.55, `rgba(109, 40, 217, ${0.25 * alpha})`);
        grad.addColorStop(1, 'rgba(76, 29, 149, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Expanding impact ring.
        ctx.strokeStyle = `rgba(216, 180, 254, ${alpha})`;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 5 * alpha + 1;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Void particles.
        for (let i = 0; i < 12; i++) {
          const angle = i / 12 * Math.PI * 2 + elapsed * 4;
          const distance = ringRadius * (0.55 + (i % 3) * 0.12);
          ctx.fillStyle = `rgba(233, 213, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(
            effect.x + Math.cos(angle) * distance,
            effect.y + Math.sin(angle) * distance,
            2 + (i % 2),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      } else if (effect.type === 'freeze') {
        const alpha = Math.min(effect.life / 0.5, 1); // Fade in first 0.5s, keep, then fade out

        // Ice ground area
        const iceGrad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
        iceGrad.addColorStop(0, `rgba(150, 220, 255, ${0.3 * alpha})`);
        iceGrad.addColorStop(0.7, `rgba(100, 180, 255, ${0.15 * alpha})`);
        iceGrad.addColorStop(1, 'rgba(80, 160, 255, 0)');
        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Magic circle border
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.7 * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner rotating circle
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(elapsed * 0.5);
        ctx.strokeStyle = `rgba(180, 230, 255, ${0.5 * alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        // Cross lines inside
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * effect.radius * 0.6, Math.sin(a) * effect.radius * 0.6);
          ctx.stroke();
        }
        ctx.restore();

        // Ice crystal particles floating
        for (let i = 0; i < 10; i++) {
          const angle = elapsed * 0.8 + (i / 10) * Math.PI * 2;
          const dist = effect.radius * (0.2 + (i % 3) * 0.25);
          const px = effect.x + Math.cos(angle) * dist;
          const py = effect.y + Math.sin(angle) * dist + Math.sin(elapsed * 3 + i) * 5;
          ctx.fillStyle = `rgba(200, 240, 255, ${0.6 * alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.restore();
  }

  renderAoE(ctx, x, y, skillId) {
    const skill = this.skills[skillId];
    if (!skill) return;

    const time = performance.now() / 1000;
    const pulse = 0.8 + Math.sin(time * 4) * 0.2;

    ctx.save();

    if (skillId === 'meteor') {
      // Red/orange pulsing circle
      const grad = ctx.createRadialGradient(x, y, 0, x, y, skill.radius);
      grad.addColorStop(0, `rgba(255, 100, 0, ${0.15 * pulse})`);
      grad.addColorStop(0.7, `rgba(255, 50, 0, ${0.1 * pulse})`);
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 100, 0, ${0.8 * pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (skillId === 'freeze') {
      // Blue/cyan pulsing circle
      const grad = ctx.createRadialGradient(x, y, 0, x, y, skill.radius);
      grad.addColorStop(0, `rgba(100, 200, 255, ${0.15 * pulse})`);
      grad.addColorStop(0.7, `rgba(80, 160, 255, ${0.1 * pulse})`);
      grad.addColorStop(1, 'rgba(60, 120, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(100, 200, 255, ${0.8 * pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (skillId === 'chain_lightning') {
      // Chain Lightning targets a single enemy, so show a target reticle.
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.9 * pulse})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (skillId === 'void_impact') {
      // Void Impact can target an enemy or an area.
      const grad = ctx.createRadialGradient(x, y, 0, x, y, skill.radius);
      grad.addColorStop(0, `rgba(192, 132, 252, ${0.2 * pulse})`);
      grad.addColorStop(0.65, `rgba(124, 58, 237, ${0.12 * pulse})`);
      grad.addColorStop(1, 'rgba(76, 29, 149, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(192, 132, 252, ${0.9 * pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(x, y, skill.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Crosshair
    const chSize = 12;
    const crosshairColor = skillId === 'meteor'
      ? 'rgba(255,150,0,0.9)'
      : skillId === 'void_impact'
        ? 'rgba(192,132,252,0.95)'
        : skillId === 'chain_lightning'
          ? 'rgba(125,211,252,0.95)'
          : 'rgba(100,200,255,0.9)';
    ctx.strokeStyle = crosshairColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - chSize, y);
    ctx.lineTo(x + chSize, y);
    ctx.moveTo(x, y - chSize);
    ctx.lineTo(x, y + chSize);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = skillId === 'meteor'
      ? '#ffaa00'
      : skillId === 'void_impact'
        ? '#d8b4fe'
        : skillId === 'chain_lightning'
          ? '#7dd3fc'
          : '#88ddff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

