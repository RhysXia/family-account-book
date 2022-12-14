import { Button, Input, Modal, Select } from 'antd';
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
          field: 'type',
          direction: 'ASC',
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
          field: 'createdAt',
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
      title: '??????',
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
      title: '??????',
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
      title: '????????????',
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
                  <span
                    className="inline-block leading-4 rounded px-2 py-1 text-white"
                    style={{
                      background: CategoryTypeInfoMap[it.type].color,
                    }}
                  >
                    {it.name}
                  </span>
                </Select.Option>
              ))}
            </Select>
          );
        }
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
      title: '?????????',
      dataIndex: 'creator.nickname',
      style: {
        minWidth: '10%',
      },
      render({ value }: RenderProps<string>) {
        return value;
      },
    },
    {
      title: '????????????',
      dataIndex: 'createdAt',
      style: {
        minWidth: '15%',
      },
      render({ value }: RenderProps<string>) {
        return fromTime(value);
      },
    },
    {
      title: '??????',
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
              ??????
            </Button>
            <Button
              size="small"
              type="primary"
              danger={true}
              onClick={() => {
                Modal.confirm({
                  title: '????????????',
                  content: '???????????????????????????',
                  onOk: async () => {
                    await handleDeleteTag(value.id);
                  },
                });
              }}
            >
              ??????
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
      name: '????????????',
    },
  ];

  return (
    <Content
      breadcrumbs={breadcrumbs}
      pagination={data && getPagination(data.total)}
      title="????????????"
      action={
        <Button type="primary" onClick={handleCreateButton}>
          ??????
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
            placeholder="???????????????"
            showSearch={true}
            optionFilterProp="name"
          >
            {categoryData?.data.map((it) => (
              <Select.Option value={it.id} key={it.id} name={it.name}>
                <span
                  className="inline-block leading-4 rounded px-2 py-1 text-white"
                  style={{
                    background: CategoryTypeInfoMap[it.type].color,
                  }}
                >
                  {it.name}
                </span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <Table
          onEditSubmit={handleEdit}
          index="id"
          editable={true}
          columns={columns}
          data={data?.data || []}
        />
      </div>
      <CreateModal
        visible={createModalVisible}
        onChange={setCreateModalVisible}
      />
    </Content>
  );
};

export default TagPage;
