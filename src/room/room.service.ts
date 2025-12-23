import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { IdService } from 'src/id/id.service';
@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  private static readonly ROOMS_KEY = 'rooms';
  private static readonly ROOM_KEY_PREFIX = 'room:';
  constructor(
    private readonly idService: IdService,
    @InjectRedis() private readonly redis: Redis, // Inject the Redis client
  ) {}
  async createRoom() {
    const roomId = this.idService.generateRandomAlphanumericId();
    this.logger.log(`creating a room with id: ${roomId}`);

    await this.redis.sadd('rooms', roomId);

    return { roomId };
  }

  async getRooms() {
    return await this.redis.smembers(RoomService.ROOMS_KEY);
  }

  async roomExists(roomId: string): Promise<boolean> {
    return (await this.redis.sismember(RoomService.ROOMS_KEY, roomId)) === 1;
  }

  async getRoom(roomId: string) {
    const exists = await this.redis.sismember('rooms', roomId);
    if (!exists) {
      throw new NotFoundException(`Room ${roomId} not found`);
    }

    const room = await this.redis.hgetall(`room:${roomId}`);
    return room;
  }
}
