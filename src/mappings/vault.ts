import { Initialized } from "../../generated/VaultFactory/Vault";
import { Vault as VaultSchema } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleVaultInitialized(event: Initialized): void {
  let vaultId = event.address;

  log.info("🏁 Vault Initalized at address {}", [vaultId.toHexString()]);

  // const context = new DataSourceContext();
  let vault = VaultSchema.load(vaultId.toHexString());

  vault.initialized = true;
  vault.save();
}
