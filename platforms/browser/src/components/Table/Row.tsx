import useConstantFn from '@/hooks/useConstanFn';
import { message } from 'antd';
import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import Cell, { Column } from './Cell';

export type RowProps = {
  columns: Array<Column>;
  data: any;
  index: number;
  editable: boolean;
  onSubmit?: (value: any) => Promise<void>;
};

const Row: FC<RowProps> = ({
  columns,
  data: initalData,
  index,
  editable,
  onSubmit,
}) => {
  const [isEdit, setEdit] = useState(false);

  const [data, setData] = useState(initalData);

  const rowRef = useRef<HTMLDivElement>(null);

  const isSelfClick = useRef(false);

  useEffect(() => {
    setData(initalData);
  }, [initalData]);

  const handleEdit = useCallback(() => {
    if (!editable) {
      return;
    }
    setEdit(true);
  }, [editable]);

  const handleClick = useCallback(() => {
    isSelfClick.current = true;
    setTimeout(() => {
      isSelfClick.current = false;
    });
  }, []);

  const handleClickOutside = useCallback(() => {
    if (isSelfClick.current) {
      return;
    }
    setEdit(false);
    setData(initalData);
  }, [initalData]);

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleKeyDown = useConstantFn(async (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape': {
        setEdit(false);
        setData(initalData);
        break;
      }
      case 'Enter': {
        try {
          await onSubmit?.(data);
          setEdit(false);
        } catch (err) {
          message.error((err as Error).message || (err as any).toString());
        }
      }
    }
  });

  return (
    <div
      className="table-row"
      ref={rowRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {columns.map((column, subIndex) => {
        const { key } = column;
        return (
          <Cell
            key={key ? data[key] : subIndex}
            column={column}
            row={data}
            isEdit={isEdit}
            index={index}
            onChange={setData}
            onEdit={handleEdit}
          />
        );
      })}
    </div>
  );
};

export default Row;
