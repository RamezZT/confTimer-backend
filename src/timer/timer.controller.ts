import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TimerService } from './timer.service';

@Controller('timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}
  @Post()
  createTimer(@Body() body: { roomId: string }) {
    this.timerService.createTimer(body.roomId);
  }

  @Get()
  getAllTimers(@Query('roomId') roomId: string) {
    console.log(this.timerService.getAllTimers(roomId));
    return this.timerService.getAllTimers(roomId);
  }
}
