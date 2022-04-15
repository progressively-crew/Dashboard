import { FlagDict } from "@rollout/sdk-js";
import { createContext } from "react";

export interface RolloutContextType {
  flags: FlagDict;
  isLoading: boolean;
  error?: Error;
}

export const RolloutContext = createContext<RolloutContextType>({
  flags: {},
  isLoading: false,
  error: undefined,
});
