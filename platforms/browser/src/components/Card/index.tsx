import { FC, HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  children: ReactNode;
};

const Card: FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white p-2 rounded">
      <div className="text-gray-800 text-lg div">{title}</div>
      <div>{children}</div>
    </div>
  );
};

export default Card;
