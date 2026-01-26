import type { IUser } from "./user.model";

// export interface IAuthLoginDto {
//   email: string;
//   password: string;
// }

export interface IAuthForm {
  email: string;
  passwordHash: string;
  name?: string;
  confirmPassword?: string
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
