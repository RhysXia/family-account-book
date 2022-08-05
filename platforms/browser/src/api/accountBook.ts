import { gql } from '@apollo/client';
import { AccountBook } from '../types/accountBook';
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
        }
      }
    `,
  });

  if (error) {
    throw error;
  }
  return data.accountBooks;
};
