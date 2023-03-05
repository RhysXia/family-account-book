import { Spin } from 'antd';
import { useAtom } from 'jotai';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Aside from '@/components/Aside';
import Header from '@/components/Header';
import { activeAccountBookAtom } from '@/store';
import { useGetAccountBookById } from '@/graphql/accountBook';
import { EditOutlined } from '@ant-design/icons';
import FloatingButton from '@/components/FloatingButton';
import AddFlowRecord from './commons/AddFlowRecord';

const AccountBookPage = () => {
  const { accountBookId } = useParams();

  const [accountBook, setActiveAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data, error } = useGetAccountBookById({ id: accountBookId! });

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setActiveAccountBook(data);
    } else if (error) {
      navigate('/notfound');
    }
  }, [data, error, setActiveAccountBook, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleModalVisible = useCallback((v: boolean) => {
    setModalVisible(v);
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex flex-1 flex-row">
        <div className="hidden lg:block">
          <Aside />
        </div>
        <div className="bg-gray-100 flex flex-1 pt-4 px-2 lg:px-4 w-full">
          <Suspense fallback={<Loading />}>
            <Outlet />
            <div className="fixed right-5 bottom-5" style={{ zIndex: 500 }}>
              <FloatingButton
                onClick={() => setModalVisible(true)}
                icon={<EditOutlined />}
              ></FloatingButton>
              {/* <FloatingButton icon={<CalculatorOutlined />}>
                <Calculator />
              </FloatingButton> */}
            </div>
          </Suspense>
        </div>
      </div>
      {accountBook && (
        <AddFlowRecord visible={modalVisible} onChange={handleModalVisible} />
      )}
    </div>
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
