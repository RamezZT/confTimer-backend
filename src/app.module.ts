import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TimerModule } from './timer/timer.module';
import { RoomModule } from './room/room.module';
import { IdService } from './id/id.service';
import { RedisModule } from '@nestjs-modules/ioredis';

console.log(process.env.REDIS_URL);
@Module({
  imports: [
    EventsModule,
    TimerModule,
    RoomModule,
    RedisModule.forRoot({
      type: 'single',
      // url: 'redis-14275.crce220.us-east-1-4.ec2.cloud.redislabs.com:14275',
      url: 'rediss://default:AU66AAIncDI3Y2JiZjRjYWNlZWU0ZDhjYjhjNjcxZGRlYzQ5YzQ1MXAyMjAxNTQ@new-cattle-20154.upstash.io:6379',
      options: {
        username: 'default',
        //   host: 'redis-14275.crce220.us-east-1-4.ec2.cloud.redislabs.com',
        //   port: 14275,
        // },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IdService],
})
export class AppModule {}
