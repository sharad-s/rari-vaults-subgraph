import { Address, log } from "@graphprotocol/graph-ts";
import { Strategy as StrategySchema } from "../generated/schema";
import { Strategy as StrategyTemplate } from "../generated/templates/Vault/Strategy";

// Retrieves or creates a strategy by its strategyAddress
export const getOrCreateStrategy = (
  strategyAddress: Address,
  vaultAddress: Address
): StrategySchema => {
  let strategy = StrategySchema.load(strategyAddress.toHexString());

  if (strategy != null) {
    return strategy as StrategySchema;
  }

  // If not found, create it
  let strategyInstance = StrategyTemplate.bind(strategyAddress);

  strategy = new StrategySchema(strategyAddress.toHexString());
  strategy.trusted = false;
  strategy.vault = vaultAddress.toHexString();

  let tryName = strategyInstance.try_name();
  strategy.name = !tryName.reverted ? tryName.value : "UNKNOWN";

  strategy.save();

  log.info("📈👼 Strategy Created, Vault {}, Strategy: {} - {} ", [
    vaultAddress.toHexString(),
    strategy.name,
    strategyAddress.toHexString(),
  ]);

  return strategy as StrategySchema;
};
