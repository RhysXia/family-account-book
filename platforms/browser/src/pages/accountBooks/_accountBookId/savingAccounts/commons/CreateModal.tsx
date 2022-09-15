import {
  CreateSavingAccountInput,
  useCreateSavingAccount,
} from '@/graphql/savingAccount';
import { activeAccountBookAtom } from '@/store';
import { Modal, Form, Input, InputNumber } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModalProps = {
  visible: boolean;
  onChange: (v: boolean) => void;
};

const CreateModal: FC<CreateModalProps> = ({ visible, onChange }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [form] =
    Form.useForm<Omit<CreateSavingAccountInput, 'accountBookId'>>();
  const [createSavingAccount] = useCreateSavingAccount();

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createSavingAccount({
      variables: {
        savingAccount: {
          ...form.getFieldsValue(),
          accountBookId: activeAccountBook!.id,
        },
      },
    });

    onChange(false);

    form.resetFields();
  }, [form, onChange, activeAccountBook, createSavingAccount]);

  const handleCancel = useCallback(() => {
    onChange(false);
    form.resetFields();
  }, [form, onChange]);

  const title = <h1 className="font-bold text-xl mb-2">新建账户</h1>;

  return (
    <Modal
      visible={visible}
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
        <Form.Item
          label="余额"
          name="amount"
          rules={[{ required: true, message: '金额不能为空' }]}
        >
          <InputNumber
            min={0.01}
            addonBefore="￥"
            precision={2}
            className="w-full"
          />
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
