# @vaultbricks/dss-core

Core Solidity contracts and interfaces for the DeFi Strategy Standard (DSS).

## Overview

`@vaultbricks/dss-core` provides base implementations of common DeFi strategy components:

- **Interfaces**: Standardized interfaces for DSS-compliant strategies
- **Access Control**: Ready-to-use role-based access control (Owner, Keeper, Guardian)
- **Timelock**: Governance timelock implementation
- **Pausable**: Emergency pause mechanism

## Installation

### Using npm/yarn

```bash
npm install @vaultbricks/dss-core
# or
yarn add @vaultbricks/dss-core
```

### Using Foundry

```bash
forge install VaultBricks/DSS --no-commit
```

Then in your Solidity file:

```solidity
import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
```

## Usage

### Implementing a DSS Strategy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";

contract MyStrategy is IDSSStrategy, DSSAccessControl, DSSPausable {
    
    function calculateWeights() external view returns (uint256[] memory) {
        // Your strategy logic
    }
    
    function rebalance() external onlyKeeper whenNotPaused {
        // Rebalancing logic
    }
}
```

## Interfaces

### IDSSStrategy

The core interface that all DSS-compliant strategies must implement:

```solidity
interface IDSSStrategy {
    function getAssets() external view returns (address[] memory);
    function calculateWeights() external view returns (uint256[] memory);
    function rebalance() external;
    function lastRebalance() external view returns (uint256);
}
```

## Contracts

### DSSAccessControl

Provides role-based access control with predefined roles:

- `OWNER_ROLE`: Can upgrade contracts, change critical parameters
- `ADMIN_ROLE`: Can configure non-critical parameters
- `KEEPER_ROLE`: Can trigger rebalances
- `GUARDIAN_ROLE`: Can emergency pause

### DSSTimelock

Governance timelock with configurable delays.

### DSSPausable

Emergency pause mechanism compliant with DSS-4 (Risk Management).

## Documentation

For complete documentation, see the [DSS Specification](https://github.com/VaultBricks/DSS).

## License

MIT



