import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, ScheduleStatus } from './entities/schedule.entity';
import { CareUnitAdminService } from '../care-units/services/care-unit-admin.service';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly careUnitAdminService: CareUnitAdminService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async onModuleInit() {
    console.log('🚀🚀🚀 ScheduleService onModuleInit 호출됨');
    console.log('현재 시간:', new Date().toISOString());
    console.log('5초 후에 데이터 초기화 실행 예정');

    setTimeout(async () => {
      console.log('⏰ 타이머 실행됨 -', new Date().toISOString());
      try {
        // 1. 의료기관 데이터 저장
        console.log('1️⃣ 의료기관 데이터 저장 시작');
        const careUnitResult =
          await this.careUnitAdminService.saveAllCareUnits();
        console.log('✅ 의료기관 데이터 저장 완료:', careUnitResult);

        // 2. 5초 대기 후 진료과목 데이터 저장
        console.log('⏳ 5초 대기 후 진료과목 데이터 저장 시작');
        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log('2️⃣ 진료과목 데이터 저장 시작');
        const departmentResult =
          await this.departmentsService.saveHospitalDepartments();
        console.log('✅ 진료과목 데이터 저장 완료:', departmentResult);

        // 3. 스케줄 저장
        await this.scheduleRepository.save({
          scheduleName: 'INITIAL_DATA_LOAD',
          status: ScheduleStatus.COMPLETED,
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
          metadata: {
            careUnits: careUnitResult,
            departments: departmentResult,
          },
        });

        console.log('🎉 모든 초기 데이터 저장 완료');
      } catch (error) {
        const err = error as Error;
        console.error('❌ 초기 데이터 저장 실패:', err);
        await this.scheduleRepository.save({
          scheduleName: 'INITIAL_DATA_LOAD',
          status: ScheduleStatus.FAILED,
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
          errorMessage: err.message,
          metadata: {
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack,
            },
          },
        });
      }
    }, 5000); // 서버 시작 후 5초 후에 실행
  }

  async initializeData() {
    console.log('🚀 ScheduleService initialData 시작');
    try {
      // 1. 의료기관 데이터 저장
      console.log('1️⃣ 의료기관 데이터 저장 시작');
      const careUnitResult = await this.careUnitAdminService.saveAllCareUnits();
      console.log('✅ 의료기관 데이터 저장 완료:', careUnitResult);

      // 2. 5초 대기 후 진료과목 데이터 저장
      console.log('⏳ 5초 대기 후 진료과목 데이터 저장 시작');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log('2️⃣ 진료과목 데이터 저장 시작');
      const departmentResult =
        await this.departmentsService.saveHospitalDepartments();
      console.log('✅ 진료과목 데이터 저장 완료:', departmentResult);

      // 3. 스케줄 저장
      await this.scheduleRepository.save({
        scheduleName: 'INITIAL_DATA_LOAD',
        status: ScheduleStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
        metadata: {
          careUnits: careUnitResult,
          departments: departmentResult,
        },
      });

      console.log('🎉 모든 초기 데이터 저장 완료');
      return {
        status: 'success',
        message: '초기 데이터 저장 완료',
      };
    } catch (error) {
      const err = error as Error;
      console.error('❌ 초기 데이터 저장 실패:', err);
      await this.scheduleRepository.save({
        scheduleName: 'INITIAL_DATA_LOAD',
        status: ScheduleStatus.FAILED,
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
        errorMessage: err.message,
        metadata: {
          error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
        },
      });
      return {
        status: 'error',
        message: '초기 데이터 저장 실패',
        error: err.message,
      };
    }
  }

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
