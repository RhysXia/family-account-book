import { Button, Form, Input, message, Modal } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelect from '@/components/UserSelect';
import { useCreateAccountBook } from '@/graphql/accountBook';

type FormType = {
  name: string;
  desc: string;
  admins: Array<{ value: string }>;
  members: Array<{ value: string }>;
};

const AccountBookCreate = () => {
  const [createAccountBook] = useCreateAccountBook();
  const [form] = Form.useForm<FormType>();

  const navigate = useNavigate();

  const handleFinish = useCallback(
    async (formValue: FormType) => {
      try {
        const { data } = await createAccountBook({
          variables: {
            accountBook: {
              name: formValue.name,
              desc: formValue.desc,
              adminIds: formValue.admins?.map(({ value }) => value),
              memberIds: formValue.members?.map(({ value }) => value),
            },
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
          <UserSelect multiple={true} includeSelf={true} />
        </Form.Item>
        <Form.Item name="members" label="普通成员">
          <UserSelect multiple={true} includeSelf={true} />
        </Form.Item>
        <Form.Item>
          <Button block={true} type="primary" htmlType="submit">
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
  );
};

export default AccountBookCreate;
