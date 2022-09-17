import { useAppMutation } from '@/apollo';
import { useAppQuery } from '@/apollo';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  Tag,
  User,
  Pagination,
  Category,
} from '@/types';
import { gql } from '@apollo/client';

export const GET_FLOW_RECORD_LIST_BY_ACCOUNT_BOOK_ID = gql`
  query GetFlowRecordListByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
    $filter: AccountBookFlowRecordFilter
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        flowRecords(pagination: $pagination, filter: $filter) {
          total
          data {
            id
            desc
            createdAt
            updatedAt
            dealAt
            trader {
              id
              username
              nickname
              email
              avatar
            }
            amount
            savingAccount {
              id
              name
              desc
              amount
            }
            tag {
              id
              name
              desc

              category {
                id
                name
                desc
                type
              }
            }
          }
        }
      }
    }
  }
`;

export type FlowRecordDetail = FlowRecord & {
  trader: User;
  savingAccount: SavingAccount;
  tag: Tag & {
    category: Category;
  };
};

export type AccountBookFlowRecordFilter = {
  savingAccountId?: string;
  tagId?: string;
  traderId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export const useGetFlowRecordListByAccountBookId = (variables: {
  accountBookId: string;
  filter?: AccountBookFlowRecordFilter;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      flowRecords: PaginationResult<FlowRecordDetail>;
    };
  }>(GET_FLOW_RECORD_LIST_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.flowRecords,
    ...others,
  };
};

export const CREATE_FLOW_RECORD = gql`
  mutation CreateFlowRecord($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

export const useCreateFlowRecord = () => {
  return useAppMutation<
    { createFlowRecord: { id: string } },
    {
      flowRecord: {
        amount: number;
        desc?: string;
        savingAccountId: string;
        tagId: string;
        dealAt: string;
        traderId: string;
      };
    }
  >(CREATE_FLOW_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_FLOW_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export const UPDATE_FLOW_RECORD = gql`
  mutation UpdateFlowRecord($flowRecord: UpdateFlowRecordInput!) {
    updateFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

export type UpdateFlowRecordInput = {
  id: string;
  desc?: string;
  dealAt?: string;
  amount?: number;
  savingAccountId?: string;
  tagId?: string;
  traderId?: string;
};

export const useUpdateFlowRecord = () => {
  return useAppMutation<
    { updateFlowRecord: { id: string } },
    {
      flowRecord: UpdateFlowRecordInput;
    }
  >(UPDATE_FLOW_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_FLOW_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};

export const DELETE_FLOW_RECORD = gql`
  mutation DeleteFlowRecord($id: ID!) {
    deleteFlowRecord(id: $id)
  }
`;

export const useDeleteFlowRecord = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_FLOW_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [GET_FLOW_RECORD_LIST_BY_ACCOUNT_BOOK_ID];
    },
  });
};
