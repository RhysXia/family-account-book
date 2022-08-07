import { gql } from '@apollo/client';
import { CreatedSavings, Savings } from '../types/savings';
import apolloClient from './apolloClient';

export const createSavings = async (savings: {
  name: string;
  desc: string;
  amount: number;
  accountBookId: number;
}) => {
  const { data, errors } = await apolloClient.mutate<{
    createSavings: CreatedSavings;
  }>({
    mutation: gql`
      mutation (
        $name: String!
        $desc: String!
        $amount: Float!
        $accountBookId: Int!
      ) {
        createSavings(
          savings: {
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
    variables: savings,
  });

  if (errors?.length) {
    throw errors[0];
  }
  return data!.createSavings;
};

export const getSavingsList = async (accountBookId: number) => {
  const { data, error } = await apolloClient.query<{
    getSavingsByAccountBookId: Array<Savings>;
  }>({
    query: gql`
      query ($accountBookId: Int!) {
        getSavingsByAccountBookId(accountBookId: $accountBookId) {
          id
          name
          desc
          amount
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
  return data!.getSavingsByAccountBookId;
};
