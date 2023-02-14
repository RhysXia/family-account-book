import {
  ApolloCache,
  ApolloError,
  DefaultContext,
  DocumentNode,
  FetchResult,
  LazyQueryHookOptions,
  MutationFunctionOptions,
  MutationHookOptions,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useLazyQuery,
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

export const useAppLazyQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: LazyQueryHookOptions<TData, TVariables> & {
    disableMessage?: boolean;
  },
) => {
  const { disableMessage, ...otherOptions } = options || {};

  const [handler, ...others] = useLazyQuery(query, otherOptions);

  const newHandler = useMemo<
    (
      options?: Partial<LazyQueryHookOptions<TData, TVariables>> & {
        disableMessage?: boolean;
      },
    ) => Promise<QueryResult<TData, TVariables>>
  >(() => {
    return async (params) => {
      const actualDisableMessage =
        params?.disableMessage === undefined
          ? disableMessage
          : params?.disableMessage;

      try {
        const data = await handler(params);
        return data;
      } catch (err) {
        if (!actualDisableMessage) {
          message.error((err as ApolloError).message);
        }
        throw err;
      }
    };
  }, [handler, disableMessage]);
  return [newHandler, ...others] as const;
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

  const newHandler = useMemo<
    (
      options?: MutationFunctionOptions<TData, TVariables, TContext, TCache> & {
        disableMessage?: boolean;
      },
    ) => Promise<FetchResult<TData>>
  >(() => {
    return async (params) => {
      const actualDisableMessage =
        params?.disableMessage === undefined
          ? disableMessage
          : params?.disableMessage;

      try {
        const data = await handler(params);
        return data;
      } catch (err) {
        if (!actualDisableMessage) {
          message.error((err as ApolloError).message);
        }
        throw err;
      }
    };
  }, [handler, disableMessage]);

  return [newHandler, ...others] as const;
};
