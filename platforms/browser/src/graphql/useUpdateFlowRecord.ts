import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const UPDATE_FLOW_RECORD = gql`
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

const useUpdateFlowRecord = () => {
  return useAppMutation<
    { id: string },
    {
      flowRecord: UpdateFlowRecordInput;
    }
  >(UPDATE_FLOW_RECORD);
};

export default useUpdateFlowRecord;
