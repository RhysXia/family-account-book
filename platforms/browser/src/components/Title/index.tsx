import clsx from 'clsx';
import { FC, HTMLAttributes, ReactNode } from 'react';
import style from './style.module.less';

export type TitleProps = HTMLAttributes<HTMLDivElement> & {
  extra: ReactNode;
};

const Title: FC<TitleProps> = ({ extra, className, children, ...others }) => {
  return (
    <div
      {...others}
      className={clsx(
        'bg-white p-2 rounded flex items-center justify-between drop-shadow flex-wrap',
        className,
      )}
    >
      <span className="text-gray-800 font-bold text-lg">{children}</span>
      <div className={clsx('flex items-center flex-wrap', style.extra)}>
        {extra}
      </div>
    </div>
  );
};

export default Title;
