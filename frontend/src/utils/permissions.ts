interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  groups: string[];
  is_active: boolean;
  date_joined?: string;
}

export const isManager = (user: User | null): boolean => {
  if (!user) return false;
  return user.groups.includes('Manager');
};

export const isEditor = (user: User | null): boolean => {
  if (!user) return false;
  return user.groups.includes('Editor') || user.groups.includes('Manager');
};

export const isViewer = (user: User | null): boolean => {
  if (!user) return false;
  return user.groups.includes('Viewer') || user.groups.includes('Editor') || user.groups.includes('Manager');
};

export const canDelete = (user: User | null): boolean => {
  return isManager(user);
};

export const canEdit = (user: User | null): boolean => {
  return isEditor(user);
};

export const canView = (user: User | null): boolean => {
  if (!user) return false;
  return user.is_active;
};

export const hasGroup = (user: User | null, groupName: string): boolean => {
  if (!user) return false;
  return user.groups.includes(groupName);
};

export const isOwnerOrManager = (user: User | null, ownerId: number): boolean => {
  if (!user) return false;
  return user.id === ownerId || isManager(user);
};
