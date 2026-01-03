# DSS SDK Quick Reference

**Quick reference for @vaultbricks/dss-core, @vaultbricks/dss-test, and @vaultbricks/dss-cli**

## Installation

```bash
# CLI (global)
npm install -g @vaultbricks/dss-cli

# Core contracts
npm install @vaultbricks/dss-core

# Test utilities (dev dependency)
npm install --save-dev @vaultbricks/dss-test
```

## @vaultbricks/dss-core - Common Imports

```solidity
// Core interface
import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";

// Access control
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";

// Emergency pause
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";

// Weight library
import "@vaultbricks/dss-core/libraries/DSSWeightLib.sol";
```

## @vaultbricks/dss-test - Common Patterns

### Invariant Testing

```typescript
import { InvariantRunner } from "@vaultbricks/dss-test";

const runner = new InvariantRunner({ iterations: 200, seed: 42 });

await runner.run({
  name: "Weight sum invariant",
  setup: async () => { /* setup */ },
  actions: [action1, action2, action3],
  invariants: [checkInvariant1, checkInvariant2]
});
```

### Fuzzing

```typescript
import { FuzzHelpers, runFuzzTest } from "@vaultbricks/dss-test";
import fc from "fast-check";

await runFuzzTest(
  fc.asyncProperty(
    FuzzHelpers.arbitraryWeights(2, 5),
    async (weights) => {
      // Test logic
      return true;
    }
  ),
  { iterations: 600 }
);
```

### Standard Tests

```typescript
import { StandardTests } from "@vaultbricks/dss-test";

await StandardTests.runStandardDSSTests(strategy, {
  owner, keeper, guardian, user
});
```

## @vaultbricks/dss-cli - Common Commands

```bash
# Initialize project
dss init my-strategy

# Check compliance
dss check --level silver

# Generate report
dss report --output CERTIFICATION.md
```

## Strategy Template

```solidity
contract MyStrategy is IDSSStrategy, DSSAccessControl, DSSPausable {
    function rebalance() external onlyKeeper whenNotPaused {
        // Implementation
    }
}
```

## Test Template

```typescript
describe("MyStrategy", function () {
  let strategy: any;
  
  beforeEach(async function () {
    const Strategy = await ethers.getContractFactory("MyStrategy");
    strategy = await Strategy.deploy(/* args */);
  });
  
  it("should pass standard tests", async function () {
    await StandardTests.runStandardDSSTests(strategy, roles);
  });
});
```

## Certification Levels

- **Bronze**: >80% compliance
- **Silver**: >95% compliance  
- **Gold**: >98% compliance

## Links

- [Full SDK Usage Guide](./SDK-USAGE-GUIDE.md)
- [Getting Started Guide](../GETTING-STARTED.md)
- [Examples](../examples/)
