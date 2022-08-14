import { gql } from '@apollo/client';
import { atom } from 'jotai';
import { apolloClient } from '../api';
import { User } from '../types';

let _currentUser: User;

export const currentUser = atom(async () => {
  if (_currentUser) {
    return _currentUser;
  }

  const { data, error } = await apolloClient.query<{ getCurrentUser: User }>({
    query: gql`
      query {
        getCurrentUser {
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

  _currentUser = data.getCurrentUser;
  return _currentUser;
});
