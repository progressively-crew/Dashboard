import { Test, TestingModule } from '@nestjs/testing';
import { FlagStatus } from '../flags/flags.status';
import { PopulatedFlagEnv, PopulatedStrategy } from '../flags/types';
import { SdkService } from './sdk.service';
import { AppModule } from '../app.module';
import { RedisService } from '../websocket/redis.service';
import { ComparatorEnum } from '../../src/rule/comparators/types';

describe('SdkService', () => {
  let service: SdkService;
  let flagEnv: PopulatedFlagEnv;
  let redisService: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<SdkService>(SdkService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await redisService.close();
  });

  beforeEach(() => {
    flagEnv = {
      environmentId: '1',
      flagId: '2',
      flag: {
        uuid: '1',
        createdAt: new Date(),
        description: 'Description of the flag',
        key: 'flag-key',
        name: 'Super flag',
      },
      status: FlagStatus.ACTIVATED,
      variants: [],
      scheduling: [],
      environment: {
        name: 'First',
        uuid: '1',
        clientKey: 'abc',
        projectId: '12',
      },
      strategies: [],
    };
  });

  describe('resolveFlagStatus', () => {
    describe('No strategies (true / false)', () => {
      it('does not resolve the flag when not activated', () => {
        flagEnv.status = FlagStatus.NOT_ACTIVATED;

        const shouldActivate = service.resolveFlagStatus(flagEnv, {
          id: 'user-id-123',
        });

        expect(shouldActivate).toBe(false);
      });

      it('resolves "true" when the flag is activated', () => {
        const shouldActivate = service.resolveFlagStatus(flagEnv, {
          id: 'user-id-123',
        });

        expect(shouldActivate).toBe(true);
      });
    });

    describe('With strategies (no rules)', () => {
      describe('valueToServe: boolean', () => {
        it('resolves "true" when the strategy has a rollout of 100% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'true',
              valueToServeType: 'Boolean',
              uuid: '1',
              variants: [],
              rolloutPercentage: 100,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(true);
        });

        it('resolves "false" when the strategy has a rollout of 0% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'true',
              valueToServeType: 'Boolean',
              uuid: '1',
              variants: [],
              rolloutPercentage: 0,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(false);
        });

        it('resolves "false" when the strategy has a rollout of 10% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'true',
              valueToServeType: 'Boolean',
              uuid: '1',
              variants: [],
              rolloutPercentage: 10,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(false);
        });

        it('resolves "true" when the strategy has a rollout of 90% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'true',
              valueToServeType: 'Boolean',
              uuid: '1',
              variants: [],
              rolloutPercentage: 90,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(true);
        });
      });

      describe('valueToServe: string', () => {
        it('resolves "hello world" when the strategy has a rollout of 100% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'String',
              uuid: '1',
              variants: [],
              rolloutPercentage: 100,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe('hello world');
        });

        it('resolves "false" when the strategy has a rollout of 0% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'String',
              uuid: '1',
              variants: [],
              rolloutPercentage: 0,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(false);
        });

        it('resolves "false" when the strategy has a rollout of 10% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'String',
              uuid: '1',
              variants: [],
              rolloutPercentage: 10,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe(false);
        });

        it('resolves "hello-world" when the strategy has a rollout of 90% and no rules', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'String',
              uuid: '1',
              variants: [],
              rolloutPercentage: 90,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe('hello world');
        });
      });

      describe('valueToServe: variants', () => {
        let control;
        let second;

        beforeEach(() => {
          control = {
            rolloutPercentage: 100,
            strategyUuid: '1',
            variantUuid: '1',
            variant: {
              uuid: '1',
              value: 'Control',
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              isControl: true,
            },
          };

          second = {
            rolloutPercentage: 0,
            strategyUuid: '1',
            variantUuid: '2',
            variant: {
              uuid: '2',
              value: 'Second',
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              isControl: false,
            },
          };
        });

        it('resolves "Control" when the strategy has 2 variants with Control 100% and Second 0% (no rules)', () => {
          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'Variant',
              uuid: '1',
              variants: [control, second],
              rolloutPercentage: undefined,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe('Control');
        });

        it('resolves "Second" when the strategy has 2 variants with Second 100% and Control 0% (no rules)', () => {
          second.rolloutPercentage = 100;
          control.rolloutPercentage = 0;

          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'Variant',
              uuid: '1',
              variants: [control, second],
              rolloutPercentage: undefined,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe('Second');
        });

        it('resolves "Control" when the strategy has 2 variants with Control 1% and Second 1% (no rules)', () => {
          second.rolloutPercentage = 1;
          control.rolloutPercentage = 1;

          flagEnv.strategies = [
            {
              flagEnvironmentEnvironmentId: '1',
              flagEnvironmentFlagId: '1',
              valueToServe: 'hello world',
              valueToServeType: 'Variant',
              uuid: '1',
              variants: [control, second],
              rolloutPercentage: undefined,
              rules: [],
              createdAt: null,
            },
          ];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
          });

          expect(shouldActivate).toBe('Control');
        });
      });
    });

    describe('With strategies and rules', () => {
      let stratOne: PopulatedStrategy;
      let stratTwo: PopulatedStrategy;

      beforeEach(() => {
        stratOne = {
          flagEnvironmentEnvironmentId: '1',
          flagEnvironmentFlagId: '1',
          valueToServe: undefined,
          valueToServeType: 'Boolean',
          uuid: '1',
          variants: [],
          rolloutPercentage: 100,
          rules: [
            {
              fieldComparator: ComparatorEnum.Equals,
              fieldName: 'id',
              fieldValue: 'marvin',
            },
            {
              fieldComparator: ComparatorEnum.Equals,
              fieldName: 'email',
              fieldValue: 'notgood',
            },
          ],
          createdAt: new Date(1992, 5, 21),
        };

        stratTwo = JSON.parse(JSON.stringify(stratOne));
      });

      describe('valueToServe: boolean', () => {
        it('resolves true when the rollout percentage is 100% and the user matches the rules of one of the strategies', () => {
          stratTwo.rules = [
            {
              fieldComparator: ComparatorEnum.Equals,
              fieldName: 'email',
              fieldValue: 'marvin',
            },
          ];

          flagEnv.strategies = [stratOne, stratTwo];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
            email: 'marvin',
          });

          expect(shouldActivate).toBe(true);
        });

        it('resolves false when the rollout percentage is 100% and the user does not matches the rules', () => {
          flagEnv.strategies = [stratOne, stratTwo];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
            email: 'marvinx',
          });

          expect(shouldActivate).toBe(false);
        });
      });

      describe('valueToServe: string', () => {
        it('resolves "hello world" when the rollout percentage is 100% and the user matches the rules', () => {
          stratOne.valueToServeType = 'String';
          stratTwo.valueToServeType = 'String';
          stratOne.valueToServe = 'noop';
          stratTwo.valueToServe = 'hello world';

          stratTwo.rules = [
            {
              fieldComparator: ComparatorEnum.Equals,
              fieldName: 'email',
              fieldValue: 'marvin',
            },
          ];

          flagEnv.strategies = [stratOne, stratTwo];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
            email: 'marvin',
          });

          expect(shouldActivate).toBe('hello world');
        });

        it('resolves false when the rollout percentage is 100% and the user does not matches the rules', () => {
          stratOne.valueToServeType = 'String';
          stratTwo.valueToServeType = 'String';
          stratOne.valueToServe = 'noop';
          stratTwo.valueToServe = 'hello world';

          stratTwo.rules = [
            {
              fieldComparator: ComparatorEnum.Equals,
              fieldName: 'email',
              fieldValue: 'marvin',
            },
          ];

          flagEnv.strategies = [stratOne, stratTwo];

          const shouldActivate = service.resolveFlagStatus(flagEnv, {
            id: 'user-id-123',
            email: 'marvinx',
          });

          expect(shouldActivate).toBe(false);
        });

        describe('segments', () => {
          const segmentRule = {
            fieldName: null,
            fieldComparator: null,
            fieldValue: null,
            Segment: {
              uuid: '1',
              name: 'By email',
              createdAt: new Date(1992, 5, 21),
              rule: [
                {
                  fieldName: 'email',
                  fieldComparator: ComparatorEnum.Contains,
                  fieldValue: '@gmail',
                },
                {
                  fieldName: 'id',
                  fieldComparator: ComparatorEnum.Equals,
                  fieldValue: '123',
                },
              ],
            },
          };

          it('resolves false when the user does not match any rule of the segment', () => {
            stratOne.rules = [segmentRule];
            flagEnv.strategies = [stratOne];

            const shouldActivate = service.resolveFlagStatus(flagEnv, {
              id: 'user-id-123',
              email: 'marvinx',
            });

            expect(shouldActivate).toBe(false);
          });

          it('resolves false when the user only matches one rule of the segment', () => {
            stratOne.rules = [segmentRule];
            flagEnv.strategies = [stratOne];

            const shouldActivate = service.resolveFlagStatus(flagEnv, {
              id: 'user-id-123',
              email: '@gmail.com',
            });

            expect(shouldActivate).toBe(false);
          });

          it('resolves true when the user matches all the rules rule of the segment', () => {
            stratOne.rules = [segmentRule];
            flagEnv.strategies = [stratOne];

            const shouldActivate = service.resolveFlagStatus(flagEnv, {
              id: '123',
              email: '@gmail.com',
            });

            expect(shouldActivate).toBe(true);
          });
        });
      });
    });
  });
});
