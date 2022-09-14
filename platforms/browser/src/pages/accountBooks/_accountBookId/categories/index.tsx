import { Button, Input, Modal, Tag } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { Category, CategoryType, User } from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { fromTime } from '@/utils/dayjs';

import useGetCategories from '@/graphql/useGetCategories';
import CreateModal from './commons/CreateModal';
import usePagination from '@/hooks/usePage';
import Content from '@/components/Content';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import useUpdateCategory from '@/graphql/useUpdateCategory';
import useDeleteCategory from '@/graphql/useDeleteCategory';

const CategoryPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { getPagination, limit, offset } = usePagination();

  const { data, refetch } = useGetCategories({
    accountBookId: activeAccountBook!.id,
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'createdAt',
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

  const handleCreateCancelled = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  const handleCreated = useCallback(async () => {
    await refetch();
    setCreateModalVisible(false);
  }, [refetch]);

  const handleDeleteTag = useCallback(
    async (id: string) => {
      await deleteCategory({
        variables: {
          id,
        },
      });
      await refetch();
    },
    [deleteCategory, refetch],
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
      width: '15%',
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
      title: '类型',
      width: '15%',
      dataIndex: 'type',
      render({ value }: RenderProps<CategoryType>) {
        const { text, color } = CategoryTypeInfoMap[value];

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '描述',
      width: '25%',
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
      dataIndex: 'creator',
      width: '10%',
      render({ value }: { value: User }) {
        return value.nickname;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '15%',
      render({ value }) {
        return fromTime(value);
      },
    },
    {
      title: '操作',
      width: '20%',
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
                  content: '确认删除该分类吗？',
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

  const pagination = data && getPagination(data.node.categories.total);

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
      <Table
        editable={true}
        columns={columns}
        data={data?.node.categories.data || []}
        onEditSubmit={handleEdit}
      />
      <CreateModal
        visible={createModalVisible}
        onCancelled={handleCreateCancelled}
        onCreated={handleCreated}
      />
    </Content>
  );
};

export default CategoryPage;
