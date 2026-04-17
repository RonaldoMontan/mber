export interface DashboardStats {
  total_menu_items: number;
  active_menu_items: number;
  inactive_menu_items: number;
  total_categories: number;
  active_categories: number;
  items_with_lunch_box: number;
  items_with_daily_plate: number;
  categories_stats: CategoryStats[];
}

export interface CategoryStats {
  name: string;
  code: string;
  items_count: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_group: GroupStats[];
}

export interface GroupStats {
  group: string;
  count: number;
}
