import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useAtomsDevtools } from 'jotai/devtools';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './assets/styles/index.less';
import { apolloClient } from './apollo';
import { ConfigProvider } from 'antd';
import zhCn from 'antd/es/locale/zh_CN';

const AtomsDevtools = ({ children }) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAtomsDevtools('demo');
  }
  return children;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCn}>
      <ApolloProvider client={apolloClient}>
        <AtomsDevtools>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AtomsDevtools>
      </ApolloProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
