import { TagType } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_FLOW_RECORD_AMOUNT = gql`
  query GetFlowRecordAmount(
    $accountBookId: ID!
    $tagType: TagType!
    $startDate: Date
    $endDate: Date
    $traderId: ID
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        flowRecordAmount(
          startDate: $startDate
          endDate: $endDate
          tagType: $tagType
          traderId: $traderId
        )
      }
    }
  }
`;

const useGetFlowRecordAmount = (variables: {
  accountBookId: string;
  tagType: TagType;
  traderId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<{
    node: {
      flowRecordAmount: number;
    };
  }>(GET_FLOW_RECORD_AMOUNT, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
};

export default useGetFlowRecordAmount;
