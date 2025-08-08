export interface User {
  _id?: string;
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  password: string; // This will be hashed
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to convert User to UserPublic (remove password)
export function toUserPublic(user: User): UserPublic {
  const { password, _id, ...publicUser } = user;
  return publicUser;
}
