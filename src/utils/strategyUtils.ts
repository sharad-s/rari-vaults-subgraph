import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Strategy as StrategySchema } from "../../generated/schema";
import { Strategy as StrategyTemplate } from "../../generated/templates/Vault/Strategy";
import { Vault as VaultTemplate } from "../../generated/templates/Vault/Vault";

// Retrieves or creates a strategy by its strategyAddress
export function getOrCreateStrategy(
  strategyAddress: Address,
  vaultAddress: Address
): StrategySchema {
  let strategy = StrategySchema.load(strategyAddress.toHexString());

  if (strategy != null) {
    return strategy as StrategySchema;
  }

  // If not found, create it
  let strategyInstance = StrategyTemplate.bind(strategyAddress);

  strategy = new StrategySchema(strategyAddress.toHexString());
  strategy.trusted = false;
  strategy.vault = vaultAddress.toHexString();

  // We initialize balance to 0 to satisfy non-null. We will update it in this function below
  strategy.balance = new BigInt(0);

  let tryName = strategyInstance.try_name();
  strategy.name = !tryName.reverted ? tryName.value : "NAME";

  let trySymbol = strategyInstance.try_symbol();
  strategy.symbol = !trySymbol.reverted ? trySymbol.value : "SYMBOL";

  // Create the Entity
  strategy.save();

  log.info("📈👼 Strategy Created, Vault {}, Strategy: {} - {} ", [
    vaultAddress.toHexString(),
    strategy.name,
    strategyAddress.toHexString(),
  ]);

  // Update the Strategy's balance on creation
  updateStrategyBalance(strategyAddress, vaultAddress);

  return strategy as StrategySchema;
}

// Updates Strategy entity's balance by reading from chain
// Called on: StrategyDeposit, StrategyWithdraw, StrategySeize,
export function updateStrategyBalance(
  strategyAddress: Address,
  vaultAddress: Address
): BigInt | null {
  // Vault Contract instance
  let vaultInstance = VaultTemplate.bind(vaultAddress);

  // # Contract calls # //

  // Try reading the balance, update if successful
  let tryStrategyData = vaultInstance.try_getStrategyData(strategyAddress);

  if (!tryStrategyData.reverted) {
    // We can just load the schema directly, it already exists
    let strategySchema = StrategySchema.load(strategyAddress.toHexString());

    let balance = tryStrategyData.value.value1;

    // Update balance only if changed
    if (strategySchema.balance !== balance) {
      strategySchema.balance = balance;
      strategySchema.save();
      log.info(
        "📈✅ Updated Strategy Balance, Vault {}, Strategy: {} , Balance: {}",
        [
          vaultAddress.toHexString(),
          strategyAddress.toHexString(),
          balance.toString(),
        ]
      );
    }

    return balance;
  } else return null;
}

// Updates multiple Strategy entities balance on a single Vault by reading from chain
// Called on: Harvest
export function updateStrategyBalances(
  strategyAddresses: Address[],
  vaultAddress: Address
): void {
  // Vault Contract instance
  let vaultInstance = VaultTemplate.bind(vaultAddress);

  // Loop through strategy addresses
  for (let i = 0; i < strategyAddresses.length; i++) {
    let strategyAddress = strategyAddresses[i];

    // # Contract calls # //

    // Try reading the balance from vault, update if successful
    let tryStrategyData = vaultInstance.try_getStrategyData(strategyAddress);

    if (!tryStrategyData.reverted) {
      // We can just load the schema directly, it already exists
      let strategySchema = StrategySchema.load(strategyAddress.toHexString());

      let balance = tryStrategyData.value.value1;

      // Update if balance has changed
      if (strategySchema.balance !== balance) {
        strategySchema.balance = balance;
        strategySchema.save();
        log.info(
          "📈✅🍠 Updated Strategy Balance during Harvest, Vault {}, Strategy: {} , Balance: {}",
          [
            vaultAddress.toHexString(),
            strategyAddress.toHexString(),
            balance.toString(),
          ]
        );
      }
    }
  }
}
