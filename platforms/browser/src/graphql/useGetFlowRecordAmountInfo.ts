import { DateGroupBy, TagType } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_FLOW_RECORD_AMOUNT_INFO = gql`
  query GetFlowRecordAmountInfo(
    $accountBookId: ID!
    $startDateForAmount: Date
    $startDateForAmounts: Date
    $tagType: TagType!
    $groupBy: DateGroupBy!
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        totalFlowRecordAmount(startDate: $startDateForAmount, tagType: $tagType)
        totalFlowRecordAmounts(
          startDate: $startDateForAmounts
          tagType: $tagType
          groupBy: $groupBy
        ) {
          dealAt
          amount
        }
      }
    }
  }
`;

const useGetFlowRecordAmountInfo = (variables: {
  accountBookId: string;
  tagType: TagType;
  startDateForAmount?: string;
  startDateForAmounts?: string;
  groupBy: DateGroupBy;
}) => {
  return useQuery<{
    node: {
      totalFlowRecordAmount: number;
      totalFlowRecordAmounts: Array<{ dealAt: string; amount: number }>;
    };
  }>(GET_FLOW_RECORD_AMOUNT_INFO, {
    variables,
  });
};

export default useGetFlowRecordAmountInfo;
