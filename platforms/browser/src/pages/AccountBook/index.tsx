import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getAccountBookById } from '../../api/accountBook';
import Aside from '../../components/Aside';
import useConstantFn from '../../hooks/useConstanFn';
import { activeAccountBook } from '../../store/accountBook';

const AccountBook = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [accountBook, setAccounBook] = useAtom(activeAccountBook);

  const handleAccountBook = useConstantFn(async (idStr: string) => {
    const id = +idStr;

    if (Number.isNaN(id)) {
      navigate('/notfound');
      return;
    }

    if (accountBook?.id === id) {
      return;
    }
    try {
      const value = await getAccountBookById(id);
      setAccounBook(value);
    } catch (err) {
      navigate('/notfound');
    }
  });

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
