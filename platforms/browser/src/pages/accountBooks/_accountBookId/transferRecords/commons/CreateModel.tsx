import DatePicker from '@/components/DatePicker';
import { useCreateTransferRecord } from '@/graphql/transferRecord';
import useConstantFn from '@/hooks/useConstanFn';
import { currentUserAtom } from '@/store';
import { SavingAccount, User } from '@/types';
import { CreditCardOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, message, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModelProps = {
  visible: boolean;
  savingAccounts: Array<SavingAccount>;
  onChange: (v: boolean) => void;
  onRefrshSavingAccounts: () => Promise<void>;
  users: Array<User>;
};

const CreateModel: FC<CreateModelProps> = ({
  visible,
  savingAccounts,
  onChange,
  onRefrshSavingAccounts,
  users,
}) => {
  const [createTransferRecord] = useCreateTransferRecord();

  const [currentUser] = useAtom(currentUserAtom);

  const [form] = Form.useForm<{
    amount: number;
    dealAt: Dayjs;
    desc: string;
    fromSavingAccountId: string;
    toSavingAccountId: string;
    traderId: string;
  }>();

  const handleCreate = useCallback(async () => {
    const {
      amount,
      dealAt,
      desc,
      fromSavingAccountId,
      toSavingAccountId,
      traderId,
    } = await form.validateFields();

    await createTransferRecord({
      variables: {
        record: {
          amount,
          desc,
          fromSavingAccountId,
          toSavingAccountId,
          dealAt: dealAt.format('YYYY-MM-DD'),
          traderId,
        },
      },
    });

    // 不清空不经常修改的字段，方便快速输入
    form.setFieldValue('amount', undefined);
    form.setFieldValue('desc', undefined);

    message.success('添加成功');
    await onRefrshSavingAccounts();
  }, [form, createTransferRecord, onRefrshSavingAccounts]);

  const handleClose = useConstantFn(async () => {
    onChange(false);
    // 关闭的时候，清空
    form.resetFields();
  });

  const handleCreateAndClose = useCallback(async () => {
    await handleCreate();
    await handleClose();
  }, [handleCreate, handleClose]);

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      title="添加流水"
      footer={
        <>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={handleCreate}>
            保存并继续
          </Button>
          <Button type="primary" onClick={handleCreateAndClose}>
            保存并关闭
          </Button>
        </>
      }
    >
      <Form
        labelCol={{
          span: 4,
        }}
        form={form}
        initialValues={{
          trader: {
            label: currentUser?.nickname,
            value: currentUser,
          },
          dealAt: dayjs(),
        }}
      >
        <Form.Item label="金额" name="amount">
          <InputNumber min={0.01} className="w-full" placeholder="请输入金额" />
        </Form.Item>
        <Form.Item
          label="原账户"
          name="fromSavingAccountId"
          rules={[{ required: true, message: '账户不能为空' }]}
        >
          <Select>
            {savingAccounts.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">
                    <CreditCardOutlined />
                    <span className="pl-2">
                      {it.name}(¥{it.amount})
                    </span>
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="目标账户"
          name="toSavingAccountId"
          rules={[{ required: true, message: '账户不能为空' }]}
        >
          <Select>
            {savingAccounts.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">
                    <CreditCardOutlined />
                    <span className="pl-2">
                      {it.name}(¥{it.amount})
                    </span>
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="交易时间"
          name="dealAt"
          rules={[{ required: true, message: '交易时间不能为空' }]}
        >
          <DatePicker className="w-full" clearIcon={false} />
        </Form.Item>
        <Form.Item
          label="交易人员"
          name="traderId"
          rules={[{ required: true, message: '交易人员不能为空' }]}
        >
          <Select className="w-full">
            {users.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">{it.nickname}</span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea autoSize={{ minRows: 3 }} placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModel;
