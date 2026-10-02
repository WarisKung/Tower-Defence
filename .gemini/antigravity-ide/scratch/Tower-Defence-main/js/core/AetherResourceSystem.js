/**
 * ASTRA: Aether Guardians — Aether Resource System
 * Manages in-battle Aether Points resource
 */
export class AetherResourceSystem {
  constructor(startingAether = 200) {
    this.aether = startingAether;
    this.maxAether = 9999;

    // Passive generation
    this.passiveRate = 5; // Aether per second
    this.passiveTimer = 0;

    // Stats tracking
    this.totalEarned = startingAether;
    this.totalSpent = 0;
  }

  /**
   * Update passive Aether generation
   */
  update(dt) {
    this.passiveTimer += dt;
    if (this.passiveTimer >= 1.0) {
      this.passiveTimer -= 1.0;
      this.addAether(this.passiveRate);
    }
  }

  /**
   * Add Aether (from kills or passive)
   */
  addAether(amount) {
    this.aether = Math.min(this.maxAether, this.aether + amount);
    this.totalEarned += amount;
  }

  /**
   * Spend Aether
   */
  spendAether(amount) {
    if (this.aether < amount) return false;
    this.aether -= amount;
    this.totalSpent += amount;
    return true;
  }

  /**
   * Check if we can afford a cost
   */
  canAfford(cost) {
    return this.aether >= cost;
  }

  /**
   * Get current Aether
   */
  getAether() {
    return Math.floor(this.aether);
  }
}
