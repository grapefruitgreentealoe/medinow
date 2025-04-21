import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, ScheduleStatus } from './entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async createSchedule(scheduleName: string): Promise<Schedule> {
    const schedule = this.scheduleRepository.create({
      scheduleName,
      status: ScheduleStatus.STARTED,
      startedAt: new Date(),
    });
    return this.scheduleRepository.save(schedule);
  }

  async completeSchedule(
    scheduleId: string,
    metadata?: Record<string, any>,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.status = ScheduleStatus.COMPLETED;
    schedule.completedAt = new Date();
    schedule.durationMs =
      schedule.completedAt.getTime() - schedule.startedAt.getTime();
    schedule.metadata = metadata || {};

    return this.scheduleRepository.save(schedule);
  }

  async failSchedule(
    scheduleId: string,
    error: Error,
    metadata?: Record<string, any>,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.status = ScheduleStatus.FAILED;
    schedule.completedAt = new Date();
    schedule.durationMs =
      schedule.completedAt.getTime() - schedule.startedAt.getTime();
    schedule.errorMessage = error.message;
    schedule.metadata = metadata || {};

    return this.scheduleRepository.save(schedule);
  }

  async getRecentLogs(
    scheduleName: string,
    limit: number = 10,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { scheduleName },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
