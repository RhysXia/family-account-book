// import { CaretUpOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';

export type HeaderCellProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
};

const HeaderCell: FC<HeaderCellProps> = ({
  style,
  className,
  title,
  ...others
}) => {
  return (
    <div {...others} className={clsx('table-cell p-2', className)}>
      {title}
      {/* <span>
        <CaretUpOutlined />
      </span> */}
    </div>
  );
};

export default HeaderCell;
