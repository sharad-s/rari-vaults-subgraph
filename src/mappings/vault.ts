import {
  FeePercentUpdated,
  Harvest,
  HarvestDelayUpdated,
  HarvestDelayUpdateScheduled,
  HarvestWindowUpdated,
  Initialized,
  TargetFloatPercentUpdated,
  UnderlyingIsWETHUpdated,
} from "../../generated/VaultFactory/Vault";
import { Vault as VaultSchema } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

// Updates vault.initialized
export function handleVaultInitialized(event: Initialized): void {
  let vaultId = event.address;

  log.info("🏁 Vault Initalized at address {}", [vaultId.toHexString()]);

  // const context = new DataSourceContext();
  let vault = VaultSchema.load(vaultId.toHexString());

  vault.initialized = true;
  vault.save();
}

export function handleHarvest(event: Harvest): void {
  let vaultId = event.address;

  log.info("💸 Vault Harvest for vault: {}", [vaultId.toHexString()]);

  let vault = VaultSchema.load(vaultId.toHexString());
  vault.lastHarvestBlock = event.block.timestamp;
  vault.save();
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
