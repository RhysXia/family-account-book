import { useAppQuery } from '@/apollo';
import { AccountBook, PaginationResult } from '@/types';
import { gql } from '@apollo/client';

const GET_ACCOUNT_LIST = gql`
  query GetSelfAccountBooks {
    getCurrentUser {
      id
      accountBooks {
        total
        data {
          id
          name
          desc
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const useGetAccountBooks = () => {
  return useAppQuery<{
    getCurrentUser: {
      accountBooks: PaginationResult<AccountBook>;
    };
  }>(GET_ACCOUNT_LIST);
};

export default useGetAccountBooks;
