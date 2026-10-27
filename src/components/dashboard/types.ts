export interface ResolvedUserRef {
  displayName: string;
  avatar: string;
}

export interface TempRoleRow {
  userId: string;
  roleId: string;
  expiresAt: string;
  addedBy: string;
  user: ResolvedUserRef | null;
  addedByUser: ResolvedUserRef | null;
  role: { id: string; name: string; color: number };
}

export interface LogRow {
  action: "add" | "remove" | "expire";
  userId: string;
  roleId: string;
  roleName: string;
  roleColor: number;
  by: string;
  at: string;
  user: ResolvedUserRef | null;
  byUser: ResolvedUserRef | null;
}

export interface ChannelOption {
  id: string;
  name: string;
}
