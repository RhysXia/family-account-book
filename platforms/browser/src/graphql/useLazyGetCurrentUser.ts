import { User } from '@/types';
import { gql, useLazyQuery } from '@apollo/client';

const CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      username
      nickname
      email
      avatar
      createdAt
      updatedAt
    }
  }
`;

const useLazyGetCurrentUser = () => {
  return useLazyQuery<{ getCurrentUser: User }>(CURRENT_USER);
};

export default useLazyGetCurrentUser;
