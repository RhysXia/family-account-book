import { useAppQuery } from '@/apollo';
import { Pagination, PaginationResult, SavingAccount } from '@/types';
import { gql } from '@apollo/client';

const GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID = gql`
  query GetSavingAccountsByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        savingAccounts(pagination: $pagination) {
          total
          data {
            id
            name
            desc
            amount
            createdAt
            updatedAt
            creator {
              id
              nickname
            }
          }
        }
      }
    }
  }
`;

const useGetSavingAccounts = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  return useAppQuery<{
    node: {
      savingAccounts: PaginationResult<
        SavingAccount & {
          creator: {
            id: string;
            nickname: string;
          };
        }
      >;
    };
  }>(GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID, {
    variables,
  });
};

export default useGetSavingAccounts;
