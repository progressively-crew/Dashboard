import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SegmentCreationDTO } from './types';
import { ComparatorEnum } from '../rule/comparators/types';
import { RuleService } from '../rule/rule.service';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) {}

  listSegments(envId: string, flagId: string) {
    return this.prisma.segment.findMany({
      where: {
        flagEnvironmentEnvironmentId: envId,
        flagEnvironmentFlagId: flagId,
      },
      include: {
        rule: true,
      },
    });
  }

  addSegmentToFlagEnv(envId: string, flagId: string, name: string) {
    return this.prisma.segment.create({
      data: {
        name,
        flagEnvironment: {
          connect: {
            flagId_environmentId: {
              environmentId: envId,
              flagId: flagId,
            },
          },
        },
      },
    });
  }

  getSegment(segmentId: string) {
    return this.prisma.segment.findFirst({
      where: {
        uuid: segmentId,
      },
      include: {
        rule: true,
      },
    });
  }

  async deleteSegment(segmentId: string) {
    const queries = [
      this.prisma.rule.deleteMany({
        where: {
          segmentUuid: segmentId,
        },
      }),
      this.prisma.segment.delete({
        where: {
          uuid: segmentId,
        },
      }),
    ];

    const result = await this.prisma.$transaction(queries);

    return result[result.length - 1];
  }

  async hasPermissionOnSegment(
    segmentId: string,
    userId: string,
    roles?: Array<string>,
  ) {
    const flagOfProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        project: {
          environments: {
            some: {
              flagEnvironment: {
                some: { Segment: { some: { uuid: segmentId } } },
              },
            },
          },
        },
      },
    });

    if (!flagOfProject) {
      return false;
    }

    if (!roles || roles.length === 0) {
      return true;
    }

    return roles.includes(flagOfProject.role);
  }

  updateSegment(uuid: string, segment: SegmentCreationDTO) {
    return this.prisma.segment.update({
      where: {
        uuid,
      },
      data: {
        name: segment.name,
      },
    });
  }

  createRuleForSegment(segmentId: string) {
    return this.prisma.rule.create({
      data: {
        segmentUuid: segmentId,
        fieldComparator: ComparatorEnum.Equals,
        fieldName: '',
        fieldValue: '',
      },
    });
  }

  getSegmentFlagEnv(segmentId: string) {
    return this.prisma.segment.findFirst({
      where: {
        uuid: segmentId,
      },
      include: {
        flagEnvironment: {
          include: {
            environment: true,
            flag: true,
            Segment: {
              include: {
                rule: true,
              },
            },
            variants: true,
          },
        },
      },
    });
  }
}
