import { gql } from '@apollo/client';
import { SearchUser, User } from '../types/user';
import apolloClient from './apolloClient';

export const signIn = async (value: {
  username: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const { data, errors } = await apolloClient.mutate<{ signIn: User }>({
    mutation: gql`
      mutation ($username: String!, $password: String!, $rememberMe: Boolean) {
        signIn(
          user: {
            username: $username
            password: $password
            rememberMe: $rememberMe
          }
        ) {
          id
          username
          email
          createdAt
          updatedAt
          avatar
        }
      }
    `,
    variables: value,
  });

  if (errors?.length) {
    throw errors[0];
  }

  return data!.signIn;
};

export const getCurrentUser = async () => {
  const { data, error } = await apolloClient.query<{ currentUser: User }>({
    query: gql`
      query {
        currentUser {
          id
          username
          email
          createdAt
          updatedAt
          avatar
        }
      }
    `,
  });

  if (error) {
    throw error;
  }
  return data.currentUser;
};

export const searchUsers = async (username: string, limit = 10) => {
  const { data, error } = await apolloClient.query<{
    searchUsers: Array<SearchUser>;
  }>({
    query: gql`
      query ($username: String!, $limit: Int!) {
        searchUsers(username: $username, limit: $limit) {
          id
          username
          avatar
        }
      }
    `,
    variables: {
      username,
      limit,
    },
  });

  if (error) {
    throw error;
  }
  return data.searchUsers;
};
