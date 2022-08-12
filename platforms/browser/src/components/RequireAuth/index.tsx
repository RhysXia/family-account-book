import { useAtom } from 'jotai';
import { FC, ReactNode, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api';
import { currentUser as currentUserStore } from '../../store/user';

const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserStore);

  const navigate = useNavigate();

  const handleCurrentUser = useCallback(async () => {
    if (currentUser) {
      return;
    }

    try {
      const data = await getCurrentUser();
      setCurrentUser(data);
    } catch (err) {
      navigate('/login');
    }
  }, [currentUser, navigate, setCurrentUser]);

  useLayoutEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
