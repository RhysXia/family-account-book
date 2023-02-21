import { FC, HTMLAttributes, ReactNode } from 'react';
import Row from './Row';
import { getProp } from './utils';
import clsx from 'clsx';
import { Column } from './type';
import Header from './Header';

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
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <div
          {...others}
          className={clsx(
            'table min-w-full rounded border-collapse whitespace-nowrap',
            className,
          )}
        >
          <Header columns={columns} />
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
      </div>
      {pagination && (
        <div className="p-2 rounded text-center md:text-right">
          {pagination}
        </div>
      )}
    </div>
  );
};

export default Table;
