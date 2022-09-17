import {
  ApolloCache,
  ApolloError,
  DefaultContext,
  DocumentNode,
  MutationHookOptions,
  OperationVariables,
  QueryHookOptions,
  TypedDocumentNode,
  useMutation,
  useQuery,
} from '@apollo/client';
import { message } from 'antd';
import { useEffect, useMemo } from 'react';

export { default as apolloClient } from './apolloClient';

export const useAppQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables> & { disableMessage?: boolean },
) => {
  const { disableMessage, ...otherOptions } = options || {};

  const data = useQuery(query, otherOptions);

  const error = data.error;

  useEffect(() => {
    if (!error || disableMessage) {
      return;
    }
    message.error(error.message);
  }, [error, disableMessage]);

  return data;
};

export const useAppMutation = <
  TData = any,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<any> = ApolloCache<any>,
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables, TContext> & {
    disableMessage?: boolean;
  },
) => {
  const { disableMessage, ...otherOptions } = options || {};

  const [handler, ...others] = useMutation<TData, TVariables, TContext, TCache>(
    mutation,
    otherOptions,
  );

  const newHandler = useMemo<typeof handler>(() => {
    return async (...params) => {
      try {
        const data = await handler(...params);
        return data;
      } catch (err) {
        if (!disableMessage) {
          message.error((err as ApolloError).message);
        }
        throw err;
      }
    };
  }, [handler, disableMessage]);

  return [newHandler, ...others] as const;
};
