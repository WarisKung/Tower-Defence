/**
 * ASTRA: Aether Guardians — Object Pool
 * Reusable object pool to prevent garbage collection stutter
 */
export class ObjectPool {
  constructor(factoryFn, initialSize = 20) {
    this.factoryFn = factoryFn;
    this.pool = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factoryFn());
    }
  }
  
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factoryFn();
  }
  
  release(obj) {
    if (obj.reset) obj.reset();
    this.pool.push(obj);
  }
}
