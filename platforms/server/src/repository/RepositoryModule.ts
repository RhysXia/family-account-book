import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { RecordEntity } from '../entity/RecordEntity';
import { SavingsEntity } from '../entity/SavingsEntity';
import { SessionEntity } from '../entity/SessionEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';

const models = [
  SessionEntity,
  UserEntity,
  AccountBookEntity,
  TagEntity,
  SavingsEntity,
  RecordEntity,
];

const features = TypeOrmModule.forFeature(models);

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
          // logging: isDevelopment ? ['query'] : false,
          entityPrefix: 'fab_',
        };
      },
    }),
    features,
  ],
  exports: [features],
})
export class RepositoryModule {}
