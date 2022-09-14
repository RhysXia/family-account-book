import { Button, Input, Modal } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { Category, Tag as ITag } from '@/types';
import { fromTime } from '@/utils/dayjs';
import { useGetTagsWithCategory } from '@/graphql/useGetTags';
import useDeleteTag from '@/graphql/useDeleteTag';
import Content from '@/components/Content';
import CreateModal from './commons/CreateModal';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import useUpdateTag from '@/graphql/useUpdateTag';
import usePagination from '@/hooks/usePage';
import { CategoryTypeInfoMap } from '@/utils/constants';

const TagPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { getPagination, limit, offset } = usePagination();

  const { data, refetch } = useGetTagsWithCategory({
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

  const [deleteTag] = useDeleteTag();
  const [updateTag] = useUpdateTag();

  const handleEdit = useCallback(
    async (tag: ITag) => {
      const { id, name, desc } = tag;

      await updateTag({
        variables: {
          tag: {
            id,
            name,
            desc,
          },
        },
      });
    },
    [updateTag],
  );

  const handleCreateCancelled = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  const handleCreated = useCallback(async () => {
    await refetch();
    setCreateModalVisible(false);
  }, [refetch]);

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteTag = useCallback(
    async (id: string) => {
      await deleteTag({
        variables: {
          id,
        },
      });
      await refetch();
    },
    [deleteTag, refetch],
  );

  const columns: Array<Column> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '10%',
      render({ value, onChange, isEdit }: RenderProps<string>) {
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
      title: '描述',
      dataIndex: 'desc',
      width: '20%',
      render({ value, onChange, isEdit }: RenderProps<string>) {
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
      title: '所属分类',
      dataIndex: 'category',
      width: '15%',
      render({ value }: RenderProps<Category>) {
        return (
          <span
            className="inline-block leading-4 rounded px-2 py-1 text-white"
            style={{
              background: CategoryTypeInfoMap[value.type].color,
            }}
          >
            {value.name}
          </span>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator.nickname',
      width: '10%',
      render({ value }: RenderProps<string>) {
        return value;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '15%',
      render({ value }: RenderProps<string>) {
        return fromTime(value);
      },
    },
    {
      title: '操作',
      width: '20%',
      render({ value }: RenderProps<ITag>) {
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
                  content: '确认删除该标签吗？',
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

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '标签列表',
    },
  ];

  return (
    <Content
      breadcrumbs={breadcrumbs}
      pagination={data && getPagination(data.node.tags.total)}
      title="标签列表"
      action={
        <Button type="primary" onClick={handleCreateButton}>
          新建
        </Button>
      }
    >
      <Table
        onEditSubmit={handleEdit}
        index="id"
        editable={true}
        columns={columns}
        data={data?.node.tags.data || []}
      />
      <CreateModal
        visible={createModalVisible}
        onCancelled={handleCreateCancelled}
        onCreated={handleCreated}
      />
    </Content>
  );
};

export default TagPage;
