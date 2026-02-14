import { Role } from "../../@types/role";

export type User = {
  id: string;
  email: string;
  username: string;
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
};

export type UserProfile = {
  totalEquity: number;
  dailyProfit: number;
  totalTrades: number;
};
