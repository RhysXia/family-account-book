import useLazyGetCurrentUser from '@/graphql/useLazyGetCurrentUser';
import { useAtom } from 'jotai';
import { FC, ReactNode, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';

const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [getCurrentUser] = useLazyGetCurrentUser();

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
