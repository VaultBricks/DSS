// packages/test/src/index.ts

/**
 * @dss/test - Testing framework for DSS-compliant strategies
 * 
 * Main exports:
 * - InvariantRunner: Property-based testing for invariants (DSS-2)
 * - FuzzHelpers: Utilities for fuzzing with fast-check (DSS-7)
 * - StandardTests: Pre-built test suites for ERC-4626, Access Control, etc.
 */

export { InvariantRunner, createInvariantRunner, InvariantConfig, InvariantTest, Mulberry32 } from './InvariantRunner';
export * from './FuzzHelpers';
export * from './StandardTests';



