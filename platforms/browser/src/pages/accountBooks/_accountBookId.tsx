import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Aside from '@/components/Aside';
import Header from '@/components/Header';
import RequireAuth from '@/components/RequireAuth';
import { activeAccountBookAtom } from '@/store';
import { useGetAccountBookById } from '@/graphql/accountBook';

const AccountBookPage = () => {
  const { accountBookId } = useParams();

  const [, setActiveAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const { data, error } = useGetAccountBookById({ id: accountBookId! });

  useEffect(() => {
    if (data) {
      setActiveAccountBook(data);
    } else if (error) {
      navigate('/notfound');
    }
  }, [data, error, setActiveAccountBook, navigate]);

  if (!data) {
    return null;
  }

  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 flex-row">
          <Aside />
          <div className="bg-gray-100 flex flex-1 p-4">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default AccountBookPage;

const Loading = () => {
  return (
    <Spin
      size="large"
      className="w-full h-full flex items-center justify-center bg-gray-100"
    />
  );
};
