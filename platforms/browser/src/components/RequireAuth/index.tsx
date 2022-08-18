import { gql, useLazyQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { FC, ReactNode, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';
import { User } from '../../types';

const CURRENT_USER = gql`
  query {
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

const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [getCurrentUser] = useLazyQuery<{ getCurrentUser: User }>(CURRENT_USER);

  const navigate = useNavigate();

  const handleCurrentUser = useCallback(async () => {
    if (currentUser) {
      return;
    }
    const { data } = await getCurrentUser();
    if (data) {
      setCurrentUser(data.getCurrentUser);
      return;
    }

    navigate('/login');
  }, [currentUser, setCurrentUser, getCurrentUser, navigate]);

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
