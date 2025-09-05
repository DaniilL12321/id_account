export interface AuthResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_refresh_in: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}
