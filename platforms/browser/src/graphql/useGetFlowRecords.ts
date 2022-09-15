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

const GET_SELF_FLOW_RECORDS = gql`
  query GetSelfFlowRecordsByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
    $filter: FlowRecordFilter
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
              nickname
              username
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

const useGetFlowRecords = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  return useAppQuery<{
    node: {
      flowRecords: PaginationResult<FlowRecordDetail>;
    };
  }>(GET_SELF_FLOW_RECORDS, {
    variables,
  });
};

export default useGetFlowRecords;
