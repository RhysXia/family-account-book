import { FC, HTMLAttributes } from 'react';
import { Column } from './Cell';
import Row from './Row';
import { getProp } from './utils';
import clsx from 'clsx';

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  columns: Array<Column>;
  editable?: boolean;
  data: Array<any>;
  onEditSubmit?: (row: any) => Promise<void>;
  index?: string;
};

const Table: FC<TableProps> = ({
  columns,
  data,
  editable = false,
  onEditSubmit,
  index,
  className,
  ...others
}) => {
  return (
    <div
      {...others}
      className={clsx('table w-full rounded border-collapse', className)}
    >
      <div className="table-header-group bg-slate-200 font-bold">
        {columns.map(({ style, title }, i) => {
          return (
            <div key={i} className="table-cell p-2" style={style}>
              {title}
            </div>
          );
        })}
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
  );
};

export default Table;
