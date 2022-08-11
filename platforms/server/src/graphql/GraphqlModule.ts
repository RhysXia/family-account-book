import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule, DateScalarMode } from '@nestjs/graphql';
import { join } from 'path';
import { ServiceModule } from '../service/ServiceModule';
import { TagDataLoader } from './dataloader/TagDataLoader';
import { AccountBookResolver } from './resolver/AccountBookResolver';
import { SavingAccountResolver } from './resolver/SavingAccountResolver';
import { UserResolver } from './resolver/UserResolver';
import { UserDataLoader } from './dataloader/UserDataLoader';
import { SavingAccountMoneyDataLoader } from './dataloader/SavingAccountAmountDataLoader';
import { AccountBookDataLoader } from './dataloader/AccountBookDataLoader';
import { QueryComplexityPlugin } from './plugins/QueryComplexityPlugin';
import { TagResolver } from './resolver/TagResolver';
import { FlowRecordResolver } from './resolver/FlowRecordResolver';
import { SavingAccountDataLoader } from './dataloader/SavingAccountDataLoader';
import { FlowRecordDataLoader } from './dataloader/FlowRecordDataLoader';
import { DateTimeScalar } from './scalar/DateTimeScalar';

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
    TagDataLoader,
    UserDataLoader,
    SavingAccountMoneyDataLoader,
    AccountBookDataLoader,
    SavingAccountDataLoader,
    FlowRecordDataLoader,
    UserResolver,
    AccountBookResolver,
    SavingAccountResolver,
    TagResolver,
    FlowRecordResolver,
  ],
})
export class GraphqlModule {}
