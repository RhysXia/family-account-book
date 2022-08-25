import { gql, useMutation } from '@apollo/client';
import { Button, Form, Input, message, Modal } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import UserSelect from '@/components/UserSelect';
import { AccountBook } from '@/types';

type FormType = {
  name: string;
  desc: string;
  admins: Array<{ value: number }>;
  members: Array<{ value: number }>;
};

const CREATE_ACCOUNT_BOOK = gql`
  mutation CreateAccountBook(
    $name: String!
    $desc: String
    $adminIds: [ID!]
    $memberIds: [ID!]
  ) {
    createAccountBook(
      accountBook: {
        name: $name
        desc: $desc
        adminIds: $adminIds
        memberIds: $memberIds
      }
    ) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

const AccountBookCreate = () => {
  const [createAccountBook] = useMutation<{ createAccountBook: AccountBook }>(
    CREATE_ACCOUNT_BOOK,
  );
  const [form] = Form.useForm<FormType>();

  const navigate = useNavigate();

  const handleFinish = useCallback(
    async (value: FormType) => {
      try {
        const { data } = await createAccountBook({
          variables: {
            name: value.name,
            desc: value.desc,
            adminIds: value.admins?.map(({ value }) => value),
            memberIds: value.members?.map(({ value }) => value),
          },
        });

        if (data) {
          navigate(`/accountBooks/${data?.createAccountBook.id}`);
        }
      } catch (err) {
        message.error((err as Error).message);
      }
    },
    [navigate, createAccountBook],
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const title = (
    <>
      <h1 className="font-bold text-xl mb-2">创建新账本</h1>
      <div className="text-sm text-gray-500 ">创建一个账本</div>
    </>
  );

  return (
    <RequireAuth>
      <Modal
        visible={true}
        title={title}
        closable={false}
        footer={null}
        getContainer={false}
        closeIcon={false}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="账本名称"
            rules={[{ required: true, message: '账本名称不能为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="desc" label="账本描述">
            <Input.TextArea autoSize={{ minRows: 4 }} />
          </Form.Item>
          <Form.Item name="admins" label="管理员">
            <UserSelect />
          </Form.Item>
          <Form.Item name="members" label="普通成员">
            <UserSelect />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              提交
            </Button>
            <div className="text-right">
              <Button
                className="text-pink-500"
                type="text"
                htmlType="submit"
                onClick={handleBack}
              >
                取消 &gt;
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </RequireAuth>
  );
};

export default AccountBookCreate;
