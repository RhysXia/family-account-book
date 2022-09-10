import { AccountBook } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_ACCOUNT_BOOK_BY_ID = gql`
  query GetAccountBookById($id: ID!) {
    node(id: $id) {
      ... on AccountBook {
        id
        name
        desc
        createdAt
        updatedAt
      }
    }
  }
`;

const useGetAccountBook = (props: { id: string }) => {
  return useQuery<{ node: AccountBook }>(GET_ACCOUNT_BOOK_BY_ID, {
    variables: props,
  });
};

export default useGetAccountBook;
