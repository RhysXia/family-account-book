import useConstantFn from '@/hooks/useConstanFn';
import { Input } from 'antd';
import {
  FC,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type RenderProps<T = any> = {
  value: T;
  onChange: (value: T) => void;
  index: number;
  isEdit: boolean;
};

export type Render = (data: RenderProps) => ReactNode;

export type Column = {
  title: string;
  width?: number;
  render?: Render;
  dataIndex?: string;
  key?: string;
};

export type TableProps = {
  columns: Array<Column>;
  editable?: boolean;
  data: Array<any>;
  onEditSubmit?: (value: any) => void;
};

const Table: FC<TableProps> = ({ columns, data, editable, onEditSubmit }) => {
  const handleEditSubmit = useCallback(
    (value: any, dataIndex: string | undefined, row: any) => {
      if (dataIndex === undefined) {
        return onEditSubmit?.({ ...row, ...value });
      }

      return onEditSubmit?.({ ...row, [dataIndex]: value });
    },
    [onEditSubmit],
  );

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
            <div className="table-row" key={index}>
              {columns.map((column, subIndex) => {
                const { width, dataIndex, key } = column;
                const value = dataIndex === undefined ? it : it[dataIndex];
                return (
                  <EditRow
                    key={key ? it[key] : subIndex}
                    column={column}
                    value={value}
                    editable={editable}
                    index={index}
                    onSubmit={(v) => handleEditSubmit(v, dataIndex, it)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table;

const DEFAULT_RENDER: Render = ({ value, onChange, isEdit }) => {
  if (isEdit) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return <span>{value}</span>;
};

const EditRow: FC<{
  column: Column;
  editable?: boolean;
  value: any;
  onSubmit: (value: any) => void;
  index: number;
}> = ({ value: initialValue, column, editable, index, onSubmit }) => {
  const { width, render = DEFAULT_RENDER } = column;

  const [isEdit, setEdit] = useState(false);

  const isSelfClick = useRef(false);

  const [value, setValue] = useState(initialValue);

  const handleDoubleClick = useCallback(() => {
    if (editable) {
      setEdit(true);
    }
  }, [editable]);

  const handleClick = useCallback(() => {
    isSelfClick.current = true;
    setTimeout(() => {
      isSelfClick.current = false;
    });
  }, []);

  const handleValueChange = useConstantFn((value: any) => {
    if (isEdit) {
      setValue(value);
    }
  });

  const handleReset = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setValue(initialValue);
        setEdit(false);
      }
    },
    [initialValue],
  );

  const handleClickOutside = useConstantFn(() => {
    if (isSelfClick.current) {
      return;
    }
    if (isEdit) {
      setEdit(false);
      onSubmit?.(value);
    }
  });

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      className="table-cell p-2"
      style={{ width }}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onKeyDown={handleReset}
    >
      {render({ value, onChange: handleValueChange, isEdit, index })}
    </div>
  );
};
