/**
 * ASTRA: Aether Guardians — Enemy Base Class
 * Base class for all enemies with path following
 */
import { Entity } from './Entity.js';

export class EnemyBase extends Entity {
  constructor(x, y, enemyData) {
    super(x, y);

    // Identity
    this.enemyId = enemyData.enemy_id;
    this.name = enemyData.name;

    // Stats
    this.maxHP = enemyData.hp;
    this.hp = this.maxHP;
    this.moveSpeed = enemyData.move_speed * 32; // Convert to pixels/sec
    this.armorType = enemyData.armor_type || 'none';
    this.damageToCore = enemyData.damage_to_core || 1;
    this.rewardAether = enemyData.reward_aether || 10;

    // Special
    this.isFlying = enemyData.is_flying || false;
    this.specialAbility = enemyData.special_ability || null;

    // Path
    this.path = [];
    this.pathIndex = 0;
    this.reachedEnd = false;

    // Visual
    this.bodyColor = enemyData.color || '#8b0000';
    this.width = 20;
    this.height = 20;

    // Effects
    this.slowMultiplier = 1;
    this.slowDuration = 0;
    this.damageFlash = 0;
    this.hitShake = 0;

    // Burn effect
    this.isBurning = false;
    this.burnDPS = 0;           // damage per second
    this.burnDuration = 0;      // remaining seconds
    this.burnDmgAccum = 0;      // accumulator for 1-second ticks

    // Freeze effect
    this.isFrozen = false;
    this.freezeDuration = 0;    // remaining seconds
    this.frozenOriginalSpeed = 0;

    // Stun effect (used by VOID IMPACT)
    this.isStunned = false;
    this.stunDuration = 0;

    // State
    this.state = 'MOVING';
    this.blockedBy = null; // Knight that blocks this enemy
  }

  /**
   * Set the path waypoints (in screen coordinates)
   */
  setPath(waypoints) {
    this.path = waypoints;
    this.pathIndex = 0;
    if (waypoints.length > 0) {
      this.x = waypoints[0].x;
      this.y = waypoints[0].y;
      this.prevX = this.x;
      this.prevY = this.y;
    }
  }

  update(dt, gameManager) {
    super.update(dt);

    if (this.isDead || this.reachedEnd) return;

    // Update effects
    if (this.damageFlash > 0) this.damageFlash -= dt * 5;
    if (this.hitShake > 0) this.hitShake -= dt * 8;

    // --- Burn effect ---
    if (this.isBurning) {
      this.burnDuration -= dt;
      this.burnDmgAccum += dt;
      // Apply damage once per second
      while (this.burnDmgAccum >= 1.0) {
        this.burnDmgAccum -= 1.0;
        const dmg = this.takeDamage(this.burnDPS, 'magic');
        if (gameManager) {
          gameManager.addFloatingText(this.x, this.y - 20, `🔥${dmg}`, '#ff6600', 12);
        }
      }
      if (this.burnDuration <= 0) {
        this.isBurning = false;
        this.burnDPS = 0;
        this.burnDmgAccum = 0;
      }
      if (this.isDead) return;
    }

    // --- Stun effect ---
    if (this.isStunned) {
      this.stunDuration -= dt;
      if (this.stunDuration <= 0) {
        this.isStunned = false;
        this.stunDuration = 0;
      } else {
        this.state = 'STUNNED';
        return;
      }
    }

    // --- Freeze effect ---
    if (this.isFrozen) {
      this.freezeDuration -= dt;
      if (this.freezeDuration <= 0) {
        this.isFrozen = false;
        this.moveSpeed = this.frozenOriginalSpeed;
      } else {
        // Frozen: do not move
        this.state = 'FROZEN';
        return;
      }
    }

    // Slow effect
    if (this.slowDuration > 0) {
      this.slowDuration -= dt;
      if (this.slowDuration <= 0) {
        this.slowMultiplier = 1;
      }
    }

    // If blocked by a knight, don't move but attack the knight
    if (this.blockedBy && !this.blockedBy.isDead) {
      this.state = 'BLOCKED';
      return;
    } else {
      this.blockedBy = null;
    }

    // Move along path
    this._moveAlongPath(dt);
  }

  _moveAlongPath(dt) {
    if (this.pathIndex >= this.path.length) {
      this.reachedEnd = true;
      return;
    }

    const target = this.path[this.pathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = this.moveSpeed * this.slowMultiplier;

    if (dist < speed * dt) {
      // Reached waypoint
      this.x = target.x;
      this.y = target.y;
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.reachedEnd = true;
      }
    } else {
      // Move toward waypoint
      const nx = dx / dist;
      const ny = dy / dist;
      this.x += nx * speed * dt;
      this.y += ny * speed * dt;
    }

    this.state = 'MOVING';
  }

  /**
   * Take damage with armor calculation
   */
  takeDamage(damage, damageType = 'physical') {
    let actualDamage = damage;

    // Armor reduction
    if (this.armorType === 'heavy' && damageType === 'physical') {
      actualDamage = Math.floor(damage * 0.5);
    } else if (this.armorType === 'heavy' && damageType === 'magic') {
      actualDamage = Math.floor(damage * 1.5); // Armored enemies weak to magic
    }

    actualDamage = Math.max(1, actualDamage);
    this.hp -= actualDamage;
    this.damageFlash = 1;
    this.hitShake = 1;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.state = 'DEAD';
    }

    return actualDamage;
  }

  /**
   * Apply slow effect
   */
  applySlow(multiplier, duration) {
    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
    this.slowDuration = Math.max(this.slowDuration, duration);
  }

  /**
   * Apply burn (damage over time)
   * @param {number} dps - damage per second
   * @param {number} duration - total burn duration in seconds
   */
  applyBurn(dps, duration) {
    this.isBurning = true;
    this.burnDPS = dps;
    this.burnDuration = duration;
    this.burnDmgAccum = 0;
  }

  /**
   * Apply freeze (stop movement)
   * @param {number} duration - freeze duration in seconds
   */
  applyFreeze(duration) {
    if (!this.isFrozen) {
      this.frozenOriginalSpeed = this.moveSpeed;
    }
    this.isFrozen = true;
    this.freezeDuration = duration;
    this.moveSpeed = 0;
  }

  /**
   * Apply stun effect
   * @param {number} duration - stun duration in seconds
   */
  applyStun(duration) {
    this.isStunned = true;
    this.stunDuration = Math.max(this.stunDuration, duration);
  }

  /**
   * Render the enemy
   */
  render(ctx, interpolation) {
    if (this.isDead) return;

    const pos = this.getInterpolatedPos(interpolation);
    let x = pos.x;
    let y = pos.y;

    // Hit shake
    if (this.hitShake > 0) {
      x += (Math.random() - 0.5) * 4 * this.hitShake;
    }

    // Spawn animation
    let drawScale = 1;
    if (this.spawnTimer > 0) {
      drawScale = 1 - this.spawnTimer / 0.4;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(drawScale, drawScale);

    // Flying offset
    if (this.isFlying) {
      ctx.translate(0, -10 + Math.sin(this.animTimer * 3) * 3);
      // Shadow below
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body color with damage flash
    let color = this.bodyColor;
    if (this.damageFlash > 0) {
      color = '#ffffff';
    }

    // Draw enemy body
    this._drawBody(ctx, color);

    // --- Burn visual: flame particles around body ---
    if (this.isBurning) {
      for (let i = 0; i < 4; i++) {
        const angle = this.animTimer * 4 + (i / 4) * Math.PI * 2;
        const fx = Math.cos(angle) * 10;
        const fy = Math.sin(angle) * 6 - 4;
        const flicker = 0.4 + Math.sin(this.animTimer * 10 + i) * 0.3;
        ctx.fillStyle = `rgba(255, 120, 0, ${flicker})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glow
      ctx.fillStyle = 'rgba(255, 80, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(0, -4, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Stun visual ---
    if (this.isStunned) {
      ctx.strokeStyle = 'rgba(255, 220, 80, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -10, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('✦', -7, -22);
      ctx.fillText('✦', 7, -22);
      ctx.fillStyle = '#fff3a3';
      ctx.font = 'bold 10px Outfit';
      ctx.fillText(`${Math.ceil(this.stunDuration)}s`, 0, -28);
    }

    // --- Freeze visual: ice shell around body ---
    if (this.isFrozen) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-13, -18, 26, 28, 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(150, 220, 255, 0.25)';
      ctx.fill();

      // Ice particles
      for (let i = 0; i < 3; i++) {
        const ix = -8 + i * 8;
        const iy = -16 + Math.sin(this.animTimer * 2 + i) * 3;
        ctx.fillStyle = 'rgba(200, 240, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(ix, iy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Freeze countdown
      ctx.fillStyle = '#88ddff';
      ctx.font = 'bold 10px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(this.freezeDuration)}s`, 0, -22);
    }

    ctx.restore();

    // HP bar
    this._renderHPBar(ctx, x, y - (this.isFlying ? 30 : 20));
  }

  /**
   * Draw enemy body — override for different enemy types
   */
  _drawBody(ctx, color) {
    // Default enemy body: angular/demonic shape
    ctx.fillStyle = color;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, -4);
    ctx.lineTo(8, 6);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-10, -4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(-4, -6, 2, 0, Math.PI * 2);
    ctx.arc(4, -6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _renderHPBar(ctx, x, y) {
    const barWidth = 22;
    const barHeight = 3;
    const hpPercent = this.hp / this.maxHP;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

    // HP fill
    const color = hpPercent > 0.5 ? '#ef4444' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = color;
    ctx.fillRect(x - barWidth / 2, y, barWidth * hpPercent, barHeight);
  }
}
