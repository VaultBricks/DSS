# Fixed6040Strategy - DSS Rebalancing Example

**Production-tested 60/40 portfolio strategy adapted from BOLD-APEX**

This example demonstrates a classic balanced portfolio allocation with automatic rebalancing. The code is adapted from [BOLD-APEX Fixed6040Facet](https://github.com/VaultBricks/BOLD-APEX), a production system managing real user funds.

## 📋 Overview

**Fixed6040Strategy** maintains a 60/40 allocation between two primary assets, automatically rebalancing to maintain target weights.

### Key Features

- ✅ **60/40 allocation** - Classic balanced portfolio
- ✅ **Automatic rebalancing** - Weekly rebalancing by default
- ✅ **Constraint enforcement** - Respects min/max bounds
- ✅ **Production-tested** - Based on real DeFi deployments
- ✅ **DSS-compliant** - Full compliance with DSS requirements

### Strategy Behavior

```
2+ Active Assets → 60% to first, 40% to second
1 Active Asset   → 100% to that asset
0 Active Assets  → All zeros (paused state)
```

## 💡 Use Cases

### Traditional Finance Inspired

```solidity
// 60% stocks / 40% bonds equivalent
assets = [WETH, DAI];
// → 60% growth asset, 40% stable asset
```

### Crypto Balanced Portfolio

```solidity
// 60% BTC / 40% stablecoin
assets = [WBTC, USDC];
// → Exposure to Bitcoin with stable base
```

### Multi-Asset with Hedging

```solidity
// 60% ETH / 40% yield-bearing stablecoin
assets = [WETH, aUSDC];
// → Growth + yield generation
```

## 🏗️ Architecture

```
Fixed6040Strategy
├── First Active Asset  → 6000 bps (60%)
├── Second Active Asset → 4000 bps (40%)
└── Other Assets        →    0 bps (0%)
```

## 🧪 Testing

### Test Coverage

| Test Suite | Description | DSS Category |
|------------|-------------|--------------|
| `core.test.ts` | Deployment, weight calc, timing | DSS-1, DSS-3 |
| `invariants.test.ts` | Weight sum, bounds, conservation | DSS-2 |
| `fuzzing.test.ts` | Property-based testing | DSS-7 |

### Running Tests

```bash
npm install
npm test
```

## 🎯 DSS Compliance

- ✅ DSS-1: Core Strategy Tests
- ✅ DSS-2: Economic Invariants
- ✅ DSS-3: Trigger & Timing Tests
- ✅ DSS-4: Risk Management Tests
- ✅ DSS-7: Stress Tests & Fuzzing
- ✅ DSS-9: Operational Security

## 📖 Usage Example

```solidity
// Deploy 60/40 ETH/USDC strategy
address[] memory assets = [WETH, USDC];
uint256[] memory minWeights = [4000, 2000]; // 40% min, 20% min
uint256[] memory maxWeights = [8000, 6000]; // 80% max, 60% max

Fixed6040Strategy strategy = new Fixed6040Strategy(
    assets,
    minWeights,
    maxWeights
);

// Initial allocation: 60/40
uint256[] memory weights = strategy.calculateWeights();
// → [6000, 4000]

// Weekly rebalancing
strategy.grantKeeperRole(keeperBot);
// Keeper calls rebalance() every 7 days

// Adjust if markets shift
// If WETH is at 70%, keeper rebalances back to 60%
```

## 📚 Comparison with HODLStrategy

| Feature | Fixed6040Strategy | HODLStrategy |
|---------|-------------------|--------------|
| Allocation | 60/40 fixed split | Equal weight across all |
| Asset Count | Focuses on first 2 | All active assets |
| Rebalance Frequency | Weekly (default) | Daily (default) |
| Use Case | Balanced portfolio | Diversified equal exposure |

## 🙏 Credits

Based on BOLD-APEX `Fixed6040Facet.sol` - production-tested code managing real DeFi positions.

## 📄 License

MIT License

---

**Built with ❤️ by VaultBricks**  
Part of the DeFi Strategy Standard (DSS) project

