import { Role } from "../../@types/role";

export type UserImage = {
  imageUrl: string;
  width: number;
  height: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  preferences: string[];
  images: UserImage[];
  role: Role;
  dateOfCreation: Date;
};

export type UserAuthRequest = {
  email: string;
  password: string;
};

export type UserRegisterRequest = {
  email: string;
  password: string;
  username: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  preferences: string[];
  photos: { uri: string; width: number; height: number }[];
};

export type UserUpdateRequest = {
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  preferences?: string[];
  photos?: { uri: string; width: number; height: number }[];
};

export type UserProfile = {
  totalEquity: number;
  dailyProfit: number;
  totalTrades: number;
};
