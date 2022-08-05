import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useAtomsDevtools } from 'jotai/devtools';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './assets/styles/index.less';
import { apolloClient } from './api';

const AtomsDevtools = ({ children }) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAtomsDevtools('demo');
  }
  return children;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AtomsDevtools>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AtomsDevtools>
    </ApolloProvider>
  </React.StrictMode>,
);
