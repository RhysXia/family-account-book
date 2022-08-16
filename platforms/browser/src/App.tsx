import { ConfigProvider } from 'antd';
import { StrictMode, Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import zhCn from 'antd/es/locale/zh_CN';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo';
import { useAtomsDevtools } from 'jotai/devtools';

import './assets/styles/index.less';

console.log(routes);

const App = () => {
  return (
    <StrictMode>
      <ConfigProvider locale={zhCn}>
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

export const Router = () => {
  const element = useRoutes(routes);
  return <Suspense fallback={<p>Loading...</p>}>{element}</Suspense>;
};

export default App;

const AtomsDevtools = ({ children }) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAtomsDevtools('demo');
  }
  return children;
};
