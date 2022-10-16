import { useAppMutation, useAppQuery } from '@/apollo';
import { Pagination, PaginationResult, TransferRecord } from '@/types';
import { gql } from '@apollo/client';

export const GET_TRANSFER_RECORD_LIST_BY_ACCOUNT_BOOK_ID = gql`
  query GetTransferRecords(
    $accountBookId: ID!
    $filter: AccountBookSavingAccountTransferRecordFilter
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        savingAccountTransferRecords(filter: $filter, pagination: $pagination) {
          total
          data {
            id
            desc
            amount
            dealAt
            createdAt
            updatedAt
            trader {
              id
              nickname
            }
            from {
              id
              name
              amount
            }
            to {
              id
              name
              amount
            }
          }
        }
      }
    }
  }
`;

export type AccountBookTransferRecordFilter = {
  fromSavingAccountId?: string;
  toSavingAccountId?: string;
  traderId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export type TransferRecordDetail = TransferRecord & {
  to: {
    id: string;
    name: string;
  };
  from: {
    id: string;
    name: string;
  };
  trader: {
    id;
    nickname;
  };
};

export const useGetTransferRecordListByAccountBookId = (variables: {
  accountBookId: string;
  filter?: AccountBookTransferRecordFilter;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      savingAccountTransferRecords: PaginationResult<TransferRecordDetail>;
    };
  }>(GET_TRANSFER_RECORD_LIST_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.savingAccountTransferRecords,
    ...others,
  };
};

export const CREATE_TRANSFER_RECORD = gql`
  mutation CreateTransferRecord($record: CreateSavingAccountTransferRecord!) {
    createSavingAccountTransferRecord(record: $record) {
      id
    }
  }
`;

export const useCreateTransferRecord = () => {
  return useAppMutation<
    { createSavingAccountTransferRecord: { id: string } },
    {
      record: {
        amount: number;
        desc?: string;
        fromSavingAccountId: string;
        toSavingAccountId: string;
        dealAt: string;
        traderId: string;
      };
    }
  >(CREATE_TRANSFER_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_TRANSFER_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export const UPDATE_TRANSFER_RECORD = gql`
  mutation UpdateTransferRecord($record: UpdateSavingAccountTransferRecord!) {
    updateSavingAccountTransferRecord(record: $record) {
      id
    }
  }
`;

export const useUpdateTransferRecord = () => {
  return useAppMutation<
    { updateSavingAccountTransferRecord: { id: string } },
    {
      record: {
        id: string;
        amount?: number;
        desc?: string;
        fromSavingAccountId?: string;
        toSavingAccountId?: string;
        dealAt?: string;
        traderId?: string;
      };
    }
  >(UPDATE_TRANSFER_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_TRANSFER_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export const DELETE_TRANSFER_RECORD = gql`
  mutation DeleteTransferRecord($id: ID!) {
    deleteSavingAccountTransferRecord(id: $id)
  }
`;

export const useDeleteTransferRecord = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_TRANSFER_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_TRANSFER_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};
