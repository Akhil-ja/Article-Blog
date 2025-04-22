export interface UserData {
  name?: string;
  email: string;
  password?: string;
  [key: string]: any;
}

export interface AuthState {
  user: any;
  loading: boolean;
  error: any;
  success: string | null;
}
