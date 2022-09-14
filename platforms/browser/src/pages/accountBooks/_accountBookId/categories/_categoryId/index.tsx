import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  TableColumnsType,
} from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { Tag as ITag, TagType, User } from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { fromTime } from '@/utils/dayjs';
import useGetTags from '@/graphql/useGetTags';
import useCreateTag, { CreateTagInput } from '@/graphql/useCreateTag';
import useDeleteTag from '@/graphql/useDeleteTag';

const TagPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [form] = Form.useForm<Omit<CreateTagInput, 'accountBookId'>>();

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { data, refetch } = useGetTags({
    accountBookId: activeAccountBook!.id,
  });

  const [createTag] = useCreateTag();

  const [deleteTag] = useDeleteTag();

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createTag({
      variables: {
        ...form.getFieldsValue(),
        accountBookId: activeAccountBook!.id,
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

  const columns: TableColumnsType<any> = [
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
        const { text, color } = CategoryTypeInfoMap[type];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      render(creator: User) {
        return creator.nickname;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render(createdAt: string) {
        return fromTime(createdAt);
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
              danger={true}
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
        dataSource={data?.node.tags.data.map((it) => ({
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
