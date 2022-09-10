import { SavingAccount } from '@/types';
import { gql, useMutation } from '@apollo/client';

const CREATE_SAVING_ACCOUNT = gql`
  mutation CreateSavingAccount(
    $name: String!
    $desc: String
    $amount: Float!
    $accountBookId: ID!
  ) {
    createSavingAccount(
      savingAccount: {
        name: $name
        desc: $desc
        amount: $amount
        accountBookId: $accountBookId
      }
    ) {
      id
      name
      desc
      amount
      createdAt
      updatedAt
    }
  }
`;

const useCreateSavingAccount = () => {
  return useMutation<{
    createSavingAccount: SavingAccount;
  }>(CREATE_SAVING_ACCOUNT);
};

export default useCreateSavingAccount;
