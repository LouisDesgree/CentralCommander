export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}
