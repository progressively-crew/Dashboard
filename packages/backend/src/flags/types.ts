import { Eligibility } from '../eligibility/types';
import { Environment } from '../environments/types';
import { RolloutStrategy } from '../strategy/types';
import { FlagStatus } from './flags.status';

export interface Flag {
  uuid: string;
  name: string;
  key: string;
  description: string;
  createdAt: Date;
}

export interface FlagEnvironment {
  flagId: string;
  environmentId: string;
  status: string;
  rolloutPercentage: number;
  variants: Array<Variant>;
}

interface Schedule {
  uuid: string;
  utc: string;
  rolloutPercentage: number;
  status: FlagStatus;
  schedulingStatus: SchedulingStatus;
}

export interface PopulatedFlagEnv extends FlagEnvironment {
  environment: Environment;
  flag: Flag;
  strategies: Array<RolloutStrategy>;
  scheduling: Array<Schedule>;
  eligibilities: Array<Eligibility>;
}

export enum SchedulingStatus {
  NOT_RUN = 'NOT_RUN',
  HAS_RUN = 'HAS_RUN',
}

export interface Variant {
  uuid: string;
  rolloutPercentage: number;
  isControl: boolean;
  value: string;
}

export interface MetricDto {
  name: string;
  variantId?: string;
}
