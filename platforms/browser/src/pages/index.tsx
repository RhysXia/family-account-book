import { useCallback, useState } from 'react';
import { fromTime } from '../utils/dayjs';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { AccountBook, PaginationResult } from '../types';
import { gql, useQuery } from '@apollo/client';
import CreateAccountBook from '../components/CreateAccountBook';

const GET_ACCOUNT_LIST = gql`
  query {
    getAuthAccountBooks {
      data {
        id
        name
        desc
        createdAt
        updatedAt
      }
    }
  }
`;

const HomePage = () => {
  const { data, loading } = useQuery<{
    getAuthAccountBooks: PaginationResult<AccountBook>;
  }>(GET_ACCOUNT_LIST);

  const [createAccountBookModalVisible, setCreateAccountBookModalVisible] =
    useState(false);

  const navigate = useNavigate();

  const handleCreateAccountBook = useCallback(() => {
    setCreateAccountBookModalVisible(true);
  }, []);

  if (loading) {
    return null;
  }

  const title = (
    <>
      <h1 className="font-bold text-xl mb-2">欢迎使用开源节流</h1>
      <div className="text-sm text-gray-500 ">创建或者选择一个账本</div>
    </>
  );

  return (
    <>
      <Modal
        title={title}
        visible={true}
        maskStyle={{ backgroundColor: '#F3F4F6' }}
        closable={false}
        footer={null}
        getContainer={false}
      >
        <div className="-m-5">
          <div
            onClick={handleCreateAccountBook}
            className="px-4 py-4 flex items-center transition-all hover:bg-gray-100 cursor-pointer"
          >
            <div className="border rounded-full h-9 w-9 flex items-center justify-center bg-blue-500 text-white">
              <PlusOutlined />
            </div>
            <div className="px-3">
              <div className="font-semibold text-base">新帐本</div>
              <div className="text-sm text-gray-500 ">创建一个新的账本</div>
            </div>
          </div>
          {data?.getAuthAccountBooks?.data.map((it, index) => {
            return (
              <div
                onClick={() => navigate(`/accountBooks/${it.id}`)}
                key={it.id}
                className="px-4 py-4 flex items-center transition-all hover:bg-gray-100 cursor-pointer"
              >
                <div className="border rounded-full h-9 w-9 flex items-center justify-center bg-gray-100 text-gray-400 font-semibold">
                  {index + 1}
                </div>
                <div className="px-3">
                  <div className="font-semibold text-base">{it.name}</div>
                  <div className="text-sm text-gray-500 ">
                    {fromTime(it.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <CreateAccountBook
        visible={createAccountBookModalVisible}
        onVisible={setCreateAccountBookModalVisible}
      />
    </>
  );
};

export default HomePage;
