import Logo from './logo.svg';
import { Avatar } from 'antd';

const Header = () => {
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="logo" className="h-8 w-auto" />
            </div>
          </div>
          <div>
            <Avatar>logo</Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
