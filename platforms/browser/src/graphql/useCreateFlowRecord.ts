import { gql, useMutation } from '@apollo/client';

const CREATE_FLOW_RECORD = gql`
  mutation CreateFlowRecord($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

const useCreateFlowRecord = () => {
  return useMutation<
    { createFlowRecord: { id: string } },
    {
      flowRecord: {
        amount: number;
        desc?: string;
        savingAccountId: string;
        tagId: string;
        dealAt: string;
        traderId: string;
      };
    }
  >(CREATE_FLOW_RECORD);
};

export default useCreateFlowRecord;
