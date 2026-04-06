import request from '../axios.config';
import type {
  User,
  UserRequest,
  PatchedUserRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AssignGroupRequest,
  AssignGroupResponse,
} from './users.types';

export async function getUsers(): Promise<User[]> {
  return await request.get<User[]>('/api/users/');
}

export async function getUser(id: number): Promise<User> {
  return await request.get<User>(`/api/users/${id}/`);
}

export async function createUser(userData: UserRequest): Promise<User> {
  return await request.post<User>('/api/users/', userData);
}

export async function updateUser(id: number, userData: UserRequest): Promise<User> {
  return await request.put<User>(`/api/users/${id}/`, userData);
}

export async function partialUpdateUser(id: number, userData: PatchedUserRequest): Promise<User> {
  return await request.patch<User>(`/api/users/${id}/`, userData);
}

export async function deleteUser(id: number): Promise<void> {
  await request.delete(`/api/users/${id}/`);
}

export async function changePassword(
  id: number,
  passwords: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return await request.post<ChangePasswordResponse>(
    `/api/users/${id}/change_password/`,
    passwords
  );
}

export async function assignGroup(
  id: number,
  groupData: AssignGroupRequest
): Promise<AssignGroupResponse> {
  return await request.post<AssignGroupResponse>(
    `/api/users/${id}/assign_group/`,
    groupData
  );
}

export * from './users.types';
