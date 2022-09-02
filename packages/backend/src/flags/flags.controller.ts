import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { FlagStatus } from './flags.status';
import { StrategyService } from '../strategy/strategy.service';
import { FlagsService } from './flags.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { strToFlagStatus } from './utils';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { StrategySchema, StrategyCreationDTO } from '../strategy/strategy.dto';
import { HasFlagAccessGuard } from './guards/hasFlagAccess';
import { ValidationPipe } from '../shared/pipes/ValidationPipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ActivateFlagDTO,
  ChangePercentageDTO,
  ChangePercentageSchema,
  VariantCreationDTO,
  VariantSchema,
} from './flags.dto';
import { HasFlagEnvAccessGuard } from './guards/hasFlagEnvAccess';
import { SchedulingCreationDTO, SchedulingSchema } from '../scheduling/types';
import { SchedulingService } from '../scheduling/scheduling.service';

@ApiBearerAuth()
@Controller()
export class FlagsController {
  constructor(
    private readonly strategyService: StrategyService,
    private readonly schedulingService: SchedulingService,
    private readonly flagService: FlagsService,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  /**
   * Update a flag on a given project/env (by project id AND env id AND flagId)
   */
  @Put('environments/:envId/flags/:flagId')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  async changeFlagForEnvStatus(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
    @Body() body: ActivateFlagDTO,
  ) {
    const status: FlagStatus | undefined = strToFlagStatus(body.status);

    if (!status) {
      throw new BadRequestException('Invalid status code');
    }

    const updatedFlagEnv = await this.flagService.changeFlagForEnvStatus(
      envId,
      flagId,
      status,
    );

    this.wsGateway.notifyChanges(
      updatedFlagEnv.environment.clientKey,
      updatedFlagEnv,
    );

    return updatedFlagEnv;
  }

  @Put('environments/:envId/flags/:flagId/percentage')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(ChangePercentageSchema))
  async adjustFlagPercentage(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
    @Body() body: ChangePercentageDTO,
  ) {
    const updatedFlagEnv = await this.flagService.adjustFlagPercentage(
      envId,
      flagId,
      body.rolloutPercentage,
    );

    this.wsGateway.notifyChanges(
      updatedFlagEnv.environment.clientKey,
      updatedFlagEnv,
    );

    return updatedFlagEnv;
  }

  /**
   * Delete a project by project/env/flag
   */
  @Delete('/flags/:flagId')
  @UseGuards(HasFlagAccessGuard)
  @UseGuards(JwtAuthGuard)
  deleteFlag(@Param('flagId') flagId: string) {
    return this.flagService.deleteFlag(flagId);
  }

  /**
   * Get the flag hits grouped by date
   */
  @Get('environments/:envId/flags/:flagId/hits')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  getFlagHits(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
  ): Promise<any> {
    return this.flagService.listFlagHits(envId, flagId);
  }

  @Post('environments/:envId/flags/:flagId/strategies')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(StrategySchema))
  addStrategyToFlag(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
    @Body() strategyDto: StrategyCreationDTO,
  ): Promise<any> {
    return this.strategyService.addStrategyToFlagEnv(
      envId,
      flagId,
      strategyDto,
    );
  }

  @Post('environments/:envId/flags/:flagId/scheduling')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(SchedulingSchema))
  async addSchedulingToFlag(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
    @Body() schedulingDto: SchedulingCreationDTO,
  ): Promise<any> {
    const schedule = await this.schedulingService.addSchedulingToFlagEnv(
      envId,
      flagId,
      schedulingDto,
    );

    return schedule;
  }

  @Post('environments/:envId/flags/:flagId/variants')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(VariantSchema))
  async addVariantsToFlag(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
    @Body() variantDto: VariantCreationDTO,
  ): Promise<any> {
    const variant = await this.flagService.createVariant(
      envId,
      flagId,
      variantDto,
    );

    return variant;
  }

  @Get('environments/:envId/flags/:flagId/strategies')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  getStrategies(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
  ): Promise<any> {
    return this.strategyService.listStrategies(envId, flagId);
  }

  @Get('environments/:envId/flags/:flagId/scheduling')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  getScheduling(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
  ): Promise<any> {
    return this.strategyService.listScheduling(envId, flagId);
  }

  @Get('environments/:envId/flags/:flagId/variants')
  @UseGuards(HasFlagEnvAccessGuard)
  @UseGuards(JwtAuthGuard)
  getVariants(
    @Param('envId') envId: string,
    @Param('flagId') flagId: string,
  ): Promise<any> {
    return this.flagService.listVariants(envId, flagId);
  }
}
