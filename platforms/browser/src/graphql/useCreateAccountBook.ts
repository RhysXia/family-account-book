import { AccountBook } from '@/types';
import { gql, useMutation } from '@apollo/client';

const CREATE_ACCOUNT_BOOK = gql`
  mutation CreateAccountBook(
    $name: String!
    $desc: String
    $adminIds: [ID!]
    $memberIds: [ID!]
  ) {
    createAccountBook(
      accountBook: {
        name: $name
        desc: $desc
        adminIds: $adminIds
        memberIds: $memberIds
      }
    ) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

export type CreateAccountBookVariables = {
  name: string;
  desc?: string;
  adminIds: Array<string>;
  memberIds: Array<string>;
};

const useCreateAccountBook = () => {
  return useMutation<
    {
      createAccountBook: AccountBook;
    },
    CreateAccountBookVariables
  >(CREATE_ACCOUNT_BOOK);
};

export default useCreateAccountBook;
