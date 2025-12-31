// packages/test/src/InvariantRunner.ts

/**
 * @file InvariantRunner.ts
 * @description Property-based testing framework for DSS invariants
 * @dev Implements DSS-2 (Economic Invariants) testing requirements
 */

export interface InvariantConfig {
  /** Number of test iterations */
  iterations?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Verbose logging */
  verbose?: boolean;
}

export interface InvariantTest {
  /** Test name for reporting */
  name: string;
  /** Setup function called before each iteration */
  setup: () => Promise<void>;
  /** Array of random actions to execute */
  actions: Array<() => Promise<void>>;
  /** Array of invariant checks (must all pass) */
  invariants: Array<() => Promise<void>>;
}

/**
 * Simple PRNG for reproducible random testing
 * Mulberry32 algorithm
 */
export class Mulberry32 {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * InvariantRunner
 * Executes property-based invariant tests for DSS strategies
 * 
 * @example
 * const runner = new InvariantRunner({ iterations: 200, seed: 42 });
 * await runner.run({
 *   name: "Weight sum invariant",
 *   setup: async () => { ... },
 *   actions: [depositAction, withdrawAction, rebalanceAction],
 *   invariants: [checkWeightSum, checkNonNegative]
 * });
 */
export class InvariantRunner {
  private iterations: number;
  private seed: number;
  private verbose: boolean;
  private rng: Mulberry32;

  constructor(config: InvariantConfig = {}) {
    this.iterations = config.iterations ?? parseInt(process.env.INVARIANT_ITERS || "200");
    this.seed = config.seed ?? parseInt(process.env.INVARIANT_SEED || Date.now().toString());
    this.verbose = config.verbose ?? (process.env.INVARIANT_VERBOSE === "true");
    this.rng = new Mulberry32(this.seed);
  }

  /**
   * Run an invariant test
   * @param test Test configuration
   */
  async run(test: InvariantTest): Promise<void> {
    if (this.verbose) {
      console.log(`\n🔬 Running invariant test: ${test.name}`);
      console.log(`   Iterations: ${this.iterations}`);
      console.log(`   Seed: ${this.seed}\n`);
    }

    for (let i = 0; i < this.iterations; i++) {
      if (this.verbose && i % 50 === 0) {
        console.log(`   Progress: ${i}/${this.iterations}`);
      }

      try {
        // Setup
        await test.setup();

        // Execute random sequence of actions
        const actionCount = this.rng.nextInt(1, 10);
        for (let j = 0; j < actionCount; j++) {
          const actionIndex = this.rng.nextInt(0, test.actions.length - 1);
          try {
            await test.actions[actionIndex]();
          } catch (e) {
            // Some actions may revert - that's expected
            if (this.verbose) {
              console.log(`   Action ${j} reverted (expected): ${(e as Error).message}`);
            }
          }
        }

        // Verify all invariants hold
        for (const invariant of test.invariants) {
          await invariant();
        }
      } catch (error) {
        console.error(`\n❌ Invariant violation at iteration ${i}`);
        console.error(`   Test: ${test.name}`);
        console.error(`   Seed: ${this.seed}`);
        console.error(`   Error: ${(error as Error).message}\n`);
        throw error;
      }
    }

    if (this.verbose) {
      console.log(`\n✅ All ${this.iterations} iterations passed!\n`);
    }
  }

  /**
   * Run multiple invariant tests
   * @param tests Array of test configurations
   */
  async runSuite(tests: InvariantTest[]): Promise<void> {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Running DSS Invariant Test Suite`);
    console.log(`${"=".repeat(60)}\n`);

    for (const test of tests) {
      await this.run(test);
    }

    console.log(`\n✅ All ${tests.length} invariant tests passed!\n`);
  }
}

/**
 * Create an InvariantRunner with configuration from environment variables
 */
export function createInvariantRunner(config?: InvariantConfig): InvariantRunner {
  return new InvariantRunner(config);
}



