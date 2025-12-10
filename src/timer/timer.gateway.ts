import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IdService } from 'src/id/id.service';
import { TimerHelper } from 'src/lib/helpers/TimerHelper';
export interface Timer {
  timerId: string;
  kickoff: number | null;
  lastStop?: number | null;
  running: boolean;
  deadline?: number | null;
  elapsedTime: number;
}
import { Socket } from 'socket.io';
import { TimerService } from './timer.service';
interface StartTimerBody {
  timer: Timer;
  roomId: string;
}

@WebSocketGateway()
export class TimerGateway {
  constructor(
    private readonly idService: IdService,
    private readonly timerService: TimerService,
  ) {}
  @WebSocketServer() server: Server;

  // Store timers by their ID

  // Start the timer
  @SubscribeMessage('startTimer')
  async startTimer(
    @MessageBody() data: StartTimerBody,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    console.log('#timerStart');
    const {
      timer: { timerId },
      roomId,
    } = data;
    await socket.join(roomId);
    console.log('we her');
    const timer = await this.timerService.getTimer(timerId);
    // Check if the timer already exists and is running
    if (timer?.running) {
      console.log('Timer already running!, nothing to start');
      return; // Timer is already running, do not restart
    }

    // Initialize the timer state
    await this.timerService.editTimer(timerId, {
      running: true,
      kickoff: Date.now(),
    });

    // Emit the updated timer state to all clients
    this.emitTimerUpdate(timerId, roomId);
  }

  // Update the timer (send elapsed time and running status)
  private async emitTimerUpdate(timerId: string, roomId: string) {
    console.log('#timerUpdate');
    const timer = await this.timerService.getTimer(timerId);
    if (!timer) {
      console.log('There is no timer with this ID: ', timerId);
      return; // Timer doesn't exist
    }

    // Calculate elapsed time based on the current time and kickoff
    if (timer.running) {
      timer.elapsedTime = Date.now() - timer.kickoff!;
    } else if (timer.lastStop) {
      timer.elapsedTime = timer.lastStop - timer.kickoff!;
    }

    console.log(`Time passed is ${TimerHelper.formatTime(timer.elapsedTime)}`);
    await this.timerService.editTimer(timerId, timer);
    // Emit timer updates to all connected clients

    this.server.to(roomId).emit('timerUpdate', timer);
  }

  // Stop the timer
  @SubscribeMessage('stopTimer')
  async stopTimer(@MessageBody() data: StartTimerBody) {
    console.log('#timerStop');
    const {
      timer: { timerId },
      roomId,
    } = data;
    const timer = await this.timerService.getTimer(timerId);

    if (!timer || !timer.running) {
      console.log("Timer isn't running, nothing to stop");
      return; // Timer isn't running, nothing to stop
    }

    // Stop the timer and save the last stop time
    timer.running = false;
    timer.lastStop = Date.now();
    timer.elapsedTime = this.calculateElapsedTime(timer);
    await this.timerService.editTimer(timerId, timer);
    // Emit the updated timer state to all clients
    await this.emitTimerUpdate(timerId, roomId);
  }

  // Resume the timer
  @SubscribeMessage('resumeTimer')
  async resumeTimer(@MessageBody() data: StartTimerBody) {
    const {
      timer: { timerId },
      roomId,
    } = data;
    const timer = await this.timerService.getTimer(timerId);
    console.log(timer);
    if (!timer || timer.running) {
      console.log("Timer isn't stopped, nohing to resume");
      return; // Timer isn't stopped, nothing to resume
    }

    // Calculate elapsed time since last stop
    const timeSinceLastStop = Date.now() - (timer.lastStop || Date.now());
    timer.kickoff! += timeSinceLastStop; // Adjust kickoff by the elapsed time

    // Resume the timer
    timer.running = true;
    timer.lastStop = null; // Reset last stop time

    await this.timerService.editTimer(timerId, timer);

    // Emit the updated timer state to all clients
    await this.emitTimerUpdate(timerId, roomId);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(roomName);
    await client.join(roomName);
    console.log(`${client.id} joined room: ${roomName}`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(roomName);
    console.log(`${client.id} left room: ${roomName}`);
  }

  // Reset the timer (optional, for clearing the timer state)
  @SubscribeMessage('resetTimer')
  resetTimer(@MessageBody() data: StartTimerBody): void {
    const {
      timer: { timerId },
    } = data;
    // fix this later
    // delete timers[timerId]; // Remove the timer state
  }

  calculateElapsedTime(timer: Timer) {
    const elapsedTime = Date.now() - timer.kickoff!;
    return elapsedTime;
  }
}
