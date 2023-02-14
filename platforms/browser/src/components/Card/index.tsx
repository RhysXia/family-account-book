import { FC, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  children: ReactNode;
};

const Card: FC<CardProps> = ({ title, children, className, ...others }) => {
  return (
    <div
      {...others}
      className={clsx(
        'bg-white p-2 rounded flex flex-col hover:shadow transition',
        className,
      )}
    >
      <div className="text-gray-800 text-lg py-2 border-gray-200 border-b">
        {title}
      </div>
      <div className="py-2 w-full flex-1">{children}</div>
    </div>
  );
};

export default Card;
