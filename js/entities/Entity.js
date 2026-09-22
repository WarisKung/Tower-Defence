/**
 * ASTRA: Aether Guardians — Entity Base Class
 * Base class for all game entities (units, enemies)
 */
export class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.width = 32;
    this.height = 32;

    // State
    this.state = 'IDLE'; // IDLE, ATTACKING, DEAD
    this.isDead = false;

    // Visual
    this.color = '#ffffff';
    this.opacity = 1;
    this.scale = 1;

    // Animation
    this.animTimer = 0;
    this.animFrame = 0;
    this.spawnTimer = 0.4; // Spawn-in animation
  }

  update(dt) {
    // Store previous position for interpolation
    this.prevX = this.x;
    this.prevY = this.y;

    // Spawn animation
    if (this.spawnTimer > 0) {
      this.spawnTimer -= dt;
    }

    this.animTimer += dt;
  }

  render(ctx, interpolation) {
    // Override in subclasses
  }

  /**
   * Get interpolated position for smooth rendering
   */
  getInterpolatedPos(interpolation) {
    return {
      x: this.prevX + (this.x - this.prevX) * interpolation,
      y: this.prevY + (this.y - this.prevY) * interpolation,
    };
  }

  /**
   * Get distance to another entity
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
