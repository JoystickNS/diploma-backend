import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { IAppRequest } from "../interfaces/app-request";
import { AuthService } from "./auth.service";
import { WithoutAuthKey } from "./decorators/without-auth-key.decorator";
import { LoginDto } from "./dto/login.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@WithoutAuthKey()
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("registration")
  async registration(
    @Req() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.authService.registration(req, res, createUserDto);
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto
  ) {
    return this.authService.login(req, res, loginDto);
  }

  @Get("me")
  async me(@Req() req: IAppRequest) {
    return this.authService.me(req.cookies["refreshToken"]);
  }

  @Put("refresh")
  async refresh(
    @Req() req: IAppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refresh(req, res);
  }

  @Delete("logout")
  async logout(
    @Req() req: IAppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res);
  }
}
