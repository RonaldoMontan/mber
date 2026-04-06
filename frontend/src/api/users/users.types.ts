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

export interface UserRequest {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  is_active?: boolean;
}

export interface PatchedUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export enum UserGroup {
  Manager = 'Manager',
  Editor = 'Editor',
  Viewer = 'Viewer',
}

export interface AssignGroupRequest {
  group_name: UserGroup;
}

export interface AssignGroupResponse {
  message: string;
  user: User;
}
