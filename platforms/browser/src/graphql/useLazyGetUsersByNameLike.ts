import { User } from '@/types';
import { gql, useLazyQuery } from '@apollo/client';

const GET_USER_LIST = gql`
  query GetUserListByNameLike(
    $name: String!
    $limit: Int!
    $includeSelf: Boolean
  ) {
    findUserListByNameLike(
      name: $name
      limit: $limit
      includeSelf: $includeSelf
    ) {
      id
      nickname
      username
      email
      avatar
      createdAt
      updatedAt
    }
  }
`;
const useLazyGetUsersByNameLike = () => {
  return useLazyQuery<
    {
      findUserListByNameLike: Array<User>;
    },
    {
      name: string;
      limit?: number;
      includeSelf?: boolean;
    }
  >(GET_USER_LIST);
};
export default useLazyGetUsersByNameLike;
