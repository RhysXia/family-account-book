import { Outlet } from 'react-router-dom';
import Aside from '../../components/Aside';
import Header from '../../components/Header';

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-row flex-1">
        <Aside />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
