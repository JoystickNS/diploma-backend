import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: ["http://localhost:5000", "http://83.69.2.5:5000"],
  });
  app.use(json({ limit: "25mb" }));
  app.use(urlencoded({ extended: true, limit: "25mb" }));
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    })
  );
  await app.listen(configService.get("port"));
}
bootstrap();
