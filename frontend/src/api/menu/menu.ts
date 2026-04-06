import request from '../axios.config';
import type {
  MenuItem,
  MenuItemRequest,
  PatchedMenuItemRequest,
  MenuListParams,
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

export * from './menu.types';
