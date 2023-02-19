import { FC, HTMLAttributes, ReactNode } from 'react';
import { Column } from './Cell';
import Row from './Row';
import { getProp } from './utils';
import clsx from 'clsx';

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  columns: Array<Column>;
  editable?: boolean;
  data: Array<any>;
  onEditSubmit?: (row: any) => Promise<void>;
  pagination?: ReactNode;
  index?: string;
};

const Table: FC<TableProps> = ({
  columns,
  data,
  editable = false,
  onEditSubmit,
  index,
  className,
  pagination,
  ...others
}) => {
  return (
    <>
      <div
        {...others}
        className={clsx(
          'table w-full rounded border-collapse whitespace-nowrap',
          className,
        )}
      >
        <div className="table-header-group bg-slate-200 font-bold">
          {columns.map(
            (
              {
                style,
                className: _className,
                headerClassName,
                headerStyle,
                title,
              },
              i,
            ) => {
              return (
                <div
                  key={i}
                  className={clsx(
                    'table-cell p-2',
                    headerClassName || _className,
                  )}
                  style={headerStyle || style}
                >
                  {title}
                </div>
              );
            },
          )}
        </div>
        <div className="table-row-group">
          {data.map((it, i) => {
            const acutalKey = index ? getProp(it, index) || i : i;
            return (
              <Row
                key={acutalKey}
                columns={columns}
                data={it}
                index={i}
                editable={editable}
                onSubmit={onEditSubmit}
              />
            );
          })}
        </div>
      </div>
      {pagination && (
        <div className="p-2 rounded text-center md:text-right">
          {pagination}
        </div>
      )}
    </>
  );
};

export default Table;
