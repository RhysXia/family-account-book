import { AccountBook, PaginationResult } from '@/types';
import { gql, useQuery } from '@apollo/client';

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
  return useQuery<{
    getCurrentUser: {
      accountBooks: PaginationResult<AccountBook>;
    };
  }>(GET_ACCOUNT_LIST);
};

export default useGetAccountBooks;
