import { RouteObject, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const routes: Array<RouteObject> = [
  {
    path: '/',
    element: <Navigate to="dashboard" replace={true} />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <div>aaa</div>,
      },
    ],
  },
];

export default routes;
