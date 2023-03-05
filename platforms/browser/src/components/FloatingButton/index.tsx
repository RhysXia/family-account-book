import { Tooltip } from 'antd';
import { FC, MouseEvent, ReactNode, useCallback, useState } from 'react';

export type FloatingButtonProps = {
  icon: ReactNode;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
};

const FloatingButton: FC<FloatingButtonProps> = ({
  icon,
  children,
  onClick,
}) => {
  const [visible, setVisible] = useState(false);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      setVisible((prev) => !prev);
    },
    [onClick],
  );

  return (
    <Tooltip
      getPopupContainer={(trigger) => trigger.parentElement!}
      visible={!!children && visible}
      title={children}
      placement="leftBottom"
      overlayInnerStyle={{ padding: 0 }}
      showArrow={false}
    >
      <div
        onClick={handleClick}
        className="text-xl shadow-xl bg-indigo-500 rounded-full  w-11 h-11 text-white flex items-center justify-center border hover:bg-indigo-400 cursor-pointer transition-all"
      >
        {icon}
      </div>
    </Tooltip>
  );
};

export default FloatingButton;
