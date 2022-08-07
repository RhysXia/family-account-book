import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ServiceModule } from '../service/ServiceModule';
import { TagDataLoader } from './dataloader/TagDataLoader';
import { AccountBookResolver } from './resolver/AccountBookResolver';
import { SavingsResolver } from './resolver/SavingsResolver';
import { UserResolver } from './resolver/UserResolver';
import { ApolloServerPluginInlineTrace } from 'apollo-server-core';
import { UserDataLoader } from './dataloader/UserDataLoader';

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
          cache: 'bounded',
          plugins: [ApolloServerPluginInlineTrace()],
        };
      },
    }),
    ServiceModule,
  ],
  providers: [
    TagDataLoader,
    UserDataLoader,
    UserResolver,
    AccountBookResolver,
    SavingsResolver,
  ],
})
export class GraphqlModule {}
