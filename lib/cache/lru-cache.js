/**
 * LRU (Least Recently Used) Cache Implementation
 * Memory-efficient cache with automatic size management and TTL support
 */

/**
 * Simple LRU Cache with TTL support
 * Prevents unbounded memory growth by evicting oldest entries when size limit reached
 */
export class LRUCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    
    // Using Map for insertion order preservation (ES2015+)
    this.cache = new Map();
    this.timers = new Map(); // TTL cleanup timers
    
    // Statistics for monitoring
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expired: 0,
      sets: 0
    };
  }

  /**
   * Get value from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.expired++;
      this.stats.misses++;
      return null;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key, value, ttl = null) {
    const actualTTL = ttl || this.defaultTTL;
    const expiresAt = actualTTL ? Date.now() + actualTTL : null;
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.clearTimer(key);
    }
    
    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    // Add new entry
    const entry = {
      value,
      createdAt: Date.now(),
      expiresAt
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
    
    // Set TTL timer if needed
    if (expiresAt) {
      const timer = setTimeout(() => {
        this.delete(key);
        this.stats.expired++;
      }, actualTTL);
      
      this.timers.set(key, timer);
    }
    
    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key) {
    const existed = this.cache.delete(key);
    this.clearTimer(key);
    return existed;
  }

  /**
   * Clear all entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    const size = this.cache.size;
    this.cache.clear();
    this.timers.clear();
    
    return size;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.expired++;
      return false;
    }
    
    return true;
  }

  /**
   * Get cache size
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
      
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  getMemoryUsage() {
    let estimatedBytes = 0;
    
    for (const [key, entry] of this.cache) {
      // Rough estimation: key + value + metadata
      estimatedBytes += key.length * 2; // UTF-16
      estimatedBytes += JSON.stringify(entry.value).length * 2;
      estimatedBytes += 64; // metadata overhead
    }
    
    return {
      estimatedBytes,
      estimatedKB: Math.round(estimatedBytes / 1024),
      estimatedMB: Math.round(estimatedBytes / 1024 / 1024 * 100) / 100
    };
  }

  /**
   * Clean up expired entries manually
   */
  cleanup() {
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    this.stats.expired += cleanedCount;
    return cleanedCount;
  }

  /**
   * Get all keys (for debugging)
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all entries (for debugging and iteration)
   */
  entries() {
    return Array.from(this.cache.entries());
  }

  /**
   * Make the cache iterable
   */
  [Symbol.iterator]() {
    return this.cache[Symbol.iterator]();
  }

  /**
   * Private: Evict oldest entry
   */
  evictOldest() {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Private: Clear timer for key
   */
  clearTimer(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
}