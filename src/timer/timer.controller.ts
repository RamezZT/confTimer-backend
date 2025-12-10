import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TimerService } from './timer.service';

@Controller('timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}
  @Post()
  createTimer(@Body() body: { roomId: string }) {
    return this.timerService.createTimer(body.roomId);
  }

  @Get()
  getAllRoomTimers(@Query('roomId') roomId: string) {
    return this.timerService.getRoomTimers(roomId);
  }
}
