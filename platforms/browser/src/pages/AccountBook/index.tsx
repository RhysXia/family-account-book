import { gql, useQuery } from '@apollo/client';
import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Aside from '../../components/Aside';
import useConstantFn from '../../hooks/useConstanFn';

const GET_ACCOUNT_BOOK_BY_ID = gql`
  query GetAccountBookById($id: Int!) {
    getAuthAccountBookById(id: $id) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

const AccountBook = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { data, error, } = useQuery(GET_ACCOUNT_BOOK_BY_ID, {
    variables: {
      id,
    },
  });

  useEffect(() => {
    if (error) {
      navigate('/notfound');
    }
  }, [error, navigate]);

  useEffect(() => {
    handleAccountBook(id!);
  }, [handleAccountBook, id]);

  if (!accountBook || accountBook.id !== +id!) {
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

export default AccountBook;
