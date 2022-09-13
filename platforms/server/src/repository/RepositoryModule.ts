import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import { SavingAccountAmountView } from '../entity/SavingAccountAmountView';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountTransferRecordEntity } from '../entity/SavingAccountTransferRecordEntity';
import { SessionEntity } from '../entity/SessionEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { isDevelopment } from '../utils/env';
import { CategoryEntity } from '../entity/CategoryEntity';

const models = [
  SessionEntity,
  UserEntity,
  AccountBookEntity,
  CategoryEntity,
  TagEntity,
  SavingAccountEntity,
  FlowRecordEntity,
  SavingAccountHistoryEntity,
  SavingAccountAmountView,
  SavingAccountTransferRecordEntity,
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
          logging: isDevelopment ? ['query'] : false,
          entityPrefix: 'fab_',
          cache: true,
        };
      },
    }),
    features,
  ],
  exports: [features],
})
export class RepositoryModule {}
