import { TagType } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER = gql`
  query GetFlowRecordTotalAmountPerTrader(
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

const useGetFlowRecordTotalAmountPerTrader = ({
  accountBookId,
  ...others
}: {
  accountBookId: string;
  tagType?: TagType;
  savingAccountId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<{
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
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TRADER, {
    variables: {
      accountBookId,
      filter: others,
    },
    fetchPolicy: 'cache-and-network',
  });
};

export default useGetFlowRecordTotalAmountPerTrader;
