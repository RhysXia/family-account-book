import Logo from './logo.svg';
import { Avatar, Dropdown, Menu } from 'antd';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';

const Header = () => {
  const [currentUser] = useAtom(currentUserAtom);

  const navigate = useNavigate();

  const overlay = (
    <Menu
      className="w-36 rounded"
      onClick={(info) => {
        switch (info.key) {
          case 'switch-account-book': {
            navigate('/');
            break;
          }
        }
      }}
      items={[
        {
          key: 'switch-account-book',
          label: '切换账本',
        },
        {
          key: 2,
          label: '注销',
        },
      ]}
    />
  );

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-6 max-w-full">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="logo" className="h-8 w-auto mr-2" />
              <h1 className="text-white font-bold text-xl leading-none m-0 ">
                FAC
              </h1>
            </div>
            <div className="block ml-6">
              <div className="flex space-x-4"></div>
            </div>
          </div>
          <div className="space-x-2">
            <Dropdown overlay={overlay}>
              <Avatar className="bg-indigo-500 cursor-pointer">
                {currentUser?.username}
              </Avatar>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
