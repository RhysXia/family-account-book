import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { currentUser } from '../../store/user';

export default () => {
  const [user] = useAtom(currentUser);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="header">header</div>
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
