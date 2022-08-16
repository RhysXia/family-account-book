import { gql, useQuery } from '@apollo/client';
import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Aside from '../../components/Aside';
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
  const { id } = useParams();

  const [, setActiveAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const { data, error } = useQuery<{ getAuthAccountBookById: AccountBook }>(
    GET_ACCOUNT_BOOK_BY_ID,
    {
      variables: {
        id: +id!,
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
    <div className="flex flex-row min-h-screen">
      <Aside />
      <div className="flex-1 min-h-full">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
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
