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
        admins {
          id
          nickname
        }
        members {
          id
          nickname
        }
      }
    }
  }
`;

export type AccountBookDetail = AccountBook & {
  admins: Array<{
    id: string;
    nickname: string;
  }>;
  members: Array<{
    id: string;
    nickname: string;
  }>;
};

const useGetAccountBook = (props: { id: string }) => {
  return useQuery<{
    node: AccountBookDetail;
  }>(GET_ACCOUNT_BOOK_BY_ID, {
    variables: props,
  });
};

export default useGetAccountBook;
