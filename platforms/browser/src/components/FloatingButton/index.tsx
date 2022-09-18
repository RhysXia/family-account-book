import { Tooltip } from 'antd';
import { FC, ReactNode, useState } from 'react';

export type FloatingButtonProps = {
  icon: ReactNode;
  children: ReactNode;
};

const FloatingButton: FC<FloatingButtonProps> = ({ icon, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      getPopupContainer={(trigger) => trigger.parentElement!}
      visible={visible}
      title={children}
      placement="leftBottom"
      overlayInnerStyle={{ padding: 0 }}
      showArrow={false}
    >
      <div
        onClick={() => setVisible((prev) => !prev)}
        className="text-xl shadow-xl bg-indigo-500 rounded-full  w-11 h-11 text-white flex items-center justify-center border hover:bg-indigo-400 cursor-pointer transition-all"
      >
        {icon}
      </div>
    </Tooltip>
  );
};

export default FloatingButton;
