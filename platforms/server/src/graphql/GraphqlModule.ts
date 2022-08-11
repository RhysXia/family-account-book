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
import { SavingAccountMoneyDataLoader } from './dataloader/SavingAccountAmountDataLoader';
import { AccountBookDataLoader } from './dataloader/AccountBookDataLoader';
import { QueryComplexityPlugin } from './plugins/QueryComplexityPlugin';
import { TagResolver } from './resolver/TagResolver';

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
    TagDataLoader,
    UserDataLoader,
    SavingAccountMoneyDataLoader,
    AccountBookDataLoader,
    UserResolver,
    AccountBookResolver,
    SavingAccountResolver,
    TagResolver,
  ],
})
export class GraphqlModule {}
