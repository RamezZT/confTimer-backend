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
import { Logger } from '@nestjs/common';
type StartTimerBody = {
  timer: Timer;
  roomId: string;
};

type StopTimerBody = StartTimerBody;

export enum SOCKET_EVEMTS {
  TIMERS = 'timers',
  REFRESH_TIMERS = 'refresh_timers',
  CREATE_TIMER = 'create_timer',
  GET_TIMERS = 'get_timers',
  START_TIMER = 'start_timer',
  TIMER_UPDATE = 'timer_update',
  STOP_TIMER = 'stop_timer',
  RESUME_TIMER = 'resume_timer',
}

@WebSocketGateway()
export class TimerGateway {
  private readonly logger = new Logger(TimerGateway.name);
  constructor(
    private readonly idService: IdService,
    private readonly timerService: TimerService,
  ) {}
  @WebSocketServer() server: Server;

  // create a new timer and return all the timers
  @SubscribeMessage(SOCKET_EVEMTS.CREATE_TIMER)
  async createTimer(@MessageBody() data: { roomId: string }) {
    this.logger.warn(`${SOCKET_EVEMTS.CREATE_TIMER} event triggered`);
    await this.timerService.createTimer(data.roomId);
    const timers = await this.timerService.getRoomTimers(data.roomId);

    // This is a must so we give the client new fresh timers
    this.server.emit(SOCKET_EVEMTS.REFRESH_TIMERS, timers);
    return timers;
  }

  @SubscribeMessage(SOCKET_EVEMTS.GET_TIMERS)
  async getTimers(@MessageBody() data: { roomId: string }) {
    console.log('called ', SOCKET_EVEMTS.GET_TIMERS);
    console.log(data.roomId);
    const timers = await this.timerService.getRoomTimers(data.roomId);
    console.log(timers);
    return timers;
  }

  // Store timers by their ID

  // Start the timer
  @SubscribeMessage(SOCKET_EVEMTS.START_TIMER)
  async startTimer(
    @MessageBody() data: StartTimerBody,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.logger.warn(`${SOCKET_EVEMTS.START_TIMER} event triggered`);
    console.log(data);
    const {
      timer: { timerId },
      roomId,
    } = data;

    // we should fix this later so we don't have to rejoin the same room over and over
    await socket.join(roomId);
    const timer = await this.timerService.getTimer(timerId);
    // Check if the timer already exists and is running
    if (timer?.running) {
      this.logger.warn('Timer already running!, nothing to start');
      return; // Timer is already running, do not restart
    }

    // Initialize the timer state
    await this.timerService.editTimer(timerId, {
      running: true,
      kickoff: Date.now(),
    });

    // Emit the updated timer state to all clients
    await this.emitTimerUpdate(timerId, roomId);
  }

  // Update the timer (send elapsed time and running status)
  private async emitTimerUpdate(timerId: string, roomId: string) {
    this.logger.warn(`${SOCKET_EVEMTS.TIMER_UPDATE} event triggered`);
    const timer = await this.timerService.getTimer(timerId);
    if (!timer) {
      this.logger.error('There is no timer with this ID: ', timerId);
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

    this.server.to(roomId).emit(SOCKET_EVEMTS.TIMER_UPDATE, timer);
  }

  // Stop the timer
  @SubscribeMessage(SOCKET_EVEMTS.STOP_TIMER)
  async stopTimer(@MessageBody() data: StopTimerBody) {
    this.logger.warn(`${SOCKET_EVEMTS.START_TIMER} event triggered!`);
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
  @SubscribeMessage(SOCKET_EVEMTS.RESUME_TIMER)
  async resumeTimer(@MessageBody() data: StartTimerBody) {
    const {
      timer: { timerId },
      roomId,
    } = data;
    this.logger.warn(`${SOCKET_EVEMTS.RESUME_TIMER} event triggered!`);
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
