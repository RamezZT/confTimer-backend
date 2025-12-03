import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

// Define the Timer Data type
interface TimerData {
  timerId: string;
  kickoff: number | null;
  lastStop: number | null;
  running: boolean;
  deadline: number;
  elapsedTime: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer() server: Server;

  // Store timers by their ID
  private timers: Record<string, TimerData> = {};

  @SubscribeMessage('createTimer')
  createTimer(@MessageBody() data: { timerId: string; length: number }) {
    // skip creating timers if already exists
    if (this.timers[data.timerId]) {
      return;
    }
    console.log('created timer');
    const timer: TimerData = {
      timerId: data.timerId,
      running: false,
      elapsedTime: 0,
      deadline: 1,
      kickoff: null,
      lastStop: null,
    };
    this.timers[data.timerId] = timer;
    // this.emitTimerUpdate(timer.timerId);
  }

  // Start the timer
  @SubscribeMessage('startTimer')
  startTimer(@MessageBody() data: { timerId: string }): void {
    const { timerId } = data;

    // Check if the timer already exists and is running
    if (this.timers[timerId]?.running) {
      return; // Timer is already running, do not restart
    }

    // Initialize the timer state
    this.timers[timerId] = {
      ...this.timers[timerId],
      running: true,
      kickoff: Date.now(),
    };

    // Emit the updated timer state to all clients
    // this.emitTimerUpdate(timerId);
  }

  // Stop the timer
  @SubscribeMessage('stopTimer')
  stopTimer(@MessageBody() data: { timerId: string }): void {
    const { timerId } = data;
    const timer = this.timers[timerId];

    if (!timer || !timer.running) {
      return; // Timer isn't running, nothing to stop
    }

    // Stop the timer and save the last stop time
    timer.running = false;
    timer.lastStop = Date.now();

    // Emit the updated timer state to all clients
    // this.emitTimerUpdate(timerId);
  }

  // Resume the timer
  @SubscribeMessage('resumeTimer')
  resumeTimer(@MessageBody() data: { timerId: string }): void {
    const { timerId } = data;
    const timer = this.timers[timerId];

    if (!timer || timer.running) {
      return; // Timer isn't stopped, nothing to resume
    }

    // Calculate elapsed time since last stop
    const timeSinceLastStop = Date.now() - (timer.lastStop || Date.now());
    timer.kickoff! += timeSinceLastStop; // Adjust kickoff by the elapsed time

    // Resume the timer
    timer.running = true;
    timer.lastStop = null; // Reset last stop time

    // Emit the updated timer state to all clients
    // this.emitTimerUpdate(timerId);
  }

  // // Update the timer (send elapsed time and running status)
  // private emitTimerUpdate(timerId: string): void {
  //   const timer = this.timers[timerId];
  //   if (!timer) {
  //     return; // Timer doesn't exist
  //   }

  //   // Calculate elapsed time based on the current time and kickoff
  //   if (timer.running) {
  //     timer.elapsedTime = Date.now() - timer.kickoff!;
  //   } else if (timer.lastStop) {
  //     timer.elapsedTime = timer.lastStop - timer.kickoff!;
  //   }

  //   // Emit timer updates to all connected clients
  //   console.log('#timerUpdate');
  //   this.server.emit('timerUpdate', timer);
  // }

  // Reset the timer (optional, for clearing the timer state)
  @SubscribeMessage('resetTimer')
  resetTimer(@MessageBody() data: { timerId: string }): void {
    const { timerId } = data;
    delete this.timers[timerId]; // Remove the timer state
  }
}
