import { DateGroupBy, TagType } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_FLOW_RECORD_AMOUNTS = gql`
  query GetFlowRecordAmounts(
    $accountBookId: ID!
    $tagType: TagType!
    $groupBy: DateGroupBy!
    $startDate: Date
    $endDate: Date
    $traderId: ID
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        flowRecordAmounts(
          startDate: $startDate
          endDate: $endDate
          tagType: $tagType
          groupBy: $groupBy
          traderId: $traderId
        ) {
          dealAt
          amount
        }
      }
    }
  }
`;

const useGetFlowRecordAmounts = (variables: {
  accountBookId: string;
  tagType: TagType;
  traderId?: string;
  startDate?: string;
  endDate?: string;
  groupBy: DateGroupBy;
}) => {
  return useQuery<{
    node: {
      flowRecordAmounts: Array<{ dealAt: string; amount: number }>;
    };
  }>(GET_FLOW_RECORD_AMOUNTS, {
    variables,
  });
};

export default useGetFlowRecordAmounts;
