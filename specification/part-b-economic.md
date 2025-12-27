# Part B: Economic Reference & Methodology

This document serves as a reference for economic validation methodology and advanced testing patterns for the DeFi Strategy Standard (DSS).

## Overview

Economic validation ensures that strategies' mathematical models are sound and resilient to market dynamics. This document provides detailed methodology and implementation examples that support the requirements outlined in **DSS-6: Security Tests** and **DSS-7: Stress Tests & Fuzzing** in Part A.

This reference material includes:
- Advanced backtesting and simulation techniques
- Economic attack resistance testing
- Market condition testing across various scenarios

---

## 1. Backtesting & Simulation

*Supports DSS-7 (Stress Tests & Fuzzing)*

### 1.1 Overview

Backtesting validates strategy performance against historical data. DSS requires rigorous backtesting methodology to prevent overfitting and ensure realistic performance expectations.

### 1.2 Backtesting Requirements

#### 1.2.1 Data Requirements

| Requirement         | Bronze            | Silver                    | Gold                        |
|---------------------|-------------------|---------------------------|-----------------------------|
| **Historical Period**| 1 year            | 2 years                   | 5+ years                    |
| **Data Frequency**   | Daily             | Hourly                    | 15-minute                   |
| **Assets Covered**   | Strategy assets   | + correlated assets       | + macro indicators          |
| **Data Source**      | Single source     | 2+ sources                | 3+ sources + validation     |

#### 1.2.2 Methodology Requirements

| Requirement          | Description              | Required     |
|----------------------|--------------------------|--------------|
| **Walk-Forward**      | Out-of-sample testing    | ✅ Silver+   |
| **Transaction Costs**| Include realistic fees   | ✅ All       |
| **Slippage Modeling**| Volume-based slippage    | ✅ Silver+   |
| **Survivorship Bias**| Include delisted assets  | ✅ Gold      |
| **Look-Ahead Bias**   | No future data leakage   | ✅ All       |

### 1.3 Implementation

```typescript
// scripts/backtest/backtest.ts
interface BacktestConfig {
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
  transactionCostBps: number;
  slippageModel: 'fixed' | 'volume-based';
}

interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  calmarRatio: number;
  winRate: number;
  trades: number;
}

async function runBacktest(
  strategy: Strategy,
  config: BacktestConfig
): Promise<BacktestResult> {
  const priceData = await loadHistoricalPrices(config.startDate, config.endDate);

  let portfolio = initializePortfolio(config.initialCapital);
  const dailyReturns: number[] = [];

  for (const date of priceData.dates) {
    // Calculate strategy weights
    const weights = await strategy.calculateWeights(priceData.upTo(date));

    // Apply rebalancing with costs
    if (shouldRebalance(date, config.rebalanceFrequency)) {
      portfolio = rebalance(portfolio, weights, {
        transactionCostBps: config.transactionCostBps,
        slippage: calculateSlippage(portfolio, weights, config.slippageModel)
      });
    }

    // Update portfolio value
    const previousValue = portfolio.value;
    portfolio = updatePortfolioValue(portfolio, priceData.on(date));
    dailyReturns.push((portfolio.value - previousValue) / previousValue);
  }

  return calculateMetrics(dailyReturns, portfolio);
}
```

### 1.4 Required Metrics

| Metric             | Formula                              | Benchmark        |
|--------------------|--------------------------------------|------------------|
| **Total Return**    | `(final - initial) / initial`        | > 0              |
| **Annualized Return**| `(1 + totalReturn)^(365/days) - 1`  | > risk-free rate |
| **Sharpe Ratio**    | `(return - rf) / volatility`         | > 1.0            |
| **Max Drawdown**    | `max(peak - trough) / peak`          | < 30%            |
| **Calmar Ratio**    | `annualizedReturn / maxDrawdown`      | > 0.5            |
| **Win Rate**        | `winning_trades / total_trades`      | > 50%            |

### 1.5 Stress Testing Scenarios

| Scenario              | Description              | Required     |
|-----------------------|--------------------------|--------------|
| **2020 COVID Crash**   | March 2020 volatility    | ✅ Silver+   |
| **2022 Crypto Winter** | Extended bear market     | ✅ Silver+   |
| **Flash Crash**        | Single-day 20%+ drop     | ✅ Gold      |
| **Correlation Breakdown**| Assets move together   | ✅ Gold      |
| **Liquidity Crisis**   | Wide spreads, low volume | ✅ Gold      |

### 1.6 Coverage Thresholds

| Level  | Requirements                                    |
|-------|-------------------------------------------------|
| Bronze| Basic backtest with 1 year data                 |
| Silver| Walk-forward + 2 years + stress scenarios      |
| Gold  | Full methodology + 5 years + all stress scenarios|

---

## 2. Economic Attack Resistance

*Supports DSS-6 (Security Tests)*

### 2.1 Overview

DeFi strategies are vulnerable to economic attacks that exploit protocol mechanics. DSS requires testing against known attack vectors.

### 2.2 Attack Categories

#### 2.2.1 Oracle Manipulation

| Attack                   | Description                      | Mitigation            |
|--------------------------|----------------------------------|-----------------------|
| **Flash Loan Attack**     | Manipulate price within single tx| TWAP, multi-block     |
| **Sandwich Attack**       | Front/back-run user transactions | Slippage protection   |
| **Price Feed Manipulation**| Compromise oracle source         | Multi-oracle, bounds  |

```typescript
describe("Oracle Manipulation Resistance", () => {
  it("resists flash loan price manipulation", async () => {
    // Simulate flash loan attack
    await flashLoan(LARGE_AMOUNT);
    await manipulatePrice(asset, 2.0); // 2x price spike

    // Strategy should use TWAP, not spot price
    const weights = await strategy.calculateWeights();

    // Weights should not change dramatically
    expect(weightChange).to.be.lte(MAX_WEIGHT_CHANGE);

    await repayFlashLoan();
  });

  it("detects and rejects stale prices", async () => {
    await advanceTime(2 * HOUR);

    await expect(strategy.calculateWeights())
      .to.be.revertedWith("StalePrice");
  });
});
```

#### 2.2.2 MEV Attacks

| Attack          | Description                    | Mitigation                      |
|-----------------|--------------------------------|---------------------------------|
| **Frontrunning**| Execute before user tx         | Private mempool, commit-reveal  |
| **Backrunning** | Execute after user tx          | Slippage limits                 |
| **JIT Liquidity**| Add/remove liquidity around tx | Time-weighted execution         |

```typescript
describe("MEV Resistance", () => {
  it("enforces slippage protection", async () => {
    const maxSlippage = 100; // 1%

    // Simulate frontrunning that causes 2% slippage
    await simulateFrontrun(2.0);

    await expect(rebalance({ maxSlippageBps: maxSlippage }))
      .to.be.revertedWith("ExcessiveSlippage");
  });

  it("uses commit-reveal for large rebalances", async () => {
    // Large rebalance requires commit phase
    const commitment = await strategy.commitRebalance(targetWeights);

    // Cannot execute immediately
    await expect(strategy.executeRebalance(commitment))
      .to.be.revertedWith("CommitmentNotMature");

    // Wait for reveal period
    await advanceTime(COMMIT_DELAY);

    // Now can execute
    await strategy.executeRebalance(commitment);
  });
});
```

#### 2.2.3 Governance Attacks

| Attack                | Description            | Mitigation                      |
|-----------------------|------------------------|----------------------------------|
| **Flash Loan Governance**| Borrow tokens to vote| Snapshot voting                  |
| **Timelock Bypass**   | Rush malicious proposals| Minimum delay                   |
| **Quorum Manipulation**| Inflate voting power  | Token-weighted + time-lock       |

### 2.3 Economic Invariants

```typescript
describe("Economic Invariants", () => {
  it("INVARIANT: no value extraction via deposit/withdraw", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const depositAmount = randomAmount();

      const sharesBefore = await vault.totalShares();
      const valueBefore = await vault.totalValue();

      await vault.deposit(depositAmount);
      await vault.withdraw(depositAmount);

      const sharesAfter = await vault.totalShares();
      const valueAfter = await vault.totalValue();

      // Value should not decrease (excluding fees)
      expect(valueAfter).to.be.gte(valueBefore.mul(9999).div(10000));
    }
  });

  it("INVARIANT: share price manipulation resistance", async () => {
    const initialPrice = await vault.sharePrice();

    // Attempt donation attack
    await token.transfer(vault.address, LARGE_AMOUNT);

    const priceAfter = await vault.sharePrice();

    // Price should not spike (donation attack mitigated)
    expect(priceAfter).to.be.lte(initialPrice.mul(101).div(100));
  });
});
```

### 2.4 Coverage Thresholds

| Level  | Requirements                                    |
|--------|-------------------------------------------------|
| Bronze | Basic slippage protection tests                 |
| Silver | Oracle manipulation + MEV resistance             |
| Gold   | All attack vectors + economic invariants         |

---

## 3. Market Condition Testing

*Supports DSS-7 (Stress Tests)*

### 3.1 Overview

Strategies must perform correctly across various market conditions. DSS requires testing under bull, bear, sideways, and volatile markets.

### 3.2 Market Condition Categories

| Condition          | Characteristics                    | Test Focus              |
|--------------------|------------------------------------|-------------------------|
| **Bull Market**    | Sustained uptrend, low volatility  | Momentum capture        |
| **Bear Market**    | Sustained downtrend, high volatility| Drawdown limits        |
| **Sideways**       | Range-bound, mean-reverting        | Rebalance frequency     |
| **High Volatility**| Large daily swings                 | Risk management         |
| **Low Liquidity**  | Wide spreads, thin books           | Slippage handling       |
| **Correlation Shift**| Assets move together              | Diversification failure |

### 3.3 Implementation

```typescript
describe("Market Condition Testing", () => {
  describe("Bull Market", () => {
    beforeEach(async () => {
      // Simulate 6-month bull market: +50% with 15% volatility
      await simulateMarket({
        trend: 0.50,
        volatility: 0.15,
        duration: 180
      });
    });

    it("captures upside momentum", async () => {
      const strategyReturn = await runStrategy();
      const benchmarkReturn = await runBenchmark();

      // Strategy should capture at least 80% of upside
      expect(strategyReturn).to.be.gte(benchmarkReturn * 0.8);
    });
  });

  describe("Bear Market", () => {
    beforeEach(async () => {
      // Simulate 6-month bear market: -40% with 40% volatility
      await simulateMarket({
        trend: -0.40,
        volatility: 0.40,
        duration: 180
      });
    });

    it("limits drawdown", async () => {
      const result = await runStrategy();

      // Max drawdown should be less than benchmark
      expect(result.maxDrawdown).to.be.lte(0.30);
    });

    it("triggers stop-loss correctly", async () => {
      const events = await runStrategyWithEvents();

      // Should have triggered stop-loss
      expect(events.some(e => e.type === 'STOP_LOSS')).to.be.true;
    });
  });

  describe("High Volatility", () => {
    beforeEach(async () => {
      // Simulate high volatility: 80% annualized
      await simulateMarket({
        trend: 0,
        volatility: 0.80,
        duration: 30
      });
    });

    it("reduces position sizes", async () => {
      const weights = await strategy.calculateWeights();

      // Should have reduced exposure
      const totalExposure = weights.reduce((a, b) => a + b, 0);
      expect(totalExposure).to.be.lte(8000); // Max 80% exposure
    });

    it("increases rebalance frequency", async () => {
      const rebalances = await countRebalances();

      // Should rebalance more frequently in high vol
      expect(rebalances).to.be.gte(NORMAL_REBALANCES * 1.5);
    });
  });

  describe("Low Liquidity", () => {
    beforeEach(async () => {
      // Simulate low liquidity: 10x normal spreads
      await setLiquidityMultiplier(0.1);
    });

    it("adjusts slippage expectations", async () => {
      const tx = await strategy.rebalance();
      const receipt = await tx.wait();

      // Should have used higher slippage tolerance
      const event = receipt.events.find(e => e.event === 'Rebalanced');
      expect(event.args.slippageBps).to.be.gte(200);
    });

    it("reduces trade sizes", async () => {
      const trades = await getRebalanceTrades();

      // Should split into smaller trades
      expect(trades.length).to.be.gte(NORMAL_TRADES * 2);
    });
  });
});
```

### 3.4 Scenario Matrix

| Scenario | Trend | Volatility | Correlation | Liquidity |
|----------|-------|------------|-------------|-----------|
| Normal   | 0%    | 20%        | 0.3         | Normal    |
| Bull     | +30%  | 15%        | 0.2         | High      |
| Bear     | -30%  | 40%        | 0.6         | Low       |
| Crash    | -50%  | 80%        | 0.9         | Very Low  |
| Recovery | +50%  | 50%        | 0.4         | Normal    |
| Sideways | 0%    | 10%        | 0.3         | Normal    |

### 3.5 Coverage Thresholds

| Level  | Requirements                                    |
|-------|-------------------------------------------------|
| Bronze| Basic bull/bear testing                          |
| Silver| All market conditions + stress scenarios          |
| Gold  | Full scenario matrix + Monte Carlo simulation    |

---


