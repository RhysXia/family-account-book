import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const DELETE_SAVING_ACCOUNT = gql`
  mutation DeleteSavingAccount($id: ID!) {
    deleteSavingAccount(id: $id)
  }
`;

const useDeleteSavingAccount = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_SAVING_ACCOUNT);
};

export default useDeleteSavingAccount;
