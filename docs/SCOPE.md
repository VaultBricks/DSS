# Scope & Applicability

## In Scope

DSS applies to any DeFi protocol that:

| Category | Examples |
|----------|----------|
| **Yield Strategies** | Vault strategies, yield aggregators, auto-compounders |
| **Trading Strategies** | Momentum, mean reversion, volatility-based allocation |
| **Portfolio Management** | Multi-asset rebalancing, risk parity, inverse volatility |
| **Lending Integration** | Aave, Compound, Morpho integrations |
| **DEX Integration** | Uniswap, Curve, 1inch aggregation |
| **Oracle Dependency** | Chainlink, TWAP, custom price feeds |

## Out of Scope

| Category | Reason |
|----------|--------|
| Pure token contracts | Use OpenZeppelin standards |
| NFT marketplaces | Different risk profile |
| Bridges | Specialized security requirements |
| L2 sequencers | Infrastructure-level concerns |

## Strategy Types Covered

DSS provides specific guidance for these strategy archetypes:

1. **HODL Strategies** — Equal-weight, buy-and-hold portfolios
2. **Fixed Allocation** — Static weight strategies (e.g., 60/40)
3. **Momentum Strategies** — Trend-following, top-N selection
4. **Mean Reversion** — Contrarian, dip-buying strategies
5. **Volatility-Based** — Inverse volatility, risk parity
6. **Covariance-Based** — Minimum variance, Markowitz optimization
7. **Hybrid Strategies** — Combinations of the above
