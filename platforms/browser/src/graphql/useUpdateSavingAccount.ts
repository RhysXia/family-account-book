import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const UPDATE_SAVINGA_ACCOUNT = gql`
  mutation UpdateSavingAccount($savingAccount: UpdateSavingAccountInput!) {
    updateSavingAccount(savingAccount: $savingAccount) {
      id
    }
  }
`;

export type UpdateSavingAccountInput = {
  id: string;
  name?: string;
  desc?: string;
  amount?: number;
};

const useUpdateSavingAccount = () => {
  return useAppMutation<
    {
      updateSavingAccount: {
        id: string;
      };
    },
    {
      savingAccount: UpdateSavingAccountInput;
    }
  >(UPDATE_SAVINGA_ACCOUNT);
};

export default useUpdateSavingAccount;
