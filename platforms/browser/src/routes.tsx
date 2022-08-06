import { RouteObject } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AccountBook from './pages/AccountBook';
import CreateAccountBook from './pages/CreateAccountBook';
import Home from './pages/Home';
import Login from './pages/Login';

const routes: Array<RouteObject> = [
  {
    path: '/',
    element: (
      <RequireAuth>
        <Home />
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/accountBook/create',
    element: (
      <RequireAuth>
        <CreateAccountBook />
      </RequireAuth>
    ),
  },
  {
    path: '/accountBook/:id',
    element: (
      <RequireAuth>
        <AccountBook />
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
