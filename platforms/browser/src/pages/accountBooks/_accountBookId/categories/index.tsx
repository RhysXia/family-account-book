import { Button, Input, Modal, Select, Tag } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { Category, CategoryType, User } from '@/types';
import { CategoryTypeInfoMap, CategoryTypes } from '@/utils/constants';
import { fromTime } from '@/utils/dayjs';

import CreateModal from './commons/CreateModal';
import usePagination from '@/hooks/usePage';
import Content from '@/components/Content';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import {
  useDeleteCategory,
  useGetCategoryListByAccountBookId,
  useUpdateCategory,
} from '@/graphql/category';

const CategoryPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { getPagination, limit, offset, setPage } = usePagination();

  const [categoryTypeFilter, setCategoryTypeFilter] = useState<CategoryType>();

  const handleCategoryTypeChange = useCallback(
    (type: CategoryType) => {
      setPage(1);
      setCategoryTypeFilter(type);
    },
    [setPage],
  );

  const { data } = useGetCategoryListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      type: categoryTypeFilter,
    },
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'order',
          direction: 'DESC',
        },
      ],
    },
  });

  const [updateCategory] = useUpdateCategory();

  const [deleteCategory] = useDeleteCategory();

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteTag = useCallback(
    async (id: string) => {
      await deleteCategory({
        variables: {
          id,
        },
      });
    },
    [deleteCategory],
  );

  const handleEdit = useCallback(
    async ({ id, name, desc }: Category) => {
      await updateCategory({
        variables: {
          category: {
            id,
            name,
            desc,
          },
        },
      });
    },
    [updateCategory],
  );

  const columns: Array<Column> = [
    {
      title: '名称',
      dataIndex: 'name',
      style: {
        minWidth: '15%',
      },
      render({ value, isEdit, onChange }: RenderProps<string>) {
        if (isEdit) {
          return (
            <Input
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        }
        return <span className="p-2">{value}</span>;
      },
    },
    {
      title: '用途',
      style: {
        minWidth: '15%',
      },
      dataIndex: 'type',
      render({ value }: RenderProps<CategoryType>) {
        const { text, color } = CategoryTypeInfoMap[value];

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render({ value, isEdit, onChange }: RenderProps<string>) {
        if (isEdit) {
          return (
            <Input
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        }
        return <span className="p-2">{value}</span>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      style: {
        minWidth: '10%',
      },
      render({ value }: { value: User }) {
        return value.nickname;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      style: {
        minWidth: '10%',
      },
      render({ value }) {
        return fromTime(value);
      },
    },
    {
      title: '操作',
      style: {
        minWidth: '15%',
      },
      render({ value }: { value: Category }) {
        return (
          <div className="space-x-4">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                navigate(`${value.id}`);
              }}
            >
              详情
            </Button>
            <Button
              size="small"
              type="primary"
              danger={true}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content:
                    '删除分类会同步删除分类下的标签和流水记录，确认删除该分类吗？',
                  onOk: async () => {
                    await handleDeleteTag(value.id);
                  },
                });
              }}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  const pagination = data && getPagination(data.total);

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '分类列表',
    },
  ];

  return (
    <Content
      title="分类列表"
      breadcrumbs={breadcrumbs}
      action={
        <Button type="primary" onClick={handleCreateButton}>
          新建
        </Button>
      }
      pagination={pagination}
    >
      <div className="space-y-2">
        <div className="flex justify-end">
          <Select
            style={{ width: 200 }}
            placeholder="请选择用途"
            value={categoryTypeFilter}
            onChange={handleCategoryTypeChange}
            allowClear={true}
          >
            {CategoryTypes.map((type) => {
              return (
                <Select.Option key={type} value={type}>
                  <span
                    className="inline-block leading-4 rounded px-2 py-1 text-white"
                    style={{
                      background: CategoryTypeInfoMap[type].color,
                    }}
                  >
                    {CategoryTypeInfoMap[type].text}
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </div>
        <Table
          editable={true}
          columns={columns}
          data={data?.data || []}
          onEditSubmit={handleEdit}
        />
      </div>
      <CreateModal
        visible={createModalVisible}
        onChange={setCreateModalVisible}
      />
    </Content>
  );
};

export default CategoryPage;
