import { useAppQuery } from '@/apollo';
import { PaginationResult, SavingAccount } from '@/types';
import { gql } from '@apollo/client';

const GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID = gql`
  query GetSavingAccountsByAccountBookId($accountBookId: ID!) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        savingAccounts {
          total
          data {
            id
            name
            desc
            amount
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

const useGetSavingAccounts = (variables: { accountBookId: string }) => {
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
