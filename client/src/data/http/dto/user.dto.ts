export type UserDTO = {
  id: string;
  email: string;
  username: string;
  role: string;
  dateOfCreation: string; // format: yyyy-MM-dd
};

export type UserAuthRequestDTO = {
  email: string;
  password: string;
};

export type UserRegisterRequestDTO = {
  email: string;
  password: string;
  username: string;
};

export type UserProfileDTO = {
  totalEquity: number;
  dailyProfit: number;
  totalTrades: number;
};
