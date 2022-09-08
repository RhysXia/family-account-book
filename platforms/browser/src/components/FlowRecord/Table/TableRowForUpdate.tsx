import { FC } from 'react';
import { FlowRecordForCreate } from './TableRowForCreate';

export type FlowRecordForUpdate = FlowRecordForCreate & {
  id: string;
};

export type TableRowForUpdateProps = {};

const TableRowForUpdate: FC<TableRowForUpdateProps> = ({}) => {
    
};

export default TableRowForUpdate;
