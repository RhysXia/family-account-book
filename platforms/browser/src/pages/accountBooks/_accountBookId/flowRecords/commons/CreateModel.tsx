import DatePicker from '@/components/DatePicker';
import { useCreateFlowRecord } from '@/graphql/flowRecord';
import useConstantFn from '@/hooks/useConstanFn';
import { currentUserAtom } from '@/store';
import { Category, CategoryType, SavingAccount, Tag, User } from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  FormRule,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModelProps = {
  visible: boolean;
  tags: Array<Tag & { category: Category }>;
  savingAccounts: Array<SavingAccount>;
  onChange: (v: boolean) => void;
  onRefrshSavingAccounts: () => Promise<void>;
  users: Array<User>;
};

const CreateModel: FC<CreateModelProps> = ({
  visible,
  tags,
  savingAccounts,
  onChange,
  onRefrshSavingAccounts,
  users,
}) => {
  const [createFlowRecord] = useCreateFlowRecord();

  const [currentUser] = useAtom(currentUserAtom);

  const [form] = Form.useForm<{
    amount: number;
    dealAt: Dayjs;
    desc: string;
    savingAccountId: string;
    tagId: string;
    traderId: string;
  }>();

  const handleCreate = useCallback(async () => {
    const { amount, dealAt, desc, savingAccountId, tagId, traderId } =
      await form.validateFields();

    await createFlowRecord({
      variables: {
        flowRecord: {
          amount,
          desc,
          savingAccountId,
          tagId,
          dealAt: dealAt.format('YYYY-MM-DD'),
          traderId,
        },
      },
    });

    form.resetFields();
    message.success('添加成功');
    await onRefrshSavingAccounts();
  }, [form, createFlowRecord, onRefrshSavingAccounts]);

  const handleClose = useConstantFn(async () => {
    onChange(false);
  });

  const handleCreateAndClose = useCallback(async () => {
    await handleCreate();
    await handleClose();
  }, [handleCreate, handleClose]);

  const amountRules: Array<FormRule> = [
    { required: true, message: '金额不能为空' },
    {
      async validator(_, value, callback) {
        const selectedTagId = form.getFieldValue('tagId');

        const selectedTag = tags.find((it) => it.id === selectedTagId);

        if (!selectedTag) {
          return;
        }

        if (
          selectedTag.category.type === CategoryType.NEGATIVE_AMOUNT &&
          value > 0
        ) {
          throw new Error('标签要求流水不能为正');
        }

        if (
          selectedTag.category.type === CategoryType.POSITIVE_AMOUNT &&
          value < 0
        ) {
          throw new Error('标签要求流水不能为负');
        }
      },
    },
  ];

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
        <Form.Item
          label="标签"
          name="tagId"
          rules={[{ required: true, message: '标签不能为空' }]}
        >
          <Select>
            {tags.map((tag) => {
              return (
                <Select.Option value={tag.id} key={tag.id}>
                  <span
                    className="inline-block leading-4 rounded px-2 py-1 text-white"
                    style={{
                      background: CategoryTypeInfoMap[tag.category.type].color,
                    }}
                  >
                    {tag.name}
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="金额"
          name="amount"
          rules={amountRules}
          dependencies={['tagId']}
        >
          <InputNumber className="w-full" placeholder="请输入金额" />
        </Form.Item>
        <Form.Item
          label="账户"
          name="savingAccountId"
          rules={[{ required: true, message: '账本不能为空' }]}
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
