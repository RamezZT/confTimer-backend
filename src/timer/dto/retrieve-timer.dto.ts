import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RetrieveTimerDto {
  @IsString()
  timerId: string;

  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : null))
  kickoff: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  lastStop?: number | null;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  running: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  deadline?: number | null;

  @IsNumber()
  @Transform(({ value }) => Number(value) || 0)
  elapsedTime: number;
}
