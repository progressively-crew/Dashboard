import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Request,
  Get,
  Param,
  Delete,
  Query,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import {
  MemberProjectDTO,
  ProjectCreationDTO,
  ProjectCreationSchema,
} from './projects.dto';
import { ProjectsService } from './projects.service';
import { UserRetrieveDTO } from 'src/users/users.dto';
import { Environment, UserProject } from '@prisma/client';
import { Roles } from '../shared/decorators/Roles';
import { UserRoles } from '../users/roles';
import { HasProjectAccessGuard } from './guards/hasProjectAccess';
import { ValidationPipe } from '../shared/pipes/ValidationPipe';
import { UsersService } from '../users/users.service';
import { EnvironmentsService } from '../environments/environments.service';
import {
  EnvironmentCreationSchema,
  EnvironmentDTO,
} from '../environments/environments.dto';
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
    private readonly envService: EnvironmentsService,
  ) {}

  @Get(':id')
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  getById(
    @Param('id') id: string,
    @Query('populate') populateMember?: boolean,
  ) {
    return this.projectService.getById(id, populateMember);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllProjects(@Request() req) {
    const user: UserRetrieveDTO = req.user;

    return this.projectService.getAll(user.uuid);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(ProjectCreationSchema))
  async createProject(
    @Request() req,
    @Body() projectDto: ProjectCreationDTO,
  ): Promise<UserProject> {
    const user: UserRetrieveDTO = req.user;

    return this.projectService.createProject(projectDto.name, user.uuid);
  }

  @Delete(':id/members/:memberId')
  @Roles(UserRoles.Admin)
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  async deleteMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    const userProject = await this.projectService.userProject(id, memberId);

    if (!userProject) {
      throw new NotFoundException();
    }

    if (userProject.role === UserRoles.Admin) {
      throw new UnauthorizedException();
    }

    return this.projectService.removeMember(id, memberId);
  }

  @Post(':id/members')
  @Roles(UserRoles.Admin)
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('id') id: string,
    @Body() memberProjectDto: MemberProjectDTO,
  ) {
    const user = await this.userService.findByEmail(memberProjectDto.email);

    if (!user) {
      throw new NotFoundException(
        'The user does not exist. They must have to create an account before being able to join the project.',
      );
    }

    const userProject = await this.projectService.userProject(id, user.uuid);

    if (userProject) {
      throw new ConflictException(
        'The user is already a member of the project.',
      );
    }

    return this.projectService.addMember(id, user.uuid);
  }

  @Delete(':id')
  @Roles(UserRoles.Admin)
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) {
    return this.projectService.deleteProject(id);
  }

  /**
   * Get all the environments of a given project (by id)
   */
  @Get(':id/environments')
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  getProjectEnvironments(@Param('id') id: string) {
    return this.envService.getProjectEnvironments(id);
  }

  /**
   * Create an environment on a given project (by id)
   */
  @Post(':id/environments')
  @UseGuards(HasProjectAccessGuard)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(EnvironmentCreationSchema))
  createEnvironment(
    @Param('id') id: string,
    @Body() envDto: EnvironmentDTO,
  ): Promise<Environment> {
    return this.envService.createEnvironment(id, envDto.name);
  }
}
