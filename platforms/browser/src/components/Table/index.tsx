import { FC } from 'react';
import { Column } from './Cell';
import Row from './Row';

export type TableProps = {
  columns: Array<Column>;
  editable?: boolean;
  data: Array<any>;
  onEditSubmit?: (row: any) => Promise<void>;
};

const Table: FC<TableProps> = ({
  columns,
  data,
  editable = false,
  onEditSubmit,
}) => {
  return (
    <div className="table w-full rounded overflow-hidden border-collapse">
      <div className="table-header-group bg-slate-200 font-bold">
        {columns.map(({ width, title }, index) => {
          return (
            <div key={index} className="table-cell p-2" style={{ width }}>
              {title}
            </div>
          );
        })}
      </div>
      <div className="table-row-group">
        {data.map((it, index) => {
          return (
            <Row
              columns={columns}
              data={it}
              index={index}
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
