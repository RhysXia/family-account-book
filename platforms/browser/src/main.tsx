import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useAtomsDevtools } from 'jotai/devtools';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
