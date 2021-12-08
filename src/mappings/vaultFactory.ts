import { VaultDeployed } from "../../generated/VaultFactory/VaultFactory";
import { log } from "@graphprotocol/graph-ts";
import { Vault as VaultSchema } from "../../generated/schema";
import { Vault as VaultTemplate } from "../../generated/templates";
import { ERC20 } from "../../generated/VaultFactory/ERC20";

export function handleVaultDeployed(event: VaultDeployed): void {
  let vaultId = event.params.vault;
  let underlying = event.params.underlying;

  log.info("👼 Vault Created at address {}, underlying {}", [
    vaultId.toHexString(),
    underlying.toHexString(),
  ]);

  // Load Underlying Token Instance
  let erc20 = ERC20.bind(underlying);

  // Set initial attributes for Vault entity
  let vault = new VaultSchema(vaultId.toHexString());
  vault.underlying = underlying;
  vault.initialized = false;
  vault.underlyingSymbol = erc20.symbol();
  vault.underlyingDecimals = erc20.decimals();
  vault.underlyingIsWeth = false;
  
  // Strategies
  vault.trustedStrategies = [];

  // Withdrawal Queue
  vault.withdrawalQueue = [];


  // Start listening for events on this newly created Vault using its template
  VaultTemplate.create(vaultId);

  // Save the Vault Entity
  vault.save();
}
