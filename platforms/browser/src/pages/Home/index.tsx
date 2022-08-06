import { useCallback, useEffect, useState } from 'react';
import { getAccountBooks } from '../../api/accountBook';
import { AccountBook } from '../../types/accountBook';
import { Plus } from 'react-feather';
import { fromTime } from '../../utils/dayjs';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [accountBooks, setAccountBooks] = useState<Array<AccountBook>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    getAccountBooks().then(setAccountBooks);
  }, []);

  const handleClick = useCallback(() => {
    navigate('/accountBook/create');
  }, [navigate]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      <div
        className="shadow-lg rounded-lg overflow-hidden bg-white divide-y divide-gray-200"
        style={{
          width: 600,
        }}
      >
        <div className="py-4 px-4">
          <h1 className="font-bold text-xl mb-2">欢迎使用开源节流</h1>
          <div className="text-sm text-gray-500 ">创建或者选择一个账本</div>
        </div>
        <div
          onClick={handleClick}
          className="py-4 px-4 flex items-center transition-all hover:bg-gray-100 cursor-pointer"
        >
          <div className="border rounded-full h-9 w-9 flex items-center justify-center bg-blue-500 text-white">
            <Plus />
          </div>
          <div className="px-3">
            <div className="font-semibold text-base">新帐本</div>
            <div className="text-sm text-gray-500 ">创建一个新的账本</div>
          </div>
        </div>
        {accountBooks.map((it, index) => {
          return (
            <div
              onClick={() => navigate(`/accountBook/${it.id}`)}
              key={it.id}
              className="py-4 px-4 flex items-center transition-all hover:bg-gray-100 cursor-pointer"
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
    </div>
  );
};

export default Home;
