import { ComparatorEnum } from "../strategies/types";

export interface Eligibility {
  uuid: string;
  fieldName: string;
  fieldComparator: ComparatorEnum;
  fieldValue: string;
  flagEnvironmentFlagId: string;
  flagEnvironmentEnvironmentId: string;
}

export interface EligibilityCreateDTO {
  fieldName: string;
  fieldComparator: ComparatorEnum;
  fieldValue: string;
}