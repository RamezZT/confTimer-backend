import { Injectable, NotFoundException } from '@nestjs/common';
import { rooms } from 'src/store';
import { Timer } from './timer.gateway';
import { IdService } from 'src/id/id.service';

@Injectable()
export class TimerService {
  constructor(private readonly idService: IdService) {}
  public createTimer(roomId: string) {
    // check if the room exists
    if (!rooms.has(roomId)) {
      throw new NotFoundException(`Unable to find room with id ${roomId}`);
    }
    const newTimer: Timer = {
      running: false,
      timerId: this.idService.generateRandomAlphanumericId(),
      elapsedTime: 0,
      kickoff: null,
      deadline: null,
      lastStop: null,
    };

    rooms.get(roomId)!.set(newTimer.timerId, newTimer);
    console.log(rooms);
    return newTimer;
  }

  public getAllTimers(roomId: string) {
    console.log(rooms.get(roomId));
    return Array.from(rooms.get(roomId)!.values());
  }
}
