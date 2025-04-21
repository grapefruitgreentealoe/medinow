import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleLog, ScheduleStatus } from '../entities/schedule-log.entity';

@Injectable()
export class ScheduleLogService {
  constructor(
    @InjectRepository(ScheduleLog)
    private readonly scheduleLogRepository: Repository<ScheduleLog>,
  ) {}

  async createLog(scheduleName: string): Promise<ScheduleLog> {
    const log = this.scheduleLogRepository.create({
      scheduleName,
      status: ScheduleStatus.STARTED,
      startedAt: new Date(),
    });
    return this.scheduleLogRepository.save(log);
  }

  async completeLog(
    logId: string,
    metadata?: Record<string, any>,
  ): Promise<ScheduleLog> {
    const log = await this.scheduleLogRepository.findOne({
      where: { id: logId },
    });
    if (!log) {
      throw new Error('Schedule log not found');
    }

    log.status = ScheduleStatus.COMPLETED;
    log.completedAt = new Date();
    log.durationMs = log.completedAt.getTime() - log.startedAt.getTime();
    log.metadata = metadata;

    return this.scheduleLogRepository.save(log);
  }

  async failLog(
    logId: string,
    error: Error,
    metadata?: Record<string, any>,
  ): Promise<ScheduleLog> {
    const log = await this.scheduleLogRepository.findOne({
      where: { id: logId },
    });
    if (!log) {
      throw new Error('Schedule log not found');
    }

    log.status = ScheduleStatus.FAILED;
    log.completedAt = new Date();
    log.durationMs = log.completedAt.getTime() - log.startedAt.getTime();
    log.errorMessage = error.message;
    log.metadata = metadata;

    return this.scheduleLogRepository.save(log);
  }

  async getRecentLogs(
    scheduleName: string,
    limit: number = 10,
  ): Promise<ScheduleLog[]> {
    return this.scheduleLogRepository.find({
      where: { scheduleName },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
