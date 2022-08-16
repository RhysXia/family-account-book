import { gql, useMutation } from '@apollo/client';
import { Form, Input, InputNumber, Modal } from 'antd';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '../../../../store';
import { SavingAccount } from '../../../../types';

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

const SavingAccountCreate = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const [createSavingAccount] = useMutation<{
    createSavingAccount: SavingAccount;
  }>(CREATE_SAVING_ACCOUNT);

  const [form] = Form.useForm();

  const title = <h1 className="font-bold text-xl mb-2">新建储蓄账户</h1>;

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createSavingAccount({
      ...form.getFieldsValue(),
      accountBookId: activeAccountBook?.id,
    });
    navigate(-1);
  }, [form, activeAccountBook, createSavingAccount, navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Modal
      visible={true}
      closable={false}
      getContainer={false}
      title={title}
      onOk={handleOk}
      onCancel={handleCancel}
    >
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