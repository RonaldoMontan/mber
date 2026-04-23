import request from '../axios.config';
import type {
  BulkUpsertSchedulesPayload,
  MenuItemSchedule,
  ScheduleListParams,
} from './schedule.types';

export async function getSchedules(params?: ScheduleListParams): Promise<MenuItemSchedule[]> {
  return await request.get<MenuItemSchedule[]>('/api/schedules/', { params });
}

export async function getTodaySchedule(): Promise<MenuItemSchedule> {
  return await request.get<MenuItemSchedule>('/api/schedules/today/');
}

export async function bulkUpsertSchedules(payload: BulkUpsertSchedulesPayload): Promise<{ schedules: MenuItemSchedule[] }> {
  return await request.post<{ schedules: MenuItemSchedule[] }>('/api/schedules/bulk_upsert/', payload);
}

export * from './schedule.types';
