import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import {
  getComplexity,
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';

export class QueryComplexityPlugin implements ApolloServerPlugin {
  constructor(
    private readonly maximumComplexity: number,
    private readonly createError = (max, actual) =>
      new GraphQLError(
        `Query too complex. Value of ${actual} is over the maximum ${max}.`,
      ),
  ) {}

  async requestDidStart(
    requestContext: GraphQLRequestContext,
  ): Promise<GraphQLRequestListener> {
    return {
      didResolveOperation: async ({ request, document }) => {
        const complexity = getComplexity({
          schema: requestContext.schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity >= this.maximumComplexity) {
          throw await this.createError(this.maximumComplexity, complexity);
        }
      },
    };
  }
}
