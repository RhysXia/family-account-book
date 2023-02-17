import { ConfigProvider, Spin } from 'antd';
import { StrictMode, Suspense } from 'react';
import { BrowserRouter, RouteObject, useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import zhCn from 'antd/es/locale/zh_CN';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo';
import { useAtomsDevtools } from 'jotai/devtools';
import RequireAuth from '@/components/RequireAuth';

import './assets/styles/index.less';
import PWAMessage from './components/PWAMessage';

const App = () => {
  return (
    <StrictMode>
      <ConfigProvider locale={zhCn}>
        <PWAMessage />
        <ApolloProvider client={apolloClient}>
          <AtomsDevtools>
            <BrowserRouter>
              <Router></Router>
            </BrowserRouter>
          </AtomsDevtools>
        </ApolloProvider>
      </ConfigProvider>
    </StrictMode>
  );
};

const wrapAuth = (route: RouteObject): RouteObject => {
  if (route.element) {
    return {
      ...route,
      element: <RequireAuth>{route.element}</RequireAuth>,
    };
  }
  return {
    ...route,
    children: route.children?.map(wrapAuth),
  };
};

const mappedRoutes = routes.map((it) => {
  if (it.path === 'login') {
    return it;
  }

  return wrapAuth(it);
});

export const Router = () => {
  const element = useRoutes(mappedRoutes);

  return <Suspense fallback={<Loading />}>{element}</Suspense>;
};

const Loading = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default App;

const AtomsDevtools = ({ children }) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAtomsDevtools('demo');
  }
  return children;
};
