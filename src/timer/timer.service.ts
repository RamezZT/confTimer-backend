import { Injectable, NotFoundException } from '@nestjs/common';
import { IdService } from 'src/id/id.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Timer } from './timer.gateway';
import { plainToClass } from 'class-transformer';
import { RetrieveTimerDto } from './dto/retrieve-timer.dto';

@Injectable()
export class TimerService {
  constructor(
    private readonly idService: IdService,
    @InjectRedis() private readonly redis: Redis, // Inject the Redis client
  ) {}
  // public createTimer(roomId: string) {
  //   // check if the room exists
  //   if (!rooms.has(roomId)) {
  //     throw new NotFoundException(`Unable to find room with id ${roomId}`);
  //   }
  //   const newTimer: Timer = {
  //     running: false,
  //     timerId: this.idService.generateRandomAlphanumericId(),
  //     elapsedTime: 0,
  //     kickoff: null,
  //     deadline: null,
  //     lastStop: null,
  //   };

  //   rooms.get(roomId)!.set(newTimer.timerId, newTimer);
  //   console.log(rooms);
  //   return newTimer;
  // }

  async createTimer(roomId: string) {
    const exists = await this.redis.sismember('rooms', roomId);
    if (!exists) {
      console.log('no ROOM');
      throw new NotFoundException('Room not found');
    }

    const timerId = this.idService.generateRandomAlphanumericId();

    await this.redis.sadd(`room:${roomId}:timers`, timerId);

    await this.redis.hset(`timer:${timerId}`, {
      running: false,
      timerId: timerId,
      elapsedTime: 0,
      kickoff: null,
      deadline: null,
      lastStop: null,
    });

    return { timerId };
  }

  async getTimer(timerId: string) {
    const key = `timer:${timerId}`;

    // Get all fields from Redis hash
    const rawTimer = await this.redis.hgetall(key);
    console.log(timerId);
    console.log(rawTimer);
    // If hash doesn't exist
    if (!Object.keys(rawTimer).length) {
      console.log('throwing');
      throw new NotFoundException(`Timer ${timerId} not found`);
    }

    // Deserialize string fields to proper types
    const timer = plainToClass(RetrieveTimerDto, rawTimer);
    console.log(timer);
    return timer;
  }
  async editTimer(timerId: string, updates: Partial<Timer>): Promise<Timer> {
    const existingTimer = await this.getTimer(timerId);

    const updatedTimer: Timer = {
      ...existingTimer,
      ...updates,
    };

    await this.redis.hset(`timer:${timerId}`, updatedTimer);

    return updatedTimer;
  }

  async getRoomTimers(roomId: string) {
    const timerIds = await this.redis.smembers(`room:${roomId}:timers`);
    const rawTimers = await Promise.all(
      timerIds.map((id) => this.redis.hgetall(`timer:${id}`)),
    );
    const timers = rawTimers.map((rawTimer) =>
      plainToClass(RetrieveTimerDto, rawTimer),
    );

    return timers;
  }
}
