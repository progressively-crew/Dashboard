import { Injectable } from '@nestjs/common';
import { UserRoles } from '../users/roles';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  createProject(name: string, userId: string) {
    return this.prisma.project.create({
      data: {
        name,
        userProject: {
          create: {
            userId,
            role: UserRoles.Admin,
          },
        },
        environments: {
          createMany: {
            data: [{ name: 'Production' }, { name: 'Development' }],
          },
        },
      },
    });
  }

  getAll(userId: string) {
    return this.prisma.userProject.findMany({
      where: {
        userId,
      },
      include: {
        project: {
          include: {
            environments: {
              include: {
                flagEnvironment: {
                  include: {
                    flag: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  getById(uuid: string, populateMember: boolean) {
    let userProject: any = false;

    if (populateMember) {
      userProject = {
        include: {
          user: {
            select: {
              fullname: true,
              uuid: true,
              email: true,
            },
          },
        },
      };
    }

    return this.prisma.project.findUnique({
      where: {
        uuid,
      },
      include: {
        environments: true,
        userProject,
      },
    });
  }

  async hasPermissionOnProject(
    projectId: string,
    userId: string,
    roles?: Array<string>,
  ) {
    const userProject = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          projectId,
          userId,
        },
      },
    });

    if (!userProject) {
      return false;
    }

    if (!roles || roles.length === 0) {
      return true;
    }

    return roles.includes(userProject.role);
  }

  userProject(projectId: string, memberId: string) {
    return this.prisma.userProject.findFirst({
      where: {
        userId: memberId,
        projectId,
      },
      include: {
        user: true,
      },
    });
  }

  removeMember(projectId: string, memberId: string) {
    return this.prisma.userProject.delete({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });
  }

  addMember(projectId: string, userId: string) {
    return this.prisma.userProject.create({
      data: { userId, projectId, role: UserRoles.User },
    });
  }

  async deleteProject(projectId: string) {
    const deleteQueries = [
      this.prisma.webhook.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.flagHit.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.pMetricHit.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.pMetric.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.variant.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.schedule.deleteMany({
        where: {
          flagEnvironment: {
            environment: { projectId },
          },
        },
      }),
      this.prisma.rolloutStrategy.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.eligibility.deleteMany({
        where: {
          flagEnvironment: {
            environment: {
              projectId,
            },
          },
        },
      }),
      this.prisma.flagEnvironment.deleteMany({
        where: {
          environment: {
            projectId,
          },
        },
      }),
      this.prisma.environment.deleteMany({
        where: {
          projectId,
        },
      }),
      this.prisma.userProject.deleteMany({
        where: {
          projectId,
        },
      }),

      this.prisma.project.delete({
        where: {
          uuid: projectId,
        },
      }),
    ];

    const result = await this.prisma.$transaction(deleteQueries);

    return result[result.length - 1];
  }
}
