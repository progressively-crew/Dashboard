import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { PrismaService } from '../prisma.service';
import { FlagsController } from './flags.controller';
import { EnvironmentsService } from '../environments/environments.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { StrategyService } from '../strategy/strategy.service';

@Module({
  providers: [
    PrismaService,
    FlagsService,
    EnvironmentsService,
    WebsocketGateway,
    StrategyService,
  ],
  controllers: [FlagsController],
})
export class FlagsModule {}
