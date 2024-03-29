import { Environment } from "../environments/types";
import { Variant } from "../variants/types";

export enum FlagStatus {
  ACTIVATED = "ACTIVATED",
  NOT_ACTIVATED = "NOT_ACTIVATED",
  INACTIVE = "INACTIVE",
}

export interface Flag {
  createdAt: string;
  description: string;
  key: string;
  name: string;
  uuid: string;
}

export interface FlagWithEnvs extends Flag {
  flagEnvironment: Array<FlagEnv>;
}

export interface FlagEnv {
  flagId: string;
  environmentId: string;
  status: FlagStatus;
  flag: Flag;
  environment: Environment;
  variants: Array<Variant>;
}

export interface CreateFlagDTO {
  description?: string;
  name?: string;
}

export interface Metric {
  uuid: string;
  name: string;
  variant?: Variant;
}
