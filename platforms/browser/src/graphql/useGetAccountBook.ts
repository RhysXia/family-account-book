import { useAppQuery } from '@/apollo';
import { AccountBook, User } from '@/types';
import { gql } from '@apollo/client';

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
          username
          email
          avatar
        }
        members {
          id
          nickname
          username
          email
          avatar
        }
      }
    }
  }
`;

export type AccountBookDetail = AccountBook & {
  admins: Array<User>;
  members: Array<User>;
};

const useGetAccountBook = (props: { id: string }) => {
  return useAppQuery<{
    node: AccountBookDetail;
  }>(GET_ACCOUNT_BOOK_BY_ID, {
    variables: props,
  });
};

export default useGetAccountBook;
