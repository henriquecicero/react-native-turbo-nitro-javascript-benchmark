export interface Measurement<T> {
    /** Total elapsed time in ms for all runs */
    totalTime: number;
    /** The last value returned by your function */
    lastResult: T;
    /** average time per run (totalTime / runs) */
    avgTime: number;
}

/**
 * Measure a synchronous function.
 *
 * @param fn – the function to call
 * @param runs – how many times to loop (default: 1)
 */
export function measureSync<T>(fn: () => T, runs = 1): Measurement<T> {
    let lastResult!: T;
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) {
      lastResult = fn();
    }
    const totalTime = performance.now() - t0;

    return {
      totalTime,
      lastResult,
      avgTime: totalTime / runs,
    };
}

/**
 * Measure an async function.
 *
 * @param fn – the async function to call
 * @param runs – how many times to loop (default: 1)
 */
export async function measureAsync<T>(fn: () => Promise<T>, runs = 1): Promise<Measurement<T>> {
    let lastResult!: T;
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) {
      lastResult = await fn();
    }
    const totalTime = performance.now() - t0;
    return {
      totalTime,
      lastResult,
      avgTime: totalTime / runs,
    };
  }
