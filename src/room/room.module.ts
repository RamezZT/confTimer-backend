import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { IdService } from 'src/id/id.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, IdService],
})
export class RoomModule {}
