import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session'
import * as passport from 'passport'
import cookieParser from 'cookie-parser';

const cors = require("cors");
const session = require("express-session")

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:5173"
  });
  // app.use(cors({origin: true, credentials: true}));
  // app.use(session(
  //   {
  //     secret: process.env.JWT_SECRET, // don't use this secret in prod :)
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       secure: 'auto',
  //       httpOnly: true,
  //       maxAge: 30
  //     }
  //   })
  // );

  app.use(
    session({
      secret: 'keyboard',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
