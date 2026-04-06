export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
  is_active: boolean;
  date_joined: string;
}

export enum UserGroup {
  Manager = 'Manager',
  Editor = 'Editor',
  Viewer = 'Viewer',
}

export enum MenuCategory {
  MainDish = 'main_dish',
  Others = 'others',
}

export enum Weekday {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

export interface MenuItem {
  id: number;
  name: string;
  side_dish?: string;
  image?: string;
  category?: MenuCategory;
  lunch_box_price_small?: string;
  lunch_box_price_medium?: string;
  lunch_box_price_large?: string;
  daily_plate_price?: string;
  weekdays?: Weekday[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
