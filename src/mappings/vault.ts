import {
  Harvest,
  HarvestDelayUpdated,
  HarvestDelayUpdateScheduled,
  HarvestWindowUpdated,
  Initialized,
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
