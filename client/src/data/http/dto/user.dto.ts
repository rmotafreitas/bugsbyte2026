export type UserImageDTO = {
  imageUrl: string;
  width: number;
  height: number;
};

export type UserDTO = {
  id: string;
  email: string;
  username: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  preferences: string[];
  images: UserImageDTO[];
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
  name: string;
  gender: string;
  dateOfBirth: string;
  preferences: string[];
  photos: { uri: string; width: number; height: number }[];
};

export type UserUpdateRequestDTO = {
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  preferences?: string[];
  photos?: { uri: string; width: number; height: number }[];
};

export type UserProfileDTO = {
  totalEquity: number;
  dailyProfit: number;
  totalTrades: number;
};
