import { Vault as VaultSchema } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";
import {
  getOrCreateStrategy,
  updateStrategyBalance,
  updateStrategyBalances,
} from "../utils/strategyUtils";
import {
  Vault as VaultTemplate,
  FeePercentUpdated,
  Harvest,
  HarvestDelayUpdated,
  HarvestDelayUpdateScheduled,
  HarvestWindowUpdated,
  Initialized,
  StrategyDeposit,
  StrategyDistrusted,
  StrategySeized,
  StrategyTrusted,
  StrategyWithdrawal,
  TargetFloatPercentUpdated,
  UnderlyingIsWETHUpdated,
  Deposit,
  Withdraw,
} from "../../generated/templates/Vault/Vault";

/*///////////////////////////////////////////////////////////////
                    ATTRIBUTE HANDLERS
//////////////////////////////////////////////////////////////*/

// Updates vault.initialized
export function handleVaultInitialized(event: Initialized): void {
  let vaultId = event.address;

  log.info("🏁 Vault Initalized at address {}", [vaultId.toHexString()]);

  // const context = new DataSourceContext();
  let vault = VaultSchema.load(vaultId.toHexString());

  vault.initialized = true;
  vault.save();
}

// Updates vault.underlyingIsWeth
export function handleUpdateUnderlyingIsWeth(
  event: UnderlyingIsWETHUpdated
): void {
  let vaultId = event.address;
  let underlyingIsWETH = event.params.newUnderlyingIsWETH;

  log.info("⏳ UnderlyingIsWeth Updated, Vault {}, UnderlyingIsWeth: {}", [
    vaultId.toHexString(),
    underlyingIsWETH.toString(),
  ]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.underlyingIsWeth = underlyingIsWETH;
  vault.save();
}

// Updates vault.targetFloatPercent
export function handleTargetFloatPercentUpdated(
  event: TargetFloatPercentUpdated
): void {
  let vaultId = event.address;
  let newTargetFloatPercent = event.params.newTargetFloatPercent;

  log.info(
    "🏖 TargetFloatPercentUpdated, Vault {}, New Target Float Percent: {}",
    [vaultId.toHexString(), newTargetFloatPercent.toString()]
  );

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.targetFloatPercent = newTargetFloatPercent;
  vault.save();
}

// Updates vault.feePercent
export function handleFeePercentUpdated(event: FeePercentUpdated): void {
  let vaultId = event.address;
  let newFeePercent = event.params.newFeePercent;

  log.info("🏦 FeePercentUpdated, Vault {}, New Fee Percent: {}", [
    vaultId.toHexString(),
    newFeePercent.toString(),
  ]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.feePercent = newFeePercent;
  vault.save();
}

/*///////////////////////////////////////////////////////////////
                    HARVEST HANDLERS
//////////////////////////////////////////////////////////////*/

export function handleHarvest(event: Harvest): void {
  let vaultId = event.address;

  log.info("💸 Vault Harvest for vault: {}", [vaultId.toHexString()]);

  let vault = VaultSchema.load(vaultId.toHexString());

  // If this is the first harvest of the new harvest window, set this as the beginning of the latest harvestWindow
  if (
    event.block.timestamp >=
    vault.lastHarvestTimestamp.plus(vault.harvestDelay!)
  ) {
    vault.lastHarvestWindowStartTimestamp = event.block.timestamp;
  }

  // Set lastHarvestTimestamp on every Harvest
  vault.lastHarvestTimestamp = event.block.timestamp;

  // # Contract calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.maxLockedProfit
  let tryMaxLockedProfit = vaultInstance.try_maxLockedProfit();
  if (!tryMaxLockedProfit.reverted) {
    vault.maxLockedProfit = tryMaxLockedProfit.value;
  }

  // vault.totalSupply
  let tryTotalSupply = vaultInstance.try_totalSupply();
  if (!tryTotalSupply.reverted) {
    vault.totalSupply = tryTotalSupply.value;
  }

  // vault.totalStrategyHoldings
  let tryTotalStrategyHoldings = vaultInstance.try_totalStrategyHoldings();
  if (!tryTotalStrategyHoldings.reverted) {
    vault.totalStrategyHoldings = tryTotalStrategyHoldings.value;
  }

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();

  // Update strategy balances
  updateStrategyBalances(event.params.strategies, vaultId);
}

// Updates vault.harvestWindow
export function handleHarvestWindowUpdated(event: HarvestWindowUpdated): void {
  let vaultId = event.address;
  let newHarvestWindow = event.params.newHarvestWindow;

  log.info("⏱ Harvest Window updated for vault: {}, New Window: {}", [
    vaultId.toHexString(),
    newHarvestWindow.toString(),
  ]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.harvestWindow = newHarvestWindow;
  vault.save();
}

// Updates vault.harvestDelay
export function handleHarvestDelayUpdated(event: HarvestDelayUpdated): void {
  let vaultId = event.address;
  let newHarvestDelay = event.params.newHarvestDelay;

  log.info("⌛️ Harvest Delay Updated for vault: {}, New Delay: {}", [
    vaultId.toHexString(),
    newHarvestDelay.toString(),
  ]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.harvestDelay = newHarvestDelay;
  vault.save();
}

// Updates vault.nextHarvestDelay
export function handleHarvestDelayUpdateScheduled(
  event: HarvestDelayUpdateScheduled
): void {
  let vaultId = event.address;
  let nextHarvestDelay = event.params.newHarvestDelay;

  log.info("⏳ Harvest Delay Update Scheduled, Vault {}, Next Delay: {}", [
    vaultId.toHexString(),
    nextHarvestDelay.toString(),
  ]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.nextHarvestDelay = nextHarvestDelay;
  vault.save();
}

/*///////////////////////////////////////////////////////////////
                    STRATEGY HANDLERS
//////////////////////////////////////////////////////////////*/

// handleStrategyTrusted
// Will create a new strategy entity if this strategy has not been trusted before
export function handleStrategyTrusted(event: StrategyTrusted): void {
  let vaultId = event.address;
  let trustedStrategy = event.params.strategy;

  let strategy = getOrCreateStrategy(trustedStrategy, vaultId);

  // Add to the trustedArray if it's not already there
  if (strategy.trusted === false) {
    let vault = VaultSchema.load(vaultId.toHexString());

    vault.trustedStrategies = vault.trustedStrategies.concat([
      trustedStrategy.toHexString(),
    ]);

    vault.save();

    strategy.trusted = true;

    log.info("📈🤝 StrategyTrusted, Vault {}, Strategy: {} - {}", [
      vaultId.toHexString(),
      strategy.name,
      strategy.id,
    ]);

    strategy.save();
  }
}

// handleStrategyDistrusted
// Will remove strategy from `vault.trustedStrategies` and turn off `strategy.trusted`
export function handleStrategyDistrusted(event: StrategyDistrusted): void {
  let vaultId = event.address;
  let distrustedStrategy = event.params.strategy;

  let vault = VaultSchema.load(vaultId.toHexString());

  // Remove from the array
  let strategyIndex = vault.trustedStrategies.indexOf(
    distrustedStrategy.toString()
  );

  if (strategyIndex != -1) {
    let trustedStrategies = vault.trustedStrategies;
    trustedStrategies.splice(strategyIndex, 1);
    vault.trustedStrategies = trustedStrategies;
    vault.save();
  }

  let strategy = getOrCreateStrategy(distrustedStrategy, vaultId);
  strategy.trusted = false;

  log.info("📈💔 StrategyDistrusted, Vault {}, Strategy: {} - {}", [
    vaultId.toHexString(),
    strategy.name,
    strategy.id,
  ]);

  strategy.save();
}

export function handleStrategyDeposit(event: StrategyDeposit): void {
  let vaultId = event.address;
  let strategy = event.params.strategy;
  updateStrategyBalance(strategy, vaultId);

  let vault = VaultSchema.load(vaultId.toHexString());

  // # Contract Calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.totalStrategyHoldings
  let tryTotalStrategyHoldings = vaultInstance.try_totalStrategyHoldings();
  if (!tryTotalStrategyHoldings.reverted) {
    vault.totalStrategyHoldings = tryTotalStrategyHoldings.value;
  }

  // Updated everywhere

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();
}

export function handleStrategyWithdrawal(event: StrategyWithdrawal): void {
  let vaultId = event.address;
  let strategy = event.params.strategy;
  updateStrategyBalance(strategy, vaultId);

  let vault = VaultSchema.load(vaultId.toHexString());

  // # Contract Calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.totalStrategyHoldings
  let tryTotalStrategyHoldings = vaultInstance.try_totalStrategyHoldings();
  if (!tryTotalStrategyHoldings.reverted) {
    vault.totalStrategyHoldings = tryTotalStrategyHoldings.value;
  }

  // Updated everywhere

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();
}

export function handleStrategySeized(event: StrategySeized): void {
  let vaultId = event.address;
  let strategy = event.params.strategy;
  updateStrategyBalance(strategy, vaultId);

  let vault = VaultSchema.load(vaultId.toHexString());

  // # Contract Calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.totalStrategyHoldings
  let tryTotalStrategyHoldings = vaultInstance.try_totalStrategyHoldings();
  if (!tryTotalStrategyHoldings.reverted) {
    vault.totalStrategyHoldings = tryTotalStrategyHoldings.value;
  }

  // Updated everywhere

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();
}

/*///////////////////////////////////////////////////////////////
                    DEPOSIT/WITHDRAW HANDLERS
//////////////////////////////////////////////////////////////*/

export function handleDeposit(event: Deposit): void {
  let vaultId = event.address;

  let vault = VaultSchema.load(vaultId.toHexString());

  // # Contract Calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.totalSupply
  let tryTotalSupply = vaultInstance.try_totalSupply();
  if (!tryTotalSupply.reverted) {
    vault.totalSupply = tryTotalSupply.value;
  }

  // Updated everywhere

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();

  log.info("🏦 ⬅️ Vault Deposit, Vault {}, Amount: {}, User: {}", [
    vaultId.toHexString(),
    event.params.underlyingAmount.toString(),
    event.params.user.toHexString(),
  ]);
}

export function handleWithdraw(event: Withdraw): void {
  let vaultId = event.address;

  let vault = VaultSchema.load(vaultId.toHexString());

  // # Contract Calls # //
  let vaultInstance = VaultTemplate.bind(vaultId);

  // vault.totalSupply
  let tryTotalSupply = vaultInstance.try_totalSupply();
  if (!tryTotalSupply.reverted) {
    vault.totalSupply = tryTotalSupply.value;
  }

  // Updated everywhere

  // vault.lockedProfit
  let tryLockedProfit = vaultInstance.try_lockedProfit();
  if (!tryLockedProfit.reverted) {
    vault.lockedProfit = tryLockedProfit.value;
  }

  // vault.exchangeRate
  let tryExchangeRate = vaultInstance.try_exchangeRate();
  if (!tryExchangeRate.reverted) {
    vault.exchangeRate = tryExchangeRate.value;
  }

  // vault.totalFloat
  let tryTotalFloat = vaultInstance.try_totalFloat();
  if (!tryTotalFloat.reverted) {
    vault.totalFloat = tryTotalFloat.value;
  }

  // vault.totalHoldings
  let tryTotalHoldings = vaultInstance.try_totalHoldings();
  if (!tryTotalFloat.reverted) {
    vault.totalHoldings = tryTotalHoldings.value;
  }

  vault.save();

  log.info("🏦➡️ Vault Withdraw, Vault {}, Amount: {}, User: {}", [
    vaultId.toHexString(),
    event.params.underlyingAmount.toString(),
    event.params.user.toHexString(),
  ]);
}
