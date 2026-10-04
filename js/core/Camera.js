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
    this.rotation = 0;
    this.targetRotation = 0;
    this.smoothing = 0.1;
  }

  /**
   * Apply camera transform to canvas context
   */
  applyTransform(ctx) {
    // Keep rotation around the viewport center so the map, path and entities rotate together.
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    // Keep the existing zoom behavior unchanged; Stage 1 only adds a small rotation.
    ctx.translate(-this.x * this.zoom, -this.y * this.zoom);
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    // Inverse of applyTransform(): undo rotation, then zoom, then camera position.
    const angle = -this.rotation * Math.PI / 180;
    const dx = screenX - this.viewportWidth / 2;
    const dy = screenY - this.viewportHeight / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    return {
      x: rotatedX / this.zoom + this.x,
      y: rotatedY / this.zoom + this.y,
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
    this.rotation += (this.targetRotation - this.rotation) * this.smoothing;
  }

  /**
   * Set camera rotation in degrees.
   */
  setRotation(degrees) {
    this.targetRotation = degrees;
    this.rotation = degrees;
  }

  /**
   * Zoom in/out
   */
  setZoom(zoom) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }
}
