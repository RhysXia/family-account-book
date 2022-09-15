import { useAppQuery } from '@/apollo';
import { gql } from '@apollo/client';

const GET_FLOW_RECORD_TOTAL_AMOUNT = gql`
  query GetFlowRecordTotalAmount(
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

const useGetFlowRecordTotalAmount = ({
  accountBookId,
  ...others
}: {
  accountBookId: string;
  categoryId?: string;
  traderId?: string;
  savingAccountId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useAppQuery<{
    node: {
      id: string;
      statistics: {
        id: string;
        flowRecordTotalAmount: number;
      };
    };
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT, {
    variables: {
      accountBookId,
      filter: others,
    },
    fetchPolicy: 'cache-and-network',
  });
};

export default useGetFlowRecordTotalAmount;
