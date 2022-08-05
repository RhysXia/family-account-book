import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { getCurrentUser } from '../../api';
import { storeCurrentUser } from '../../store/user';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useAtom(storeCurrentUser);

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

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  if (!currentUser) {
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
