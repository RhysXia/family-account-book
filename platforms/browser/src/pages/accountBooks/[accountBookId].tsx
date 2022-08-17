import { gql, useQuery } from '@apollo/client';
import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Aside from '../../components/Aside';
import Header from '../../components/Header';
import RequireAuth from '../../components/RequireAuth';
import { activeAccountBookAtom } from '../../store';
import { AccountBook } from '../../types';

const GET_ACCOUNT_BOOK_BY_ID = gql`
  query ($id: Int!) {
    getAuthAccountBookById(id: $id) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

const AccountBookPage = () => {
  const { accountBookId } = useParams();

  const [, setActiveAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const { data, error } = useQuery<{ getAuthAccountBookById: AccountBook }>(
    GET_ACCOUNT_BOOK_BY_ID,
    {
      variables: {
        id: +accountBookId!,
      },
    },
  );

  useEffect(() => {
    if (data) {
      setActiveAccountBook(data.getAuthAccountBookById);
    } else if (error) {
      navigate('/notfound');
    }
  }, [data, error, setActiveAccountBook, navigate]);

  if (!data?.getAuthAccountBookById) {
    return null;
  }

  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 flex-row">
          <Aside />
          <Suspense fallback={<Loading />}>
            <div className="bg-gray-100 flex flex-1 p-4">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </div>
    </RequireAuth>
  );
};

const Loading = () => {
  return (
    <Spin
      size="large"
      className="w-full h-full flex items-center justify-center bg-gray-100"
    />
  );
};

export default AccountBookPage;
