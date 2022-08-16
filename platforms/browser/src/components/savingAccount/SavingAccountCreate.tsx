import { gql, useMutation } from '@apollo/client';
import { Form, Input, InputNumber, Modal, ModalProps } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';
import { activeAccountBookAtom } from '../../store';
import { SavingAccount } from '../../types';

const CREATE_SAVING_ACCOUNT = gql`
  mutation (
    $name: String!
    $desc: String
    $amount: Float!
    $accountBookId: Int!
  ) {
    createSavingAccount(
      savingAccount: {
        name: $name
        desc: $desc
        amount: $amount
        accountBookId: $accountBookId
      }
    ) {
      id
      name
      desc
      amount
      createdAt
      updatedAt
    }
  }
`;

const SavingAccountCreate: FC<ModalProps> = (props) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createSavingAccount] = useMutation<{
    createSavingAccount: SavingAccount;
  }>(CREATE_SAVING_ACCOUNT);

  const { onOk, ...others } = props;

  const [form] = Form.useForm();

  const title = <h1 className="font-bold text-xl mb-2">新建储蓄账户</h1>;

  const handleOk: typeof onOk = useCallback(
    async (e) => {
      await form.validateFields();
      await createSavingAccount({
        ...form.getFieldsValue(),
        accountBookId: activeAccountBook?.id,
      });
      onOk?.(e);
    },
    [onOk, form, activeAccountBook, createSavingAccount],
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
        <Form.Item label="描述" name="desc">
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

export default SavingAccountCreate;
