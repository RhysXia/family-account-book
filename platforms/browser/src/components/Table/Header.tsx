import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import HeaderCell from './HeaderCell';
import { Column } from './type';

export type HeaderProps = HTMLAttributes<HTMLDivElement> & {
  columns: Array<Column>;
};

const Header: FC<HeaderProps> = ({ columns, className, ...others }) => {
  return (
    <div
      {...others}
      className={clsx('table-header-group bg-slate-200 font-bold', className)}
    >
      {columns.map(
        (
          { style, className: _className, headerClassName, headerStyle, title },
          i,
        ) => {
          return (
            <HeaderCell
              key={i}
              className={clsx(headerClassName || _className)}
              style={headerStyle || style}
              title={title}
            />
          );
        },
      )}
    </div>
  );
};

export default Header;
