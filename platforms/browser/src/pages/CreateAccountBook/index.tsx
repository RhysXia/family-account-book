import { Button, Form, Input, message } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAccountBook } from '../../api/accountBook';
import UserSelect from '../../components/UserSelect';

type FormType = {
  name: string;
  desc: string;
  admins: Array<{ value: number }>;
  members: Array<{ value: number }>;
};

const CreateAccountBook = () => {
  const [form] = Form.useForm<FormType>();

  const navigate = useNavigate();

  const handleFinish = useCallback(
    async (value: FormType) => {
      try {
        const { id } = await createAccountBook({
          name: value.name,
          desc: value.desc,
          adminIds: value.admins.map(({ value }) => value),
          memberIds: value.members.map(({ value }) => value),
        });

        navigate(`/accoutBook/${id}`);
      } catch (err) {
        message.error((err as Error).message);
      }
    },
    [navigate],
  );

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      <div
        className="shadow-lg rounded-lg overflow-hidden bg-white divide-y divide-gray-200"
        style={{
          width: 600,
        }}
      >
        <div className="py-4 px-4">
          <h1 className="font-bold text-xl mb-2">创建新账本</h1>
          <div className="text-sm text-gray-500 ">创建一个账本</div>
        </div>
        <div className="py-4 px-4">
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item
              name="name"
              label="账本名称"
              rules={[{ required: true, message: '账本名称不能为空' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="desc"
              label="账本描述"
              rules={[{ required: true, message: '账本描述不能为空' }]}
            >
              <Input.TextArea />
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
        </div>
      </div>
    </div>
  );
};

export default CreateAccountBook;
