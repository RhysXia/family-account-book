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
import { SavingAccountTransferRecordDataLoader } from './dataloader/SavingAccountTransferRecordDataLoader';
import { ApolloError } from 'apollo-server-core';
import {
  AuthentizationException,
  BaseServiceException,
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import { NodeResolver } from './resolver/NodeResolver';
import { SavingAccountHistoryResolver } from './resolver/SavingAccountHistoryResolver';
import { AccountBookStatisticsResolver } from './resolver/AccountBookStatisticsResolver';
import { CategoryResolver } from './resolver/CategoryResolver';
import { CategoryDataLoader } from './dataloader/CategoryDataLoader';
import { isDevelopment } from '../utils/env';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      inject: [ConfigService],
      driver: ApolloDriver,
      async useFactory(configService: ConfigService) {
        const isPlayground =
          configService.get<string>('GRAPHQL_PLAYGROUND') === 'true';

        const isGraphqlDebug =
          configService.get<string>('GRAPHQL_DEBUG') === 'true';

        return {
          typePaths: ['./**/*.graphql'],
          playground: isPlayground,
          definitions: isDevelopment
            ? {
                path: join(process.cwd(), 'src/graphql/graphql.ts'),
                customScalarTypeMapping: {
                  DateTime: 'Date',
                  Date: 'Date',
                },
              }
            : undefined,
          debug: isGraphqlDebug,
          csrfPrevention: true,
          cache: 'bounded',
          formatError(err) {
            const { originalError } = err;
            let code: string | undefined;
            if (originalError instanceof ResourceNotFoundException) {
              code = 'RESOURCE_NOT_FOUND';
            } else if (originalError instanceof ParameterException) {
              code = 'PARAMETER_ERROR';
            } else if (originalError instanceof AuthentizationException) {
              code = 'AUTHENTICATION_ERROR';
            } else if (originalError instanceof BaseServiceException) {
              code = 'SERVICE_ERROR';
            }

            if (code) {
              return new ApolloError(err.message, code, err.extensions);
            }

            return err;
          },
          plugins: [new QueryComplexityPlugin(50)],
        };
      },
    }),
    ServiceModule,
  ],
  providers: [
    DateTimeScalar,
    DateScalar,
    CategoryDataLoader,
    TagDataLoader,
    UserDataLoader,
    SavingAccountAmountDataLoader,
    AccountBookDataLoader,
    SavingAccountDataLoader,
    FlowRecordDataLoader,
    SavingAccountTransferRecordDataLoader,
    UserResolver,
    AccountBookResolver,
    AccountBookStatisticsResolver,
    CategoryResolver,
    SavingAccountResolver,
    TagResolver,
    FlowRecordResolver,
    SavingAccountTransferRecordResolver,
    SavingAccountHistoryResolver,
    NodeResolver,
  ],
})
export class GraphqlModule {}
