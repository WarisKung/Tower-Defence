/**
 * ASTRA: Aether Guardians — Wave Manager
 * Manages enemy wave spawning during battle
 */
export class WaveManager {
  constructor(waveData, gameManager) {
    this.waves = waveData; // Array of wave definitions
    this.gm = gameManager;

    this.currentWaveIndex = -1;
    this.totalWaves = waveData.length;

    // Spawn state
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.nextSpawnDelay = 0;

    this.waveComplete = false;
    this.allWavesComplete = false;
  }

  /**
   * Start the next wave
   */
  startNextWave() {
    this.currentWaveIndex++;

    if (this.currentWaveIndex >= this.totalWaves) {
      this.allWavesComplete = true;
      return;
    }

    const wave = this.waves[this.currentWaveIndex];
    this.waveComplete = false;

    // Build spawn queue from wave data
    this.spawnQueue = [];
    for (const group of wave.groups) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          type: group.type,
          pathIndex: group.pathIndex === 'random'
            ? Math.floor(Math.random() * this.gm.currentStageData.paths.length)
            : (group.pathIndex ?? 0),
          delay: group.delay || 0,
        });
      }
    }

    this.spawnTimer = 0;
    this.nextSpawnDelay = 0;
    console.log(`[ASTRA] Wave ${this.currentWaveIndex + 1}/${this.totalWaves} started — ${this.spawnQueue.length} enemies`);
  }

  /**
   * Update spawning
   */
  update(dt) {
    if (this.allWavesComplete || this.spawnQueue.length === 0) {
      // Check if wave is complete (no more enemies to spawn and all enemies dead)
      if (this.spawnQueue.length === 0 && !this.waveComplete) {
        this.waveComplete = true;

        // Auto-start next wave after a brief delay if there are more
        if (this.currentWaveIndex < this.totalWaves - 1) {
          setTimeout(() => {
            if (this.gm.state === 'BATTLE') {
              this.startNextWave();
              this.gm.hud.update();
            }
          }, 3000); // 3 seconds delay between waves
        } else {
          this.allWavesComplete = true;
        }
      }
      return;
    }

    this.spawnTimer += dt;

    if (this.spawnTimer >= this.nextSpawnDelay) {
      this.spawnTimer = 0;
      const spawn = this.spawnQueue.shift();
      if (spawn) this.gm.spawnEnemy(spawn.type, spawn.pathIndex);
      this.nextSpawnDelay = this.spawnQueue[0]?.delay || 0;
    }
  }

  /**
   * Check if current wave's spawning is done
   */
  isCurrentWaveComplete() {
    return this.waveComplete;
  }

  /**
   * Check if all waves are done and no enemies remain
   */
  isComplete() {
    return this.allWavesComplete && this.spawnQueue.length === 0;
  }

  /**
   * Get current wave info
   */
  getCurrentWaveNumber() {
    return this.currentWaveIndex + 1;
  }

  getTotalWaves() {
    return this.totalWaves;
  }
}
