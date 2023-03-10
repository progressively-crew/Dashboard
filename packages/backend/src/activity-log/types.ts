export type ActivityType =
  | 'change-flag-status'
  | 'change-flag-percentage'
  | 'change-variants-percentage'
  | 'create-additional-audience'
  | 'create-eligibility-restriction'
  | 'create-webhook'
  | 'create-scheduling'
  | 'create-metric'
  | 'create-variant'
  | 'delete-webhook'
  | 'delete-variant'
  | 'delete-metric'
  | 'delete-scheduling'
  | 'delete-eligibility'
  | 'delete-additional-audience'
  | 'edit-eligibility'
  | 'edit-additional-audience';

export type ActivityEntity = 'flag';

export interface Activity {
  userId: string;
  envId: string;
  flagId: string;
  type: ActivityType;
  concernedEntity: ActivityEntity;
  data?: string;
}
