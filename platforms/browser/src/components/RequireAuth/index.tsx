import { useAtom } from 'jotai';
import { FC, ReactNode, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUser as currentUserStore } from '../../store/user';

const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser] = useAtom(currentUserStore);

  const navigate = useNavigate();

  const handleCurrentUser = useCallback(async () => {
    if (currentUser) {
      return;
    }

    navigate('/login');
  }, [currentUser, navigate]);

  useLayoutEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
