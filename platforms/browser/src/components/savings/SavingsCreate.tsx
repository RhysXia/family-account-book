import { Form, Input, InputNumber, Modal, ModalProps } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';
import { createSavingAccount } from '../../api';
import { activeAccountBook } from '../../store/accountBook';

const SavingCreate: FC<ModalProps> = (props) => {
  const [accountBook] = useAtom(activeAccountBook);

  const { onOk, ...others } = props;

  const [form] = Form.useForm();

  const title = <h1 className="font-bold text-xl mb-2">新建储蓄类型</h1>;

  const handleOk: typeof onOk = useCallback(
    async (e) => {
      await form.validateFields();
      await createSavingAccount({
        ...form.getFieldsValue(),
        accountBookId: accountBook?.id,
      });
      onOk?.(e);
    },
    [onOk, form, accountBook],
  );

  return (
    <Modal {...others} title={title} onOk={handleOk}>
      <Form form={form}>
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: '名称不能为空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="描述"
          name="desc"
          rules={[{ required: true, message: '描述不能为空' }]}
        >
          <Input.TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>
        <Form.Item
          label="余额"
          name="amount"
          rules={[{ required: true, message: '金额不能为空' }]}
        >
          <InputNumber addonBefore="￥" precision={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SavingCreate;
