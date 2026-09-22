/**
 * ASTRA: Aether Guardians — Camera
 * Pan/zoom management for canvas rendering
 */
export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Zoom limits
    this.minZoom = 0.5;
    this.maxZoom = 2.0;

    // Smooth camera movement
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1;
    this.smoothing = 0.1;
  }

  /**
   * Apply camera transform to canvas context
   */
  applyTransform(ctx) {
    ctx.translate(
      this.viewportWidth / 2 - this.x * this.zoom,
      this.viewportHeight / 2 - this.y * this.zoom
    );
    // For now, zoom is kept at 1 for simplicity
    // ctx.scale(this.zoom, this.zoom);
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.viewportWidth / 2) / this.zoom + this.x,
      y: (screenY - this.viewportHeight / 2) / this.zoom + this.y,
    };
  }

  /**
   * Pan camera
   */
  pan(dx, dy) {
    this.targetX += dx;
    this.targetY += dy;
  }

  /**
   * Set camera position
   */
  setPosition(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.x = x;
    this.y = y;
  }

  /**
   * Update camera (smooth movement)
   */
  update(dt) {
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    this.zoom += (this.targetZoom - this.zoom) * this.smoothing;
  }

  /**
   * Zoom in/out
   */
  setZoom(zoom) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }
}
