import { VaultDeployed } from "../../generated/VaultFactory/VaultFactory";
import { Vault } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";
import { Vault as VaultTemplate } from "../../generated/templates";

export function handleVaultDeployed(event: VaultDeployed): void {
  let vaultId = event.params.vault;
  let underlying = event.params.underlying;

  log.info("👼 Vault Created at address {}", [vaultId.toHexString()]);

  // let context = new DataSourceContext();
  let vault = new Vault(vaultId.toHexString());

  vault.underlying = underlying;
  vault.initialized = false;

  VaultTemplate.create(vaultId);
  vault.save();
}
