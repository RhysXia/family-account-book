import { Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useConstantFn from './useConstanFn';

export type PaginationProps = {
  defaultSize?: number;
};

const usePagination = ({
  defaultSize: defaultPageSize = 20,
}: PaginationProps = {}) => {
  const [params, setParams] = useSearchParams();

  const [page, setPage] = useState(() => +(params.get('page') || 1));
  const [pageSize, setPageSize] = useState(
    +(params.get('pageSize') || defaultPageSize),
  );

  const handlePaginationChange = useConstantFn(
    (newPage: number, newPageSize: number) => {
      params.set('page', '' + newPage);
      params.set('pageSize', '' + newPageSize);
      setParams(params);
    },
  );

  useEffect(() => {
    handlePaginationChange(page, pageSize);
  }, [page, pageSize, handlePaginationChange]);

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    page,
    pageSize,
    setPage,
    setPageSize,
    getPagination: (total: number) => (
      <Pagination
        current={page}
        onChange={setPage}
        onShowSizeChange={(_, size) => setPageSize(size)}
        pageSize={pageSize}
        total={total}
        showSizeChanger={true}
        showTotal={(t) => <span>共{t}条</span>}
        responsive={true}
      />
    ),
  };
};

export default usePagination;
