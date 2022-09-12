import { gql, useMutation } from '@apollo/client';

const DELETE_SAVING_ACCOUNT = gql`
  mutation DeleteSavingAccount($id: ID!) {
    deleteSavingAccount(id: $id)
  }
`;

const useDeleteSavingAccount = () => {
  return useMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_SAVING_ACCOUNT);
};

export default useDeleteSavingAccount;
