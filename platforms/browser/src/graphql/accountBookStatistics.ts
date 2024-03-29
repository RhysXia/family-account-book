import { useAppQuery } from '@/apollo';
import { Category, CategoryType, DateGroupBy, User } from '@/types';
import { gql } from '@apollo/client';

export const GET_FLOW_RECORD_TOTAL_AMOUNT_BY_ACCOUNT_BOOK_ID = gql`
  query GetFlowRecordTotalAmountByAccountBookId(
    $accountBookId: ID!
    $filter: FlowRecordTotalAmountFilter
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        statistics {
          id
          flowRecordTotalAmount(filter: $filter)
        }
      }
    }
  }
`;

export type FlowRecordTotalAmountFilter = {
  categoryId?: string;
  categoryType?: CategoryType;
  traderId?: string;
  savingAccountId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export const useGetFlowRecordTotalAmountByAccountBookId = (variables: {
  accountBookId: string;
  filter?: FlowRecordTotalAmountFilter;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      id: string;
      statistics: {
        id: string;
        flowRecordTotalAmount: number;
      };
    };
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.statistics.flowRecordTotalAmount,
    ...others,
  };
};

export const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_BY_ACCOUNT_BOOK_ID = gql`
  query GetFlowRecordTotalAmountPerTraderByAccountBookId(
    $accountBookId: ID!
    $filter: FlowRecordTotalAmountPerTraderFilter
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        statistics {
          id
          flowRecordTotalAmountPerTrader(filter: $filter) {
            trader {
              id
              nickname
            }
            amount
          }
        }
      }
    }
  }
`;

export type FlowRecordTotalAmountPerTraderFilter = {
  categoryId?: string;
  traderId?: string;
  categoryType?: CategoryType;
  savingAccountId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export const useGetFlowRecordTotalAmountPerTraderByAccountBookId = (variables: {
  accountBookId: string;
  filter?: FlowRecordTotalAmountPerTraderFilter;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      id: string;
      statistics: {
        id: string;
        flowRecordTotalAmountPerTrader: Array<{
          trader: {
            id: string;
            nickname: string;
          };
          amount: number;
        }>;
      };
    };
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.statistics.flowRecordTotalAmountPerTrader,
    ...others,
  };
};

export const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_GROUP_BY_DATE_BY_ACCOUNT_BOOK_ID = gql`
  query GetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId(
    $accountBookId: ID!
    $filter: FlowRecordTotalAmountPerTraderFilter
    $groupBy: DateGroupBy!
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        statistics {
          id
          flowRecordTotalAmountPerTraderGroupByDate(
            filter: $filter
            groupBy: $groupBy
          ) {
            trader {
              id
              nickname
              username
              email
              avatar
            }
            amountPerDate {
              dealAt
              amount
            }
          }
        }
      }
    }
  }
`;

export const useGetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId =
  (variables: {
    accountBookId: string;
    groupBy: DateGroupBy;
    filter?: FlowRecordTotalAmountPerTraderFilter;
  }) => {
    const { data, ...others } = useAppQuery<{
      node: {
        id: string;
        statistics: {
          id: string;
          flowRecordTotalAmountPerTraderGroupByDate: Array<{
            trader: User;
            amountPerDate: Array<{
              dealAt: string;
              amount: number;
            }>;
          }>;
        };
      };
    }>(
      GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_GROUP_BY_DATE_BY_ACCOUNT_BOOK_ID,
      {
        variables,
      },
    );

    return {
      data: data?.node.statistics.flowRecordTotalAmountPerTraderGroupByDate,
      ...others,
    };
  };

export const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_CATEGORY_BY_ACCOUNT_BOOK_ID = gql`
  query GetFlowRecordTotalAmountPerCategoryByAccountBookId(
    $accountBookId: ID!
    $filter: FlowRecordTotalAmountPerCategoryFilter
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        statistics {
          id
          flowRecordTotalAmountPerCategory(filter: $filter) {
            category {
              id
              name
              type
              desc
            }
            amount
          }
        }
      }
    }
  }
`;

export type FlowRecordTotalAmountPerCategoryFilter = {
  traderId?: string;
  categoryType?: CategoryType;
  savingAccountId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export const useGetFlowRecordTotalAmountPerCategoryByAccountBookId =
  (variables: {
    accountBookId: string;
    filter?: FlowRecordTotalAmountPerTraderFilter;
  }) => {
    const { data, ...others } = useAppQuery<{
      node: {
        id: string;
        statistics: {
          id: string;
          flowRecordTotalAmountPerCategory: Array<{
            category: Category;
            amount: number;
          }>;
        };
      };
    }>(GET_FLOW_RECORD_TOTAL_AMOUNT_PER_CATEGORY_BY_ACCOUNT_BOOK_ID, {
      variables,
    });

    return {
      data: data?.node.statistics.flowRecordTotalAmountPerCategory,
      ...others,
    };
  };
