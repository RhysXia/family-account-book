import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ServiceModule } from '../service/ServiceModule';
import { TagDataLoader } from './dataloader/TagDataLoader';
import { AccountBookResolver } from './resolver/AccountBookResolver';
import { SavingAccountResolver } from './resolver/SavingAccountResolver';
import { UserResolver } from './resolver/UserResolver';
import { UserDataLoader } from './dataloader/UserDataLoader';
import { SavingAccountAmountDataLoader } from './dataloader/SavingAccountAmountDataLoader';
import { AccountBookDataLoader } from './dataloader/AccountBookDataLoader';
import { QueryComplexityPlugin } from './plugins/QueryComplexityPlugin';
import { TagResolver } from './resolver/TagResolver';
import { FlowRecordResolver } from './resolver/FlowRecordResolver';
import { SavingAccountDataLoader } from './dataloader/SavingAccountDataLoader';
import { FlowRecordDataLoader } from './dataloader/FlowRecordDataLoader';
import { DateTimeScalar } from './scalar/DateTimeScalar';
import { DateScalar } from './scalar/DateScalar';
import { SavingAccountTransferRecordResolver } from './resolver/SavingAccountTransferRecordResolver';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      inject: [ConfigService],
      driver: ApolloDriver,
      async useFactory(configService: ConfigService) {
        const isPlayground =
          configService.getOrThrow<string>('GRAPHQL_PLAYGROUND') === 'true';

        return {
          typePaths: ['./**/*.graphql'],
          playground: isPlayground,
          definitions: {
            path: join(process.cwd(), 'src/graphql/graphql.ts'),
            customScalarTypeMapping: {
              DateTime: 'Date',
              Date: 'Date',
            },
          },
          csrfPrevention: true,
          cache: 'bounded',
          plugins: [new QueryComplexityPlugin(50)],
        };
      },
    }),
    ServiceModule,
  ],
  providers: [
    DateTimeScalar,
    DateScalar,
    TagDataLoader,
    UserDataLoader,
    SavingAccountAmountDataLoader,
    AccountBookDataLoader,
    SavingAccountDataLoader,
    FlowRecordDataLoader,
    UserResolver,
    AccountBookResolver,
    SavingAccountResolver,
    TagResolver,
    FlowRecordResolver,
    SavingAccountTransferRecordResolver,
  ],
})
export class GraphqlModule {}
