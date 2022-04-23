import { JwtPayload } from "../classes/jwt-payload";

export interface IAppRequest extends Request {
  user: JwtPayload;
  cookies: Record<Cookies, string>;
}

type Cookies = "refreshToken";
