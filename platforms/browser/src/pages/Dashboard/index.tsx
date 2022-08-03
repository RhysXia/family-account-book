import { gql, useLazyQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { currentUser } from '../../store/user';

const currentUserGql = gql`
  query {
    currentUser {
      id
      username
      nickname
    }
  }
`;

const Dashboard = () => {
  const [user, setUser] = useAtom(currentUser);

  const [getCurrentUser] = useLazyQuery(currentUserGql);

  const navigate = useNavigate();

  const handleCurrentUser = useCallback(async () => {
    if (user) {
      return;
    }

    const { data, error } = await getCurrentUser();

    if (error) {
      navigate('/login');
      return;
    }

    setUser(data);
  }, [user, getCurrentUser, navigate, setUser]);

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="main">
        <div className="aside">
          <Routes>
            <Route path="/" element={<div>aaa</div>} />
          </Routes>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
