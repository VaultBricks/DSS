# DSS-11: Interoperability

This document covers DSS-11, which ensures compatibility with industry standards and protocols.

---

## DSS-11: Interoperability & Standards

**Priority:** P1 — High
**Certification:** Required for all levels

### 11.1 Overview

Interoperability ensures that vaults can integrate seamlessly with other DeFi protocols and standards. DSS-11 requires compliance with ERC-4626 (Tokenized Vault Standard) and MAS (Multi-Asset Standard) protocol standards.

### 11.2 ERC-4626 Compliance

#### 11.2.1 Required Interface

All vaults must implement the ERC-4626 interface:

```solidity
interface IERC4626 {
    // Asset management
    function asset() external view returns (address);
    function totalAssets() external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    
    // Deposit/Withdraw
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function mint(uint256 shares, address receiver) external returns (uint256 assets);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    
    // View functions
    function maxDeposit(address receiver) external view returns (uint256);
    function maxMint(address receiver) external view returns (uint256);
    function maxWithdraw(address owner) external view returns (uint256);
    function maxRedeem(address owner) external view returns (uint256);
    
    // Preview functions
    function previewDeposit(uint256 assets) external view returns (uint256);
    function previewMint(uint256 shares) external view returns (uint256);
    function previewWithdraw(uint256 assets) external view returns (uint256);
    function previewRedeem(uint256 shares) external view returns (uint256);
}
```

#### 11.2.2 Compliance Tests

```typescript
describe("ERC-4626 Compliance", () => {
  it("implements all required functions", async () => {
    // Verify interface compliance
    const erc4626 = await ethers.getContractAt("IERC4626", vault.address);
    
    expect(await erc4626.asset()).to.be.properAddress;
    expect(await erc4626.totalAssets()).to.be.gte(0);
  });

  it("deposit returns correct shares", async () => {
    const assets = parseEther("100");
    const expectedShares = await vault.previewDeposit(assets);
    
    const shares = await vault.deposit(assets, user.address);
    
    expect(shares).to.equal(expectedShares);
  });

  it("withdraw returns correct shares", async () => {
    const assets = parseEther("100");
    const expectedShares = await vault.previewWithdraw(assets);
    
    const shares = await vault.withdraw(assets, user.address, user.address);
    
    expect(shares).to.equal(expectedShares);
  });

  it("redeem returns correct assets", async () => {
    const shares = parseEther("100");
    const expectedAssets = await vault.previewRedeem(shares);
    
    const assets = await vault.redeem(shares, user.address, user.address);
    
    expect(assets).to.equal(expectedAssets);
  });

  it("convertToShares and convertToAssets are inverse", async () => {
    const assets = parseEther("1000");
    
    const shares = await vault.convertToShares(assets);
    const convertedBack = await vault.convertToAssets(shares);
    
    // Allow for rounding differences
    expect(convertedBack).to.be.closeTo(assets, parseEther("0.01"));
  });

  it("preview functions match actual execution", async () => {
    const assets = parseEther("100");
    
    const previewShares = await vault.previewDeposit(assets);
    const actualShares = await vault.deposit(assets, user.address);
    
    expect(actualShares).to.equal(previewShares);
  });

  it("maxDeposit respects limits", async () => {
    const maxDeposit = await vault.maxDeposit(user.address);
    
    // Should not exceed vault capacity or user limits
    expect(maxDeposit).to.be.gte(0);
    
    // Attempting to deposit more should revert
    if (maxDeposit.gt(0)) {
      await expect(
        vault.deposit(maxDeposit.add(1), user.address)
      ).to.be.reverted;
    }
  });
});
```

#### 11.2.3 Edge Cases

```typescript
describe("ERC-4626 Edge Cases", () => {
  it("handles zero deposits correctly", async () => {
    const shares = await vault.deposit(0, user.address);
    expect(shares).to.equal(0);
  });

  it("handles zero withdrawals correctly", async () => {
    const assets = await vault.withdraw(0, user.address, user.address);
    expect(assets).to.equal(0);
  });

  it("handles empty vault (no assets)", async () => {
    // New vault with no assets
    const shares = parseEther("100");
    const assets = await vault.convertToAssets(shares);
    
    // Should return 0 when vault is empty
    expect(assets).to.equal(0);
  });

  it("handles very large values", async () => {
    const largeAssets = parseEther("1000000000"); // 1B tokens
    
    // Should not overflow
    const shares = await vault.convertToShares(largeAssets);
    expect(shares).to.be.gte(0);
  });
});
```

### 11.3 MAS Protocol Compliance

#### 11.3.1 MAS Architecture Requirements

Vaults must comply with MAS (Multi-Asset Standard) architecture:

| Requirement | Description | Test |
|-------------|-------------|------|
| **Multi-Asset Support** | Support multiple underlying assets | Verify asset array handling |
| **Rebalancing Mechanism** | Implement rebalancing logic | Test rebalance execution |
| **Fee Structure** | Support management and performance fees | Verify fee calculations |
| **Strategy Interface** | Implement MAS strategy interface | Verify interface compliance |

#### 11.3.2 MAS Integration Tests

```typescript
describe("MAS Protocol Compliance", () => {
  it("implements MAS strategy interface", async () => {
    const masStrategy = await ethers.getContractAt("IMASStrategy", vault.address);
    
    // Verify required functions exist
    expect(masStrategy.getTargetWeights).to.be.a('function');
    expect(masStrategy.rebalance).to.be.a('function');
  });

  it("supports multiple assets", async () => {
    const assets = await vault.getSupportedAssets();
    
    expect(assets.length).to.be.gte(2);
    
    for (const asset of assets) {
      expect(asset).to.be.properAddress;
    }
  });

  it("calculates target weights correctly", async () => {
    const weights = await vault.getTargetWeights();
    
    // Weights should sum to 10000 (100%)
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(sum).to.equal(10000);
    
    // All weights should be non-negative
    expect(weights.every(w => w >= 0)).to.be.true;
  });

  it("executes rebalancing correctly", async () => {
    const targetWeights = [5000, 3000, 2000]; // 50%, 30%, 20%
    
    await vault.setTargetWeights(targetWeights);
    await vault.rebalance();
    
    // Verify actual weights match targets (within tolerance)
    const actualWeights = await vault.getCurrentWeights();
    
    for (let i = 0; i < targetWeights.length; i++) {
      const diff = Math.abs(actualWeights[i] - targetWeights[i]);
      expect(diff).to.be.lte(100); // 1% tolerance
    }
  });

  it("handles fee calculations correctly", async () => {
    const depositAmount = parseEther("1000");
    await vault.deposit(depositAmount, user.address);
    
    // Simulate profit
    await simulateProfit(vault, parseEther("100"));
    
    // Calculate fees
    const managementFee = await vault.calculateManagementFee();
    const performanceFee = await vault.calculatePerformanceFee();
    
    // Fees should be within expected ranges
    expect(managementFee).to.be.gte(0);
    expect(performanceFee).to.be.gte(0);
  });
});
```

#### 11.3.3 Cross-Standard Compatibility

```typescript
describe("ERC-4626 + MAS Compatibility", () => {
  it("ERC-4626 deposit works with MAS assets", async () => {
    const assets = parseEther("100");
    
    // Deposit via ERC-4626 interface
    const shares = await vault.deposit(assets, user.address);
    
    // Verify MAS state updated
    const totalAssets = await vault.totalAssets();
    expect(totalAssets).to.be.gte(assets);
  });

  it("MAS rebalance preserves ERC-4626 invariants", async () => {
    const initialShares = await vault.balanceOf(user.address);
    const initialAssets = await vault.convertToAssets(initialShares);
    
    // Execute MAS rebalance
    await vault.rebalance();
    
    // ERC-4626 invariants should still hold
    const finalShares = await vault.balanceOf(user.address);
    const finalAssets = await vault.convertToAssets(finalShares);
    
    // Shares should not change
    expect(finalShares).to.equal(initialShares);
    
    // Assets may change slightly due to fees/slippage, but should be close
    const diff = finalAssets.sub(initialAssets).abs();
    const tolerance = initialAssets.mul(5).div(100); // 5% tolerance
    expect(diff).to.be.lte(tolerance);
  });

  it("supports both ERC-4626 and MAS interfaces simultaneously", async () => {
    // Use ERC-4626 interface
    const erc4626 = await ethers.getContractAt("IERC4626", vault.address);
    await erc4626.deposit(parseEther("100"), user.address);
    
    // Use MAS interface
    const masStrategy = await ethers.getContractAt("IMASStrategy", vault.address);
    await masStrategy.rebalance();
    
    // Both should work without conflicts
    const totalAssets = await erc4626.totalAssets();
    expect(totalAssets).to.be.gt(0);
  });
});
```

### 11.4 Stress Testing

```typescript
describe("Interoperability Stress Tests", () => {
  it("handles rapid ERC-4626 operations", async () => {
    // Rapid deposits and withdrawals
    for (let i = 0; i < 10; i++) {
      await vault.deposit(parseEther("10"), user.address);
      await vault.withdraw(parseEther("5"), user.address, user.address);
    }
    
    // Vault should remain in valid state
    const totalAssets = await vault.totalAssets();
    expect(totalAssets).to.be.gte(0);
  });

  it("handles rebalance during ERC-4626 operations", async () => {
    // Start deposit
    const depositTx = vault.deposit(parseEther("1000"), user.address);
    
    // Trigger rebalance simultaneously
    const rebalanceTx = vault.rebalance();
    
    // Both should complete successfully
    await Promise.all([depositTx, rebalanceTx]);
    
    // State should be consistent
    const totalAssets = await vault.totalAssets();
    expect(totalAssets).to.be.gt(0);
  });

  it("handles multiple assets with ERC-4626", async () => {
    // Deposit with multiple underlying assets
    await vault.deposit(parseEther("100"), user.address);
    
    // Verify all assets are tracked
    const assets = await vault.getSupportedAssets();
    for (const asset of assets) {
      const balance = await vault.getAssetBalance(asset);
      expect(balance).to.be.gte(0);
    }
  });
});
```

### 11.5 Coverage Thresholds

| Level  | Requirements                                    |
|--------|-------------------------------------------------|
| Bronze | ERC-4626 interface implemented, basic MAS compliance tests |
| Silver | Full ERC-4626 compliance tests, comprehensive MAS integration tests |
| Gold   | All tests + stress testing + cross-standard compatibility verification |

### 11.6 References

- [ERC-4626 Specification](https://eips.ethereum.org/EIPS/eip-4626)
- [MAS Protocol Documentation](https://github.com/vaultbricks/mas)
- [INTEGRATION-WITH-MAS.md](../docs/integration/INTEGRATION-WITH-MAS.md)

---


