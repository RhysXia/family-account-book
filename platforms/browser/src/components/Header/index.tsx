import Logo from './logo.svg';
import { Avatar, Dropdown, Menu } from 'antd';
import { useAtom } from 'jotai';
import { currentUser } from '../../store/user';
import clsx from 'clsx';
import { Link, useLocation, matchPath } from 'react-router-dom';

const navigation = [
  {
    name: '创建账本',
    href: '/dashboard/accountBook/create',
  },
];

const Header = () => {
  const [user] = useAtom(currentUser);

  const { pathname } = useLocation();

  const overlay = (
    <Menu
      className="w-36 rounded"
      items={[
        {
          key: 1,
          label: '注销',
        },
      ]}
    />
  );

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-2 max-w-full">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="logo" className="h-8 w-auto" />
            </div>
            <div className="block ml-6">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      matchPath(item.href, pathname)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'px-3 py-2 rounded-md text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="space-x-2">
            <Dropdown overlay={overlay}>
              <Avatar className="bg-indigo-500 cursor-pointer">
                {user?.username}
              </Avatar>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
