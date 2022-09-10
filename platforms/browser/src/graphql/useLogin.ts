import { User } from '@/types';
import { gql, useMutation } from '@apollo/client';

const LOGIN = gql`
  mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
    signIn(
      user: {
        username: $username
        password: $password
        rememberMe: $rememberMe
      }
    ) {
      id
      nickname
      username
      email
      createdAt
      updatedAt
      avatar
    }
  }
`;

const useLogin = () => {
  return useMutation<{ signIn: User }>(LOGIN);
};

export default useLogin;
