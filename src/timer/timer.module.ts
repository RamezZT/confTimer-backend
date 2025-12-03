import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { TimerGateway } from './timer.gateway';
import { IdService } from 'src/id/id.service';
import { TimerService } from './timer.service';

@Module({
  controllers: [TimerController],
  providers: [TimerGateway, IdService, TimerService],
})
export class TimerModule {}
