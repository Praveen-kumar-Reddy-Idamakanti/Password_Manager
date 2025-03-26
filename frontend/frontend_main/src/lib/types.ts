
export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface User {
  id: string;
  email: string;
  mfaCompleted: {
    password: boolean;
    biometrics: boolean;
    googleAuth: boolean;
  };
}
