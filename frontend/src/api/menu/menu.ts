import request from '../axios.config';
import type {
  MenuItem,
  MenuItemRequest,
  PatchedMenuItemRequest,
  MenuListParams,
  CategoryDetail,
} from './menu.types';

export async function getMenuItems(params?: MenuListParams): Promise<MenuItem[]> {
  return await request.get<MenuItem[]>('/api/menu/', { params });
}

export async function getMenuItem(id: number): Promise<MenuItem> {
  return await request.get<MenuItem>(`/api/menu/${id}/`);
}

export async function createMenuItem(itemData: MenuItemRequest): Promise<MenuItem> {
  return await request.post<MenuItem>('/api/menu/', itemData);
}

export async function updateMenuItem(id: number, itemData: MenuItemRequest): Promise<MenuItem> {
  return await request.put<MenuItem>(`/api/menu/${id}/`, itemData);
}

export async function partialUpdateMenuItem(
  id: number,
  itemData: PatchedMenuItemRequest
): Promise<MenuItem> {
  return await request.patch<MenuItem>(`/api/menu/${id}/`, itemData);
}

export async function deleteMenuItem(id: number): Promise<void> {
  await request.delete(`/api/menu/${id}/`);
}

export async function getCategories(): Promise<CategoryDetail[]> {
  return await request.get<CategoryDetail[]>('/api/categories/');
}

export async function getCategory(id: number): Promise<CategoryDetail> {
  return await request.get<CategoryDetail>(`/api/categories/${id}/`);
}

export async function createCategory(categoryData: Partial<CategoryDetail>): Promise<CategoryDetail> {
  return await request.post<CategoryDetail>('/api/categories/', categoryData);
}

export async function updateCategory(id: number, categoryData: Partial<CategoryDetail>): Promise<CategoryDetail> {
  return await request.put<CategoryDetail>(`/api/categories/${id}/`, categoryData);
}

export async function deleteCategory(id: number): Promise<void> {
  await request.delete(`/api/categories/${id}/`);
}

export * from './menu.types';
