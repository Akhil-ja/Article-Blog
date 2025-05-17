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

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  preferences: string[];
  isVerified: boolean;
  createdAt?: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dob?: string;
}

export interface UserPreferences {
  preferences: string[];
}

export type FeedbackType = "like" | "dislike";

export interface Feedback {
  userId: string;
  articleId: string;
  type: FeedbackType;
  createdAt: string;
}

export interface UserState {
  profile: null | User;
  preferences: string[];
  categories: string[];
  activities: [];
  loading: boolean;
  error: null | any;
  success: null | string;
}
