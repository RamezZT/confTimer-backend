import { Timer } from './timer/timer.gateway';

// This is a dummy DB until i create one
export const rooms = new Map<string, Map<string, Timer>>();
