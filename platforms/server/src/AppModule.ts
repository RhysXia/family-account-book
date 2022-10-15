import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ControllerModule } from './controller/ControllerModule';
import { GraphqlModule } from './graphql/GraphqlModule';
import { StaticServeModule } from './static/StaticServeModule';
import { isDevelopment } from './utils/env';

const envName = isDevelopment ? 'dev' : 'prod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${envName}.local`, `.env.${envName}`, '.env'],
    }),
    GraphqlModule,
    ControllerModule,
    StaticServeModule,
  ],
})
export class AppModule {}
