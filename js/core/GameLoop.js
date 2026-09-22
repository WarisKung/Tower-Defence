/**
 * ASTRA: Aether Guardians — Game Loop
 * Core game loop with requestAnimationFrame and deltaTime
 */
export class GameLoop {
  constructor() {
    this.isRunning = false;
    this.lastTimestamp = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.speedMultiplier = 1;
    this.updateCallback = null;
    this.renderCallback = null;
    this._boundLoop = this._loop.bind(this);
    this.animFrameId = null;

    // Fixed timestep for physics (60 updates per second)
    this.fixedTimeStep = 1 / 60;
    this.accumulator = 0;
    this.maxDeltaTime = 0.1; // Cap to prevent spiral of death
  }

  /**
   * Start the game loop
   * @param {Function} updateFn - Called with (deltaTime) each fixed step
   * @param {Function} renderFn - Called with (interpolation) each frame
   */
  start(updateFn, renderFn) {
    this.updateCallback = updateFn;
    this.renderCallback = renderFn;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.animFrameId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = performance.now();
      this.accumulator = 0;
      this.animFrameId = requestAnimationFrame(this._boundLoop);
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }

  _loop(timestamp) {
    if (!this.isRunning) return;

    // Calculate raw delta time in seconds
    let rawDeltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Clamp delta to prevent huge jumps (e.g., after tab switch)
    rawDeltaTime = Math.min(rawDeltaTime, this.maxDeltaTime);

    // Apply speed multiplier
    this.deltaTime = rawDeltaTime * this.speedMultiplier;

    // FPS counter
    this.frameCount++;
    this.fpsTimer += rawDeltaTime;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1.0;
    }

    // Fixed timestep updates
    this.accumulator += this.deltaTime;
    while (this.accumulator >= this.fixedTimeStep) {
      if (this.updateCallback) {
        this.updateCallback(this.fixedTimeStep);
      }
      this.accumulator -= this.fixedTimeStep;
    }

    // Render with interpolation factor
    const interpolation = this.accumulator / this.fixedTimeStep;
    if (this.renderCallback) {
      this.renderCallback(interpolation);
    }

    // Schedule next frame
    this.animFrameId = requestAnimationFrame(this._boundLoop);
  }
}
