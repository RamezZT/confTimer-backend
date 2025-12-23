import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TimerModule } from './timer/timer.module';
import { RoomModule } from './room/room.module';
import { IdService } from './id/id.service';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    EventsModule,
    TimerModule,
    RoomModule,
    RedisModule.forRoot({
      type: 'single',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IdService],
})
export class AppModule {}
