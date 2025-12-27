# DSS-10: Governance & Upgrades

This document covers DSS-10, which consolidates governance security and documentation requirements.

**Note:** This document reflects the DSS 1.0 structure:
- **DSS-10**: Governance & Upgrades (consolidates upgrades and documentation)

---

## DSS-10.1: Upgrade & Governance Security

**Priority:** P1 — High
**Certification:** Required for Gold

### 10.1.1 Overview

Upgradeable contracts introduce governance risks. DSS requires safeguards to prevent malicious upgrades and ensure community oversight.

### 10.1.2 Upgrade Security Requirements

#### 10.1.2.1 Timelock Requirements

| Level  | Minimum Delay  | Emergency Bypass    |
|--------|----------------|---------------------|
| Bronze | None required  | N/A                 |
| Silver | 24 hours       | Guardian pause only |
| Gold   | 48 hours       | Multi-sig (4/7)     |

#### 10.1.2.2 Implementation

```solidity
// contracts/governance/Timelock.sol
contract StrategyTimelock {
    uint256 public constant MINIMUM_DELAY = 48 hours;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    uint256 public constant GRACE_PERIOD = 14 days;

    mapping(bytes32 => bool) public queuedTransactions;

    event TransactionQueued(
        bytes32 indexed txHash,
        address target,
        uint256 value,
        bytes data,
        uint256 eta
    );

    event TransactionExecuted(
        bytes32 indexed txHash,
        address target,
        uint256 value,
        bytes data
    );

    function queueTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 eta
    ) external onlyAdmin returns (bytes32) {
        require(
            eta >= block.timestamp + MINIMUM_DELAY,
            "Delay too short"
        );
        require(
            eta <= block.timestamp + MAXIMUM_DELAY,
            "Delay too long"
        );

        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        queuedTransactions[txHash] = true;

        emit TransactionQueued(txHash, target, value, data, eta);
        return txHash;
    }

    function executeTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 eta
    ) external onlyAdmin returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));

        require(queuedTransactions[txHash], "Not queued");
        require(block.timestamp >= eta, "Not ready");
        require(block.timestamp <= eta + GRACE_PERIOD, "Expired");

        queuedTransactions[txHash] = false;

        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");

        emit TransactionExecuted(txHash, target, value, data);
        return result;
    }
}
```

### 10.1.3 Governance Testing

```typescript
describe("Governance Security", () => {
  describe("Timelock", () => {
    it("enforces minimum delay", async () => {
      const eta = (await getBlockTimestamp()) + 1 * HOUR; // Too short

      await expect(
        timelock.queueTransaction(target, 0, data, eta)
      ).to.be.revertedWith("Delay too short");
    });

    it("allows execution after delay", async () => {
      const eta = (await getBlockTimestamp()) + 48 * HOUR;

      await timelock.queueTransaction(target, 0, data, eta);

      // Cannot execute immediately
      await expect(
        timelock.executeTransaction(target, 0, data, eta)
      ).to.be.revertedWith("Not ready");

      // Advance time
      await advanceTime(48 * HOUR);

      // Now can execute
      await expect(
        timelock.executeTransaction(target, 0, data, eta)
      ).to.not.be.reverted;
    });

    it("expires after grace period", async () => {
      const eta = (await getBlockTimestamp()) + 48 * HOUR;

      await timelock.queueTransaction(target, 0, data, eta);
      await advanceTime(48 * HOUR + 14 * DAY + 1);

      await expect(
        timelock.executeTransaction(target, 0, data, eta)
      ).to.be.revertedWith("Expired");
    });
  });

  describe("Diamond Upgrades", () => {
    it("upgrade requires timelock", async () => {
      const cut = prepareDiamondCut(newFacet);

      // Direct upgrade should fail
      await expect(
        diamond.diamondCut(cut, address(0), "0x")
      ).to.be.revertedWith("Use timelock");
    });

    it("upgrade emits events for monitoring", async () => {
      const cut = prepareDiamondCut(newFacet);

      await expect(timelock.queueDiamondCut(cut))
        .to.emit(timelock, "DiamondCutQueued")
        .withArgs(cut.facetAddress, cut.action, cut.selectors);
    });
  });
});
```

### 10.1.4 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Basic access control                     |
| Silver | 24-hour timelock                         |
| Gold   | 48-hour timelock + governance tests     |

---

## DSS-10.2: Documentation & Disclosure

**Priority:** P2 — Medium
**Certification:** Required for all levels

### 10.2.1 Overview

Clear documentation enables users to understand risks and developers to maintain the codebase. DSS requires comprehensive documentation at all levels.

### 10.2.2 Documentation Requirements

#### 10.2.2.1 Required Documents

| Document          | Description                    | Required     |
|-------------------|--------------------------------|--------------|
| **README**        | Project overview, quick start | ✅ All       |
| **Architecture**  | System design, component diagram| ✅ All       |
| **API Reference**| Function signatures, parameters| ✅ All       |
| **Risk Disclosure**| Known risks, limitations      | ✅ All       |
| **Audit Reports** | External audit findings        | ✅ Silver+   |
| **Incident History**| Past incidents, resolutions    | ✅ Silver+   |
| **Runbooks**      | Operational procedures         | ✅ Silver+   |

#### 10.2.2.2 Risk Disclosure Template

```markdown
# Risk Disclosure

## Smart Contract Risks

### Upgrade Risk
This protocol uses upgradeable contracts (Diamond pattern). While upgrades
are protected by a 48-hour timelock and 4/7 multi-sig, malicious upgrades
could theoretically drain user funds.

**Mitigation:** Timelock, multi-sig, monitoring

### Oracle Risk
Price feeds from Chainlink could be manipulated or become stale. The
protocol uses TWAP fallback and staleness checks, but extreme market
conditions could still cause incorrect pricing.

**Mitigation:** TWAP fallback, staleness checks, price bounds

### Smart Contract Bug Risk
Despite audits and extensive testing, undiscovered bugs may exist. The
protocol has not been formally verified.

**Mitigation:** Audits, 95%+ test coverage, bug bounty

## Economic Risks

### Impermanent Loss
Rebalancing between assets may result in selling low and buying high,
especially in volatile markets.

**Mitigation:** Drift thresholds, volatility-based rebalancing

### Slippage Risk
Large rebalances may experience significant slippage, reducing portfolio
value.

**Mitigation:** Slippage limits, trade splitting, 1inch aggregation

### Strategy Risk
The inverse volatility strategy may underperform in certain market
conditions, particularly during volatility regime changes.

**Mitigation:** Backtesting, stress testing, diversification

## Operational Risks

### Keeper Risk
If the keeper fails to trigger rebalances, the portfolio may drift
significantly from target weights.

**Mitigation:** Redundant keepers, manual fallback

### Multi-Sig Risk
If multi-sig signers are compromised or unavailable, protocol upgrades
and emergency actions may be delayed or impossible.

**Mitigation:** Geographic distribution, backup signers
```

### 10.2.3 NatSpec Requirements

All public functions must have complete NatSpec documentation:

```solidity
/// @title HODLFacet - Equal-weight portfolio strategy
/// @author VaultBricks Team
/// @notice Implements a simple equal-weight allocation across active assets
/// @dev Part of the Diamond pattern, stores state in AppStorage
contract HODLFacet is ITargetWeightProvider {

    /// @notice Calculate equal weights for all active assets
    /// @dev Distributes 10000 basis points equally, with remainder to first assets
    /// @return weights Array of weights in basis points (sum = 10000)
    /// @custom:security Non-reentrant, view function
    /// @custom:gas ~50,000 gas for 10 assets
    function calculateInverseVolatilityWeights()
        external
        view
        override
        returns (uint256[] memory weights)
    {
        // Implementation
    }
}
```

### 10.2.4 Coverage Thresholds

| Level  | Requirements                                    |
|--------|-------------------------------------------------|
| Bronze | README, architecture, risk disclosure           |
| Silver | + Audit reports, API reference, runbooks        |
| Gold   | + NatSpec 100%, incident history, formal specs |

---


