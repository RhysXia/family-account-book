import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const DELETE_FLOW_RECORD = gql`
  mutation DeleteFlowRecord($id: ID!) {
    deleteFlowRecord(id: $id)
  }
`;

const useDeleteFlowRecord = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_FLOW_RECORD);
};

export default useDeleteFlowRecord;
