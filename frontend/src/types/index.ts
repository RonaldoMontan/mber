export interface Dish {
  id: number;
  name: string;
  description: string;
  price: string;
  dishDay: boolean;
  available: boolean;
}

export interface DishesResponse {
  results?: Dish[];
}
