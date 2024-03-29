import * as Joi from 'joi';
import { FlagStatus } from '../flags/flags.status';

export enum SchedulingType {
  UpdatePercentage = 'UpdatePercentage',
}

export interface SchedulingUpdatePercentageData {
  rolloutPercentage: number;
}

export type SchedulingCreationDTO = {
  utc: string;
  rolloutPercentage: number;
  status: FlagStatus;
} & {
  type: SchedulingType.UpdatePercentage;
  data: SchedulingUpdatePercentageData;
};

export interface SchedulingUpdateVariantEntry {
  variantId: string;
  variantNewPercentage: number;
}

export const SchedulingSchema = Joi.object({
  utc: Joi.date().required(),
  status: Joi.string()
    .valid(FlagStatus.ACTIVATED, FlagStatus.NOT_ACTIVATED)
    .required(),

  type: Joi.string().valid(SchedulingType.UpdatePercentage),

  data: Joi.any(),
});
