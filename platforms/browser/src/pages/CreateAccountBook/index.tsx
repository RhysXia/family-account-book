import { Button, Form, Input, message, Modal } from 'antd';
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

  const title = (
    <>
      <h1 className="font-bold text-xl mb-2">创建新账本</h1>
      <div className="text-sm text-gray-500 ">创建一个账本</div>
    </>
  );

  return (
    <Modal
      title={title}
      visible={true}
      maskStyle={{ backgroundColor: '#F3F4F6' }}
      closable={false}
      footer={null}
      getContainer={false}
    >
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
