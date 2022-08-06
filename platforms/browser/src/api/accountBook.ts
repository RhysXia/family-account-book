import { gql } from '@apollo/client';
import { AccountBook, CreatedAccountBook } from '../types/accountBook';
import apolloClient from './apolloClient';

export const getAccountBooks = async () => {
  const { data, error } = await apolloClient.query<{
    accountBooks: Array<AccountBook>;
  }>({
    query: gql`
      {
        accountBooks {
          id
          name
          createdAt
          updatedAt
        }
      }
    `,
  });

  if (error) {
    throw error;
  }
  return data.accountBooks;
};

export const getAccountBookById = async (id: number) => {
  const { data, error } = await apolloClient.query<{
    accountBook: AccountBook;
  }>({
    query: gql`
      query ($id: Int!) {
        accountBook(id: $id) {
          id
          name
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      id,
    },
  });

  if (error) {
    throw error;
  }
  return data.accountBook;
};

export const createAccountBook = async (accountBook: {
  name: string;
  desc: string;
  adminIds: Array<number>;
  memberIds: Array<number>;
}) => {
  const { data, errors } = await apolloClient.mutate<{
    createAccountBook: CreatedAccountBook;
  }>({
    mutation: gql`
      mutation (
        $name: String!
        $desc: String!
        $adminIds: [Int!]!
        $memberIds: [Int!]!
      ) {
        createAccountBook(
          accountBook: {
            name: $name
            desc: $desc
            adminIds: $adminIds
            memberIds: $memberIds
          }
        ) {
          id
          name
          desc
          createdAt
          updatedAt
        }
      }
    `,
    variables: accountBook,
  });

  if (errors?.length) {
    throw errors[0];
  }
  return data!.createAccountBook;
};
