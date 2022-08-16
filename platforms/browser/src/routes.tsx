import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AccountBook from './pages/AccountBook';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';

const Income = lazy(() => import('./pages/AccountBook/Income'));
const SavingAccount = lazy(() => import('./pages/AccountBook/SavingAccount'));

const routes: Array<RouteObject> = [
  {
    path: '/',
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/accountBooks/:id',
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
        path: 'savingAccounts',
        element: <SavingAccount />,
      },
    ],
  },
];

export default routes;
