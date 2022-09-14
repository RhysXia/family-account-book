import { useAppMutation } from '@/apollo';
import { SavingAccount } from '@/types';
import { gql } from '@apollo/client';

const CREATE_SAVING_ACCOUNT = gql`
  mutation CreateSavingAccount($savingAccount: CreateSavingAccountInput!) {
    createSavingAccount(savingAccount: $savingAccount) {
      id
      name
      desc
      amount
      createdAt
      updatedAt
    }
  }
`;

export type CreateSavingAccountInput = {
  name: string;
  desc?: string;
  amount: number;
  accountBookId: string;
};

const useCreateSavingAccount = () => {
  return useAppMutation<
    {
      createSavingAccount: SavingAccount;
    },
    {
      savingAccount: CreateSavingAccountInput;
    }
  >(CREATE_SAVING_ACCOUNT);
};

export default useCreateSavingAccount;
