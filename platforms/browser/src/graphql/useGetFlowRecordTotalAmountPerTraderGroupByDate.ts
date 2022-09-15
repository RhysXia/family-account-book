import { useAppQuery } from '@/apollo';
import { DateGroupBy } from '@/types';
import { gql } from '@apollo/client';

const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_GROUP_BY_DATE = gql`
  query GetFlowRecordTotalAmountPerTraderGroupByDate(
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

const useGetFlowRecordTotalAmountPerTraderGroupByDate = ({
  accountBookId,
  groupBy,
  ...others
}: {
  accountBookId: string;
  groupBy: DateGroupBy;
  categoryId?: string;
  savingAccountId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useAppQuery<{
    node: {
      id: string;
      statistics: {
        id: string;
        flowRecordTotalAmountPerTraderGroupByDate: Array<{
          trader: {
            id: string;
            nickname: string;
          };
          amountPerDate: Array<{
            dealAt: string;
            amount: number;
          }>;
        }>;
      };
    };
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER_GROUP_BY_DATE, {
    variables: {
      accountBookId,
      groupBy,
      filter: others,
    },
    fetchPolicy: 'cache-and-network',
  });
};

export default useGetFlowRecordTotalAmountPerTraderGroupByDate;
