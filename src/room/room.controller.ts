import { Controller, Get, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post('')
  createRoom() {
    return this.roomService.createRoom();
  }

  @Get('')
  getRooms() {
    return this.roomService.getRooms();
  }
}
