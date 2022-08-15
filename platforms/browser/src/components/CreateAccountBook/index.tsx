import { gql, useMutation } from '@apollo/client';
import { Button, Form, Input, message, Modal } from 'antd';
import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelect from '../../components/UserSelect';
import { AccountBook } from '../../types';

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
    $adminIds: [Int!]
    $memberIds: [Int!]
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

export type CreateAccountBookProps = {
  visible?: boolean;
  onVisible?: (visible: boolean) => void;
};

const CreateAccountBook: FC<CreateAccountBookProps> = ({
  visible,
  onVisible,
}) => {
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
          navigate(`/accoutBook/${data?.createAccountBook.id}`);
        }
      } catch (err) {
        message.error((err as Error).message);
      }
    },
    [navigate, createAccountBook],
  );

  const title = (
    <>
      <h1 className="font-bold text-xl mb-2">创建新账本</h1>
      <div className="text-sm text-gray-500 ">创建一个账本</div>
    </>
  );

  return (
    <Modal
      visible={visible}
      title={title}
      closable={true}
      footer={null}
      onCancel={() => onVisible?.(false)}
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
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAccountBook;