# DSS-9: Operational Security

This document covers DSS-9, which consolidates deployment security, access management, and monitoring requirements.

**Note:** This document reflects the DSS 1.0 structure:
- **DSS-9**: Operational Security (consolidates deployment, keys, and monitoring)

---

## DSS-9.1: Deployment Security

**Priority:** P1 — High
**Certification:** Required for Silver+

### 9.1.1 Overview

Secure deployment practices prevent configuration errors and ensure reproducible deployments. DSS requires documented, tested deployment procedures.

### 9.1.2 Deployment Requirements

#### 9.1.2.1 Deployment Checklist

| Requirement            | Description                      | Required     |
|------------------------|----------------------------------|--------------|
| **Reproducible Builds** | Deterministic compilation        | ✅ All       |
| **Verification**       | Source code verified on explorer | ✅ All       |
| **Multi-Sig Deployment**| Deploy from multi-sig            | ✅ Silver+   |
| **Staged Rollout**     | Testnet → Staging → Mainnet      | ✅ Silver+   |
| **Deployment Tests**   | Automated post-deployment checks  | ✅ All       |

#### 9.1.2.2 Deployment Script

```typescript
// scripts/deploy/deploy.ts
import { ethers, run } from "hardhat";

interface DeploymentConfig {
  network: 'testnet' | 'staging' | 'mainnet';
  multisig: string;
  initialAssets: string[];
  oracleAddresses: Record<string, string>;
}

async function deploy(config: DeploymentConfig) {
  console.log(`Deploying to ${config.network}...`);

  // 1. Deploy Diamond
  const diamond = await deployDiamond();
  console.log(`Diamond deployed: ${diamond.address}`);

  // 2. Deploy and add facets
  const facets = await deployFacets();
  await addFacetsToDiamond(diamond, facets);

  // 3. Initialize strategy
  await initializeStrategy(diamond, config);

  // 4. Transfer ownership to multi-sig
  await diamond.transferOwnership(config.multisig);
  console.log(`Ownership transferred to: ${config.multisig}`);

  // 5. Verify contracts
  await verifyContracts(diamond, facets);

  // 6. Run post-deployment tests
  await runPostDeploymentTests(diamond);

  // 7. Save deployment artifacts
  await saveDeploymentArtifacts(diamond, facets, config);

  return diamond;
}

async function runPostDeploymentTests(diamond: Contract) {
  console.log("Running post-deployment tests...");

  // Verify facet routing
  const facets = await diamond.facets();
  expect(facets.length).to.be.gte(5);

  // Verify ownership
  const owner = await diamond.owner();
  expect(owner).to.equal(config.multisig);

  // Verify strategy is paused (safety)
  const isPaused = await diamond.paused();
  expect(isPaused).to.be.true;

  // Verify oracle connections
  for (const asset of config.initialAssets) {
    const price = await diamond.getPrice(asset);
    expect(price).to.be.gt(0);
  }

  console.log("✅ All post-deployment tests passed");
}
```

### 9.1.3 Environment Configuration

```typescript
// config/deployment.config.ts
export const deploymentConfigs: Record<string, DeploymentConfig> = {
  'arbitrum-testnet': {
    network: 'testnet',
    multisig: '0x...', // Test multi-sig
    rpcUrl: process.env.ARBITRUM_TESTNET_RPC,
    chainId: 421614,
    gasPrice: 'auto',
    confirmations: 2
  },
  'arbitrum-mainnet': {
    network: 'mainnet',
    multisig: '0x...', // Production multi-sig
    rpcUrl: process.env.ARBITRUM_MAINNET_RPC,
    chainId: 42161,
    gasPrice: 'auto',
    confirmations: 5,
    timelockDelay: 48 * 3600 // 48 hours
  }
};
```

### 9.1.4 Verification Requirements

```bash
# Verify all contracts on Arbiscan
npx hardhat verify --network arbitrum \
  --constructor-args args/diamond.js \
  DIAMOND_ADDRESS

# Verify facets
for facet in HODLFacet Fixed6040Facet MomentumFacet; do
  npx hardhat verify --network arbitrum FACET_ADDRESS
done
```

### 9.1.5 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Verified contracts, deployment script  |
| Silver | Multi-sig deployment, staged rollout   |
| Gold   | Timelock, automated deployment tests   |

---

## DSS-9.2: Key & Access Management

**Priority:** P0 — Critical
**Certification:** Required for all levels

### 9.2.1 Overview

Proper key management prevents unauthorized access and single points of failure. DSS requires multi-signature controls and role-based access.

### 9.2.2 Access Control Requirements

#### 9.2.2.1 Role Definitions

| Role       | Permissions                  | Holder             |
|------------|------------------------------|--------------------|
| **Owner**   | Upgrade contracts, add facets| Multi-sig (3/5)    |
| **Admin**   | Configure parameters, pause  | Multi-sig (2/3)    |
| **Keeper**  | Trigger rebalances           | Automated + backup|
| **Guardian**| Emergency pause only         | Multi-sig (1/3)    |
| **User**    | Deposit, withdraw            | Any address        |

#### 9.2.2.2 Multi-Sig Requirements

| Level  | Owner | Admin | Guardian |
|--------|-------|-------|----------|
| Bronze | 2/3   | 1/2   | 1/2      |
| Silver | 3/5   | 2/3   | 1/3      |
| Gold   | 4/7   | 3/5   | 2/5      |

### 9.2.3 Implementation

```solidity
// contracts/access/AccessControl.sol
contract StrategyAccessControl {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    modifier onlyOwner() {
        require(hasRole(OWNER_ROLE, msg.sender), "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(OWNER_ROLE, msg.sender),
            "Not admin"
        );
        _;
    }

    modifier onlyKeeper() {
        require(hasRole(KEEPER_ROLE, msg.sender), "Not keeper");
        _;
    }

    modifier onlyGuardian() {
        require(
            hasRole(GUARDIAN_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender) ||
            hasRole(OWNER_ROLE, msg.sender),
            "Not guardian"
        );
        _;
    }
}
```

### 9.2.4 Key Storage Requirements

| Requirement            | Description                    | Required     |
|------------------------|--------------------------------|--------------|
| **Hardware Wallets**   | All multi-sig signers use hardware| ✅ Silver+ |
| **Geographic Distribution**| Signers in different locations| ✅ Gold      |
| **Backup Procedures** | Documented key recovery        | ✅ All       |
| **Rotation Schedule**  | Regular key rotation           | ✅ Gold      |

### 9.2.5 Testing Requirements

```typescript
describe("Access Control", () => {
  it("owner can upgrade contracts", async () => {
    await expect(diamond.connect(owner).diamondCut(...))
      .to.not.be.reverted;
  });

  it("non-owner cannot upgrade contracts", async () => {
    await expect(diamond.connect(user).diamondCut(...))
      .to.be.revertedWith("Not owner");
  });

  it("keeper can trigger rebalance", async () => {
    await expect(diamond.connect(keeper).rebalance())
      .to.not.be.reverted;
  });

  it("guardian can pause in emergency", async () => {
    await expect(diamond.connect(guardian).pause())
      .to.not.be.reverted;

    expect(await diamond.paused()).to.be.true;
  });

  it("guardian cannot unpause", async () => {
    await diamond.connect(guardian).pause();

    await expect(diamond.connect(guardian).unpause())
      .to.be.revertedWith("Not admin");
  });
});
```

### 9.2.6 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Role-based access, 2/3 multi-sig        |
| Silver | Hardware wallets, 3/5 multi-sig         |
| Gold   | Geographic distribution, key rotation   |

---

## DSS-9.3: Monitoring & Incident Response

**Priority:** P1 — High
**Certification:** Required for Silver+

### 9.3.1 Overview

Continuous monitoring enables early detection of issues. DSS requires comprehensive monitoring and documented incident response procedures.

### 9.3.2 Monitoring Requirements

#### 9.3.2.1 On-Chain Monitoring

| Metric              | Alert Threshold | Response            |
|---------------------|-----------------|---------------------|
| **Health Factor**    | < 2.5           | Reduce leverage     |
| **TVL Change**       | > 10% in 1 hour| Investigate         |
| **Share Price**      | < 0.99 or > 1.01| Investigate         |
| **Gas Price**        | > 100 gwei      | Delay rebalance     |
| **Oracle Staleness**| > 1 hour        | Switch to TWAP      |
| **Rebalance Failure**| Any failure     | Manual intervention |

#### 9.3.2.2 Off-Chain Monitoring

| Metric          | Alert Threshold | Response        |
|-----------------|-----------------|-----------------|
| **Keeper Uptime**| < 99.9%         | Activate backup |
| **RPC Latency**  | > 500ms         | Switch provider |
| **API Errors**  | > 1%            | Investigate     |
| **Disk Space**  | > 80%           | Cleanup/expand  |

### 9.3.3 Implementation

```typescript
// monitoring/alerts.ts
import { ethers } from "ethers";
import { sendAlert } from "./notifications";

interface AlertConfig {
  metric: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq';
  severity: 'info' | 'warning' | 'critical';
  cooldown: number; // seconds
}

const alerts: AlertConfig[] = [
  {
    metric: 'healthFactor',
    threshold: 2.5,
    comparison: 'lt',
    severity: 'critical',
    cooldown: 300
  },
  {
    metric: 'tvlChange1h',
    threshold: 0.10,
    comparison: 'gt',
    severity: 'warning',
    cooldown: 3600
  }
];

async function checkAlerts(diamond: Contract) {
  for (const alert of alerts) {
    const value = await getMetric(diamond, alert.metric);

    if (shouldTrigger(value, alert)) {
      await sendAlert({
        severity: alert.severity,
        metric: alert.metric,
        value: value,
        threshold: alert.threshold,
        timestamp: Date.now()
      });
    }
  }
}

// Run every minute
setInterval(() => checkAlerts(diamond), 60_000);
```

### 9.3.4 Incident Response Procedures

#### 9.3.4.1 Severity Levels

| Level          | Description           | Response Time | Escalation     |
|----------------|-----------------------|--------------|----------------|
| **P0 - Critical**| Funds at risk        | < 15 minutes | Immediate      |
| **P1 - High**    | Functionality impaired| < 1 hour     | On-call        |
| **P2 - Medium**  | Degraded performance  | < 4 hours    | Business hours |
| **P3 - Low**     | Minor issues          | < 24 hours   | Next sprint    |

#### 9.3.4.2 Response Playbooks

**Playbook: Oracle Failure**
```markdown
## Oracle Failure Response

### Detection
- Alert: Oracle staleness > 1 hour
- Alert: Price deviation > 5% from TWAP

### Immediate Actions
1. Verify oracle status on Chainlink dashboard
2. Check if issue is network-wide or asset-specific
3. If asset-specific, disable affected asset

### Escalation
- If > 2 assets affected: Pause strategy
- If > 1 hour: Notify users via Discord/Twitter

### Resolution
1. Wait for oracle recovery
2. Verify prices are accurate
3. Re-enable affected assets
4. Resume normal operations

### Post-Incident
- Document timeline and actions
- Update runbook if needed
- Consider adding redundant oracle
```

**Playbook: Exploit Detection**
```markdown
## Exploit Detection Response

### Detection
- Alert: Unusual TVL decrease
- Alert: Unexpected contract interactions
- Community report

### Immediate Actions (< 5 minutes)
1. PAUSE the contract immediately
2. Notify core team via emergency channel
3. Do NOT interact with the contract

### Investigation (< 30 minutes)
1. Analyze transaction history
2. Identify attack vector
3. Assess funds at risk
4. Prepare public statement

### Mitigation
1. If funds recoverable: Coordinate with white-hats
2. If ongoing: Block attacker addresses
3. Prepare fix for vulnerability

### Communication
- Discord announcement within 1 hour
- Twitter statement within 2 hours
- Detailed post-mortem within 48 hours
```

### 9.3.5 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Basic monitoring, manual response       |
| Silver | Automated alerts, documented playbooks |
| Gold   | 24/7 monitoring, SLA commitments       |

---


