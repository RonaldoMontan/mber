import type { MenuItem } from '../menu/menu.types';

export interface MenuItemSchedule {
  id?: number;
  date: string;
  item: MenuItem | null;
  is_open: boolean;
  daily_price?: string | null;
  note: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemScheduleRequest {
  date: string;
  item_id: number | null;
  is_open: boolean;
  daily_price?: string | null;
  note?: string;
}

export interface ScheduleListParams {
  start_date?: string;
  end_date?: string;
}

export interface BulkUpsertSchedulesPayload {
  schedules: MenuItemScheduleRequest[];
}
