import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { ExceptionMessages } from "../../constants/exception-messages";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "login",
    });
  }

  async validate(login: string, password: string) {
    const user = await this.authService.validateUser(login, password);
    console.log(login);
    console.log(password);

    if (!user) {
      throw new UnauthorizedException(ExceptionMessages.IncorrectLoginOrPass);
    }

    return user;
  }
}
