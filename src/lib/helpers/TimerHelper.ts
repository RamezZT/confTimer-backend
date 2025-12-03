import {
  HUNDREDTHS_IN_SECOND,
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
} from 'src/constants/time.constants';

export class TimerHelper {
  public static formatTime = (elapsedMs: number): string => {
    const totalMs = Math.max(0, elapsedMs);

    const hours = Math.floor(totalMs / MILLISECONDS_IN_HOUR);

    const minutes = Math.floor(
      (totalMs % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE,
    );

    const seconds = Math.floor(
      (totalMs % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND,
    );

    const hundredths = Math.floor(
      (totalMs % MILLISECONDS_IN_SECOND) /
        (MILLISECONDS_IN_SECOND / HUNDREDTHS_IN_SECOND),
    );

    const pad = (value: number, length = 2) =>
      String(value).padStart(length, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  };
}
