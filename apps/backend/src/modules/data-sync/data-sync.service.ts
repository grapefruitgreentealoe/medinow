import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CareUnit } from '../care-units/entities/care-unit.entity';
import { Department } from '../departments/entities/department.entity';
import { SyncLog } from './entities/sync-log.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { HospitalDataDto } from './dto/hospital-data.dto';
import { DepartmentDataDto } from './dto/department-data.dto';
import { firstValueFrom } from 'rxjs';
import { CareUnitCategory } from '../../../common/enums/careUnits.enum';

@Injectable()
export class DataSyncService {
  private readonly logger = new Logger(DataSyncService.name);

  constructor(
    private httpService: HttpService,
    @InjectRepository(CareUnit)
    private careUnitRepository: Repository<CareUnit>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(SyncLog)
    private syncLogRepository: Repository<SyncLog>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 매일 자정에 실행되는 스케줄링된 동기화 작업
   */
  @Cron('0 0 0 * * *')
  async scheduledSync() {
    this.logger.log('스케줄에 따른 데이터 동기화 작업 시작');
    
    // 이미 실행 중인지 확인 (Redis 기반 락)
    const lockKey = 'data_sync_lock';
    const lockExists = await this.cacheManager.get(lockKey);
    
    if (lockExists) {
      this.logger.log('다른 인스턴스에서 이미 동기화 중입니다');
      return;
    }
    
    // 락 설정 (10분)
    await this.cacheManager.set(lockKey, 'true', 600000);
    
    try {
      await this.syncHospitals();
      await this.syncDepartments();
      this.logger.log('데이터 동기화 작업 완료');
    } catch (error) {
      this.logger.error(`데이터 동기화 작업 실패: ${error.message}`);
    } finally {
      // 락 해제
      await this.cacheManager.del(lockKey);
    }
  }

  /**
   * 병원 데이터 동기화
   */
  async syncHospitals() {
    // 동기화 로그 생성
    const syncLog = this.syncLogRepository.create({
      syncType: 'hospital',
      startedAt: new Date(),
      isSuccess: false,
    });
    await this.syncLogRepository.save(syncLog);

    try {
      // 1. 공공 API에서 병원 데이터 가져오기
      const hospitalData = await this.fetchHospitalData();
      syncLog.processedItems = hospitalData.length;
      
      // 2. 데이터 처리
      const result = await this.processHospitalData(hospitalData);
      syncLog.addedItems = result.added;
      syncLog.updatedItems = result.updated;
      syncLog.isSuccess = true;
      
      // 3. 캐시 갱신
      await this.cacheManager.del('all_hospitals');
      
      this.logger.log(`병원 데이터 동기화 완료: ${result.added}개 추가, ${result.updated}개 업데이트`);
    } catch (error) {
      syncLog.errorMessage = error.message;
      this.logger.error(`병원 데이터 동기화 실패: ${error.message}`);
      throw error;
    } finally {
      syncLog.completedAt = new Date();
      await this.syncLogRepository.save(syncLog);
    }
  }

  /**
   * 부서 데이터 동기화
   */
  async syncDepartments() {
    // 동기화 로그 생성
    const syncLog = this.syncLogRepository.create({
      syncType: 'department',
      startedAt: new Date(),
      isSuccess: false,
    });
    await this.syncLogRepository.save(syncLog);

    try {
      // 1. 공공 API에서 부서 데이터 가져오기
      const departmentData = await this.fetchDepartmentData();
      syncLog.processedItems = departmentData.length;
      
      // 2. 데이터 처리
      const result = await this.processDepartmentData(departmentData);
      syncLog.addedItems = result.added;
      syncLog.updatedItems = result.updated;
      syncLog.isSuccess = true;
      
      this.logger.log(`부서 데이터 동기화 완료: ${result.added}개 추가, ${result.updated}개 업데이트`);
    } catch (error) {
      syncLog.errorMessage = error.message;
      this.logger.error(`부서 데이터 동기화 실패: ${error.message}`);
      throw error;
    } finally {
      syncLog.completedAt = new Date();
      await this.syncLogRepository.save(syncLog);
    }
  }

  /**
   * 병원 데이터 가져오기
   */
  private async fetchHospitalData(): Promise<HospitalDataDto[]> {
    try {
      // TODO: 실제 공공데이터 API 호출로 대체
      // 예시: const response = await firstValueFrom(this.httpService.get('API_URL', { params }));
      
      // 테스트용 더미 데이터
      const dummyData: HospitalDataDto[] = [
        {
          externalId: 'H001',
          name: '서울대학교병원',
          address: '서울특별시 종로구 대학로 101',
          telephone: '02-2072-2114',
          typeCode: '01',
          typeName: '종합병원',
          latitude: 37.579617,
          longitude: 126.998869
        },
        {
          externalId: 'H002',
          name: '서울아산병원',
          address: '서울특별시 송파구 올림픽로 43길 88',
          telephone: '1688-7575',
          typeCode: '01',
          typeName: '종합병원',
          latitude: 37.527126,
          longitude: 127.108673
        }
      ];
      
      return dummyData;
    } catch (error) {
      this.logger.error(`병원 데이터 조회 실패: ${error.message}`);
      throw new Error(`병원 데이터 조회 실패: ${error.message}`);
    }
  }

  /**
   * 부서 데이터 가져오기
   */
  private async fetchDepartmentData(): Promise<DepartmentDataDto[]> {
    try {
      // TODO: 실제 공공데이터 API 호출로 대체
      
      // 테스트용 더미 데이터
      const dummyData: DepartmentDataDto[] = [
        {
          externalId: 'D001',
          hospitalExternalId: 'H001',
          name: '내과',
          code: 'IM',
          category: '진료'
        },
        {
          externalId: 'D002',
          hospitalExternalId: 'H001',
          name: '외과',
          code: 'GS',
          category: '진료'
        },
        {
          externalId: 'D003',
          hospitalExternalId: 'H002',
          name: '정형외과',
          code: 'OS',
          category: '진료'
        }
      ];
      
      return dummyData;
    } catch (error) {
      this.logger.error(`부서 데이터 조회 실패: ${error.message}`);
      throw new Error(`부서 데이터 조회 실패: ${error.message}`);
    }
  }

  /**
   * 병원 데이터 처리
   */
  private async processHospitalData(
    hospitals: HospitalDataDto[],
  ): Promise<{ added: number; updated: number }> {
    let added = 0;
    let updated = 0;

    // 트랜잭션으로 처리
    await this.dataSource.transaction(async (manager) => {
      // 기존 병원 데이터 조회
      const existingHospitals = await manager.find(CareUnit, {
        select: ['id', 'hpId', 'name', 'address', 'tel', 'lat', 'lng'],
      });
      
      const hospitalMap = new Map(
        existingHospitals.map(h => [h.hpId, h])
      );
      
      // 병원 데이터 처리
      for (const hospital of hospitals) {
        if (hospitalMap.has(hospital.externalId)) {
          // 기존 병원 업데이트 (변경사항 있는 경우만)
          const existing = hospitalMap.get(hospital.externalId);
          if (this.isHospitalChanged(existing, hospital)) {
            await manager.update(CareUnit, existing.id, {
              name: hospital.name,
              address: hospital.address,
              tel: hospital.telephone,
              lat: hospital.latitude,
              lng: hospital.longitude,
              updatedAt: new Date()
            });
            updated++;
          }
        } else {
          // 새 병원 추가
          await manager.insert(CareUnit, {
            hpId: hospital.externalId,
            name: hospital.name,
            address: hospital.address,
            tel: hospital.telephone,
            category: this.mapHospitalTypeToCategory(hospital.typeCode),
            lat: hospital.latitude,
            lng: hospital.longitude,
          });
          added++;
        }
      }
    });

    return { added, updated };
  }

  /**
   * 병원 타입 코드를 카테고리로 변환
   */
  private mapHospitalTypeToCategory(typeCode: string): string {
    // 실제 매핑 로직 구현
    // 예시: 01=종합병원, 02=병원, 03=의원 등
    const categoryMap = {
      '01': CareUnitCategory.GENERAL_HOSPITAL,
      '02': CareUnitCategory.HOSPITAL,
      '03': CareUnitCategory.CLINIC,
      // 추가 매핑
    };
    
    return categoryMap[typeCode] || CareUnitCategory.CLINIC;
  }

  /**
   * 병원 데이터 변경 여부 확인
   */
  private isHospitalChanged(existing: CareUnit, newData: HospitalDataDto): boolean {
    return (
      existing.name !== newData.name ||
      existing.address !== newData.address ||
      existing.tel !== newData.telephone ||
      existing.lat !== newData.latitude ||
      existing.lng !== newData.longitude
    );
  }

  /**
   * 부서 데이터 처리
   */
  private async processDepartmentData(
    departments: DepartmentDataDto[],
  ): Promise<{ added: number; updated: number }> {
    let added = 0;
    let updated = 0;

    // 트랜잭션으로 처리
    await this.dataSource.transaction(async (manager) => {
      // 병원 ID 매핑 (hpId -> id)
      const careUnits = await manager.find(CareUnit, {
        select: ['id', 'hpId'],
      });
      
      const careUnitMap = new Map(
        careUnits.map(unit => [unit.hpId, unit.id])
      );
      
      // 기존 부서 조회
      const existingDepartments = await manager.find(Department, {
        relations: ['careUnit'],
      });
      
      // 부서의 externalId를 저장할 필드가 없으므로 "병원ID:부서명" 조합으로 식별
      const departmentMap = new Map(
        existingDepartments.map(dept => 
          [`${dept.careUnit.hpId}:${dept.name}`, dept]
        )
      );
      
      // 부서 데이터 처리
      for (const department of departments) {
        const careUnitId = careUnitMap.get(department.hospitalExternalId);
        
        // 관련 병원이 없으면 건너뛰기
        if (!careUnitId) {
          this.logger.warn(
            `병원 ID를 찾을 수 없음: ${department.hospitalExternalId}, 부서: ${department.name}`
          );
          continue;
        }
        
        const key = `${department.hospitalExternalId}:${department.name}`;
        
        if (departmentMap.has(key)) {
          // 기존 부서 업데이트 (실제로는 변경할 사항이 적을 수 있음)
          const existing = departmentMap.get(key);
          // 필요한 경우 부서 업데이트 로직 추가
          updated++;
        } else {
          // 새 부서 추가
          await manager.insert(Department, {
            name: department.name,
            careUnitId: careUnitId,
          });
          added++;
        }
      }
    });

    return { added, updated };
  }

  /**
   * 동기화 로그 조회
   */
  async getSyncLogs(limit: number = 10) {
    return this.syncLogRepository.find({
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }
}
