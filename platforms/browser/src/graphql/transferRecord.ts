import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

export const CREATE_TRANSFER_RECORD = gql`
  mutation CreateTransferRecord($record: CreateSavingAccountTransferRecord!) {
    createSavingAccountTransferRecord(record: $record) {
      id
    }
  }
`;

export const useCreateTransferRecord = () => {
  return useAppMutation<
    { createSavingAccountTransferRecord: { id: string } },
    {
      flowRecord: {
        amount: number;
        desc?: string;
        fromSavingAccountId: string;
        toSavingAccountId: string;
        dealAt: string;
        traderId: string;
      };
    }
  >(CREATE_TRANSFER_RECORD, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [];
    },
  });
};
