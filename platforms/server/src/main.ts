import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { TypeormStore } from 'connect-typeorm/out';
import { DataSource } from 'typeorm';
import { SessionEntity } from './entity/SessionEntity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);

  const sessionSecret = configService.getOrThrow('SESSION_SECRET');

  const dataSource = app.get(DataSource);

  const sessionRepository = dataSource.getRepository(SessionEntity);

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 2,
        ttl: 60 * 60 * 24 * 7,
      }).connect(sessionRepository),
    }),
  );

  await app.listen(3000);
}
bootstrap();
