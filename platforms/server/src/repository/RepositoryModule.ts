import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { UserEntity } from '../entity/UserEntity';

const models = [UserEntity, AccountBookEntity];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const host = configService.getOrThrow<string>('DB_HOST');
        const port = +configService.getOrThrow<string>('DB_PORT');
        const username = configService.getOrThrow<string>('DB_USERNAME');
        const password = configService.getOrThrow<string>('DB_PASSWORD');
        const database = configService.getOrThrow<string>('DB_DATABASE');
        const synchronize =
          configService.getOrThrow<string>('DB_SYNCHRONIZE') === 'true';

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          synchronize,
          entities: models,
          entityPrefix: 'fab_',
        };
      },
    }),
    TypeOrmModule.forFeature(models),
  ],
})
export class RepositoryModule {}
