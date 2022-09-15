import { useAppMutation, useAppQuery } from '@/apollo';
import { Pagination, PaginationResult, SavingAccount } from '@/types';
import { gql } from '@apollo/client';

export const GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID = gql`
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

export const useGetSavingAccountListByAccountBookId = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
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

  return {
    data: data?.node.savingAccounts,
    ...others,
  };
};

export const CREATE_SAVING_ACCOUNT = gql`
  mutation CreateSavingAccount($savingAccount: CreateSavingAccountInput!) {
    createSavingAccount(savingAccount: $savingAccount) {
      id
      name
      desc
      amount
      createdAt
      updatedAt
    }
  }
`;

export type CreateSavingAccountInput = {
  name: string;
  desc?: string;
  amount: number;
  accountBookId: string;
};

export const useCreateSavingAccount = () => {
  return useAppMutation<
    {
      createSavingAccount: SavingAccount;
    },
    {
      savingAccount: CreateSavingAccountInput;
    }
  >(CREATE_SAVING_ACCOUNT, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export const DELETE_SAVING_ACCOUNT_BY_ID = gql`
  mutation DeleteSavingAccount($id: ID!) {
    deleteSavingAccount(id: $id)
  }
`;

export const useDeleteSavingAccountById = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_SAVING_ACCOUNT_BY_ID, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID];
    },
  });
};

const UPDATE_SAVINGA_ACCOUNT = gql`
  mutation UpdateSavingAccount($savingAccount: UpdateSavingAccountInput!) {
    updateSavingAccount(savingAccount: $savingAccount) {
      id
    }
  }
`;

export type UpdateSavingAccountInput = {
  id: string;
  name?: string;
  desc?: string;
  amount?: number;
};

const useUpdateSavingAccount = () => {
  return useAppMutation<
    {
      updateSavingAccount: {
        id: string;
      };
    },
    {
      savingAccount: UpdateSavingAccountInput;
    }
  >(UPDATE_SAVINGA_ACCOUNT, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export default useUpdateSavingAccount;
