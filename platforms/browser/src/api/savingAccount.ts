import { gql } from '@apollo/client';
import apolloClient from './apolloClient';

export type SimpleSavingAccount = {
  id: number;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavingAccountInput = {
  name: string;
  desc?: string;
  amount: number;
  accountBookId: number;
};

export const createSavingAccount = async (
  savingAccount: CreateSavingAccountInput,
) => {
  const { data, errors } = await apolloClient.mutate<{
    createSavingAccount: SimpleSavingAccount;
  }>({
    mutation: gql`
      mutation (
        $name: String!
        $desc: String!
        $amount: Float!
        $accountBookId: Int!
      ) {
        createSavings(
          savingAccount: {
            name: $name
            desc: $desc
            amount: $amount
            accountBookId: $accountBookId
          }
        ) {
          id
          name
          desc
          amount
        }
      }
    `,
    variables: savingAccount,
  });

  if (errors?.length) {
    throw errors[0];
  }
  return data!.createSavingAccount;
};

export const getAuthSavingAccountByAccountBookId = async (accountBookId: number) => {
  const { data, error } = await apolloClient.query<{
    getAuthSavingAccountById: Array<SimpleSavingAccount>;
  }>({
    query: gql`
      query ($accountBookId: Int!) {
        getAuthSavingAccountById(accountBookId: $accountBookId) {
          id
          name
          desc
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      accountBookId,
    },
  });

  if (error) {
    throw error;
  }
  return data!.getAuthSavingAccountById;
};
