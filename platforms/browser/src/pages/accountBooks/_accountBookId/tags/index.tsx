import { Button, Input, Modal, Select, Tag } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { Category, Tag as ITag } from '@/types';
import { fromTime } from '@/utils/dayjs';
import Content from '@/components/Content';
import CreateModal from './commons/CreateModal';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import usePagination from '@/hooks/usePage';
import { CategoryTypeInfoMap } from '@/utils/constants';
import {
  useDeleteTag,
  useGetTagsWithCategoryByAccountBookId,
  useUpdateTag,
} from '@/graphql/tag';
import { useGetCategoryListByAccountBookId } from '@/graphql/category';

const TagPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { data: categoryData } = useGetCategoryListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    pagination: {
      orderBy: [
        {
          field: 'order',
          direction: 'DESC',
        },
        {
          field: 'createdAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const [categoryIdFilter, setCategoryIdFilter] = useState<string>();

  const navigate = useNavigate();

  const { getPagination, limit, offset, setPage } = usePagination();

  const handleCategoryIdChange = useCallback(
    (id: string) => {
      setPage(1);
      setCategoryIdFilter(id);
    },
    [setPage],
  );

  const { data } = useGetTagsWithCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId: categoryIdFilter,
    },
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'category.order',
          direction: 'DESC',
        },
        {
          field: 'order',
          direction: 'DESC',
        },
      ],
    },
  });

  const [deleteTag] = useDeleteTag();
  const [updateTag] = useUpdateTag();

  const handleEdit = useCallback(
    async (tag: ITag & { category: Category }) => {
      const { id, name, desc, category } = tag;

      await updateTag({
        variables: {
          tag: {
            id,
            name,
            desc,
            categoryId: category.id,
          },
        },
        disableMessage: true,
      });
    },
    [updateTag],
  );

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
    },
    [deleteTag],
  );

  const columns: Array<Column> = [
    {
      title: '名称',
      dataIndex: 'name',
      style: {
        minWidth: '10%',
      },
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
      style: {
        minWidth: '15%',
      },
      render({ value, onChange, isEdit }: RenderProps<Category>) {
        if (isEdit) {
          return (
            <Select
              className="w-full"
              value={value.id}
              onChange={(v) =>
                onChange(categoryData!.data.find((it) => it.id === v)!)
              }
              showSearch={true}
              optionFilterProp="name"
            >
              {categoryData?.data.map((it) => (
                <Select.Option value={it.id} key={it.id} name={it.name}>
                  <Tag color={CategoryTypeInfoMap[it.type].color}>
                    {it.name}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          );
        }
        return (
          <Tag color={CategoryTypeInfoMap[value.type].color}>{value.name}</Tag>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'createdBy.nickname',
      style: {
        minWidth: '10%',
      },
      render({ value }: RenderProps<string>) {
        return value;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      style: {
        minWidth: '15%',
      },
      render({ value }: RenderProps<string>) {
        return fromTime(value);
      },
    },
    {
      title: '操作',
      style: {
        minWidth: '15%',
      },
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
      title="标签列表"
      action={
        <Button type="primary" onClick={handleCreateButton}>
          新建
        </Button>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-end">
          <Select
            value={categoryIdFilter}
            onChange={handleCategoryIdChange}
            style={{ width: 200 }}
            allowClear={true}
            placeholder="请选择分类"
            showSearch={true}
            optionFilterProp="name"
          >
            {categoryData?.data.map((it) => (
              <Select.Option value={it.id} key={it.id} name={it.name}>
                <Tag color={CategoryTypeInfoMap[it.type].color}>{it.name}</Tag>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table
            onEditSubmit={handleEdit}
            index="id"
            editable={true}
            columns={columns}
            data={data?.data || []}
            pagination={data && getPagination(data.total)}
          />
        </div>
      </div>
      <CreateModal
        visible={createModalVisible}
        onChange={setCreateModalVisible}
      />
    </Content>
  );
};

export default TagPage;
