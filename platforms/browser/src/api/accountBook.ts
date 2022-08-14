import { gql } from '@apollo/client';
import apolloClient from './apolloClient';

export type AccountBook = {
  id: number;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
};

export const getAuthAccountBooks = async () => {
  const { data, error } = await apolloClient.query<{
    getAuthAccountBooks: Array<AccountBook>;
  }>({
    query: gql`
      {
        getAuthAccountBooks {
          id
          name
          desc
          createdAt
          updatedAt
        }
      }
    `,
  });

  if (error) {
    throw error;
  }
  return data.getAuthAccountBooks;
};

export const getAuthAccountBookById = async (id: number) => {
  const { data, error } = await apolloClient.query<{
    getAuthAccountBookById: AccountBook;
  }>({
    query: gql`
      query ($id: Int!) {
        getAuthAccountBookById(id: $id) {
          id
          name
          desc
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
  return data.getAuthAccountBookById;
};

export type CreateAccountBookInput = {
  name: string;
  desc?: string;
  adminIds?: Array<number>;
  memberIds?: Array<number>;
};

export const createAccountBook = async (
  accountBook: CreateAccountBookInput,
) => {
  const { data, errors } = await apolloClient.mutate<{
    createAccountBook: AccountBook;
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
