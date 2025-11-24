export type CurrentUser = {
  id: number;
  roleId: number;
  roleName: string;
  email: string;
} | null;

let currentUser: CurrentUser = null;

export function setCurrentUser(user: {
  id: number;
  roleId: number;
  roleName: string;
  email: string;
}) {
  currentUser = { ...user };
}

export function clearCurrentUser() {
  currentUser = null;
}

export function getCurrentUser(): CurrentUser {
  return currentUser;
}

// 1 = Admin, 2 = Employé, 3 = Client (d'après ton seed)
export function isStaff(user: CurrentUser): boolean {
  return !!user && (user.roleId === 1 || user.roleId === 2);
}

export function isClient(user: CurrentUser): boolean {
  return !!user && user.roleId === 3;
}
