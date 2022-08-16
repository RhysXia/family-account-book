import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AccountBook from './pages/AccountBook';
import Home from './pages/Home';
import Login from './pages/Login';

const Income = lazy(() => import('./pages/AccountBook/Income'));
const SavingAccount = lazy(() => import('./pages/AccountBook/SavingAccount'));

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
      // {
      //   path: 'income',
      //   element: <Income />,
      // },
      {
        path: 'savingAccount',
        element: <SavingAccount />,
      },
    ],
  },
];

export default routes;
