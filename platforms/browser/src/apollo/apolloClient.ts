import { ApolloClient, InMemoryCache } from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';

const link = new BatchHttpLink({
  uri: '/graphql',
  batchInterval: 20, // Wait no more than 20ms after first batched operation
});
const apolloClient = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache({}),
  link: link,
  defaultOptions: {
    watchQuery: {
      // cahce-first 对 refetchQueries 支持有问题
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
