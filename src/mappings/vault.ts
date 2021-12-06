import { Initialized } from "../../generated/VaultFactory/Vault";
import { Vault } from "../../generated/schema";

export function handleVaultInitialized(event: Initialized): void {
  const vaultId = event.address;

  // const context = new DataSourceContext();
  const vault = Vault.load(vaultId.toHexString());

  vault.initialized = true;
  vault.save();
}
