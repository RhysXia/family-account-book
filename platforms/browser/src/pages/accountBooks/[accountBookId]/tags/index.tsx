import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Form, Input, Modal, Select, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '../../../../store';
import { PaginationResult, Tag as ITag, TagType } from '../../../../types';

const GET_TAGS = gql`
  query ($accountBookId: Int!) {
    getAuthTagsByAccountBookId(
      accountBookId: $accountBookId
      pagination: { orderBy: { field: "updatedAt", direction: DESC } }
    ) {
      data {
        id
        name
        type
        createdAt
        updatedAt
        updater {
          id
          username
        }
      }
    }
  }
`;

const CREATE_TAG = gql`
  mutation ($name: String!, $type: TagType!, $accountBookId: Int!) {
    createTag(
      tag: { name: $name, type: $type, accountBookId: $accountBookId }
    ) {
      id
      name
      type
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TAG = gql`
  mutation Mutation($tagId: Int!) {
    deleteTag(id: $tagId)
  }
`;

const TagPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [form] = Form.useForm();

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { data, refetch } = useQuery<{
    getAuthTagsByAccountBookId: PaginationResult<ITag>;
  }>(GET_TAGS, {
    variables: {
      accountBookId: activeAccountBook?.id,
    },
  });

  const [createTag] = useMutation<{
    createTag: ITag;
  }>(CREATE_TAG);

  const [deleteTag] = useMutation<{ tagId: number }>(DELETE_TAG);

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createTag({
      variables: {
        ...form.getFieldsValue(),
        accountBookId: activeAccountBook?.id,
      },
    });

    await refetch();

    setCreateModalVisible(false);
    form.resetFields();
  }, [form, refetch, activeAccountBook, createTag]);

  const handleCancel = useCallback(() => {
    setCreateModalVisible(false);
    form.resetFields();
  }, [form]);

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteTag = useCallback(
    async (id: number) => {
      await deleteTag({
        variables: {
          tagId: id,
        },
      });
      await refetch();
    },
    [deleteTag, refetch],
  );

  const TagNameColorMap = {
    [TagType.INCOME]: {
      name: '收入',
      color: 'green',
    },
    [TagType.EXPENDITURE]: {
      name: '支出',
      color: 'red',
    },
    [TagType.LOAD]: {
      name: '借贷',
      color: 'blue',
    },
    [TagType.INVESTMENT]: {
      name: '投资',
      color: 'purple',
    },
  };

  const columns: ColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render(type: TagType) {
        const { name, color } = TagNameColorMap[type];
        return <Tag color={color}>{name}</Tag>;
      },
    },
    {
      title: '操作',
      render(record: ITag) {
        return (
          <div className="space-x-4">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                navigate(`${record.id}`);
              }}
            >
              详情
            </Button>
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确认删除该标签吗？',
                  onOk: async () => {
                    await handleDeleteTag(record.id);
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

  const title = <h1 className="font-bold text-xl mb-2">新建标签</h1>;

  return (
    <div className="w-full">
      <div className="bg-white flex flex-row items-center justify-between p-4 mb-4">
        <div></div>
        <div className="">
          <Button type="primary" onClick={handleCreateButton}>
            新建
          </Button>
        </div>
      </div>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data?.getAuthTagsByAccountBookId.data.map((it) => ({
          ...it,
          key: it.id,
        }))}
      />
      <Modal
        visible={createModalVisible}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} labelCol={{ span: 3 }}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '名称不能为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select>
              <Select.Option value="INCOME">收入</Select.Option>
              <Select.Option value="EXPENDITURE">支出</Select.Option>
              <Select.Option value="INVESTMENT">投资</Select.Option>
              <Select.Option value="LOAD">借贷</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagPage;
