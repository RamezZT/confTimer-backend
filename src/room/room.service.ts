import { Inject, Injectable } from '@nestjs/common';
import { IdService } from 'src/id/id.service';
import { rooms } from 'src/store';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RoomService {
  constructor(
    private readonly idService: IdService,
    // @InjectRedis() private readonly redis: Redis, // Inject the Redis client
  ) {}
  createRoom() {
    const generatedRoomId = this.idService.generateRandomAlphanumericId();

    // we are supposed to save it to the DB but we don't have one rn
    rooms.set(generatedRoomId, new Map());
    console.log(rooms);
    return { roomId: generatedRoomId };
  }

  getRooms() {
    return Array.from(rooms.keys());
  }
}
