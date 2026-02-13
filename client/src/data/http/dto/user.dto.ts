export type UserDTO = {
  login: string;
  role: string;
  completeName: string;
  birthDate: string; // format: yyyy-MM-dd
  dateOfCreation: string; // format: yyyy-MM-dd
};

export type UserAuthRequestDTO = {
  login: string;
  password: string;
};

export type UserRegisterRequestDTO = {
  login: string;
  password: string;
  role: string;
  completeName: string;
  birthDate: string; // format: yyyy-MM-dd
};

export type UserProfileDTO = {};
