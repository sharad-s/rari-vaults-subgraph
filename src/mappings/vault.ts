import { Initialized } from "../../generated/VaultFactory/Vault";
import { Vault } from "../../generated/schema";

export function handleVaultInitialized(event: Initialized): void {
  let vaultId = event.address;

  // const context = new DataSourceContext();
  let vault = Vault.load(vaultId.toHexString());

  vault.initialized = true;
  vault.save();
}
