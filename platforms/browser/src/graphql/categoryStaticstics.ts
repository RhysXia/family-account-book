import { useAppQuery } from '@/apollo';
import { Tag } from '@/types';
import { gql } from '@apollo/client';

const GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TAG_BY_CATEGORY_ID = gql`
  query GetFlowRecordTotalAmountPerTagByCategoryId(
    $categoryId: ID!
    $filter: FlowRecordTotalAmountPerTagFilter
  ) {
    node(id: $categoryId) {
      ... on Category {
        id
        statistics {
          id
          flowRecordTotalAmountPerTag(filter: $filter) {
            tag {
              id
              name
              desc
            }
            amount
          }
        }
      }
    }
  }
`;

export type FlowRecordTotalAmountPerTagFilter = {
  tagId?: string;
  traderId?: string;
  savingAccountId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export const useGetFlowRecordTotalAmountPeTagByCategoryId = (variables: {
  categoryId: string;
  filter?: FlowRecordTotalAmountPerTagFilter;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      id: string;
      statistics: {
        id: string;
        flowRecordTotalAmountPerTag: Array<{
          tag: Tag;
          amount: number;
        }>;
      };
    };
  }>(GET_FLOW_RECORD_TOTAL_AMOUNT_PER_TAG_BY_CATEGORY_ID, {
    variables,
  });

  return {
    data: data?.node.statistics.flowRecordTotalAmountPerTag,
    ...others,
  };
};
