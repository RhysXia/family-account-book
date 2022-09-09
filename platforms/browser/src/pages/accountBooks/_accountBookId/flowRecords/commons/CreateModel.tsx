import DatePicker from '@/components/DatePicker';
import UserSelect from '@/components/UserSelect';
import useConstantFn from '@/hooks/useConstanFn';
import { currentUserAtom } from '@/store';
import { SavingAccount, Tag, User, TagType } from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation } from '@apollo/client';
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
import { FC, useCallback, useState } from 'react';

const CREATE_FLOW_RECORD = gql`
  mutation CreateFlowRecord($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

export type CreateModelProps = {
  visible: boolean;
  tags: Array<Tag>;
  savingAccounts: Array<SavingAccount>;
  onCreated: () => Promise<void>;
  onCancelled: () => void;
};

const CreateModel: FC<CreateModelProps> = ({
  visible,
  tags,
  savingAccounts,
  onCreated,
  onCancelled,
}) => {
  const [createFlowRecord] = useMutation(CREATE_FLOW_RECORD);

  const [currentUser] = useAtom(currentUserAtom);

  const [isCreated, setCreated] = useState(false);

  const [form] = Form.useForm<{
    amount: number;
    dealAt: Dayjs;
    desc: string;
    savingAccountId: string;
    tagId: string;
    trader: {
      lable: string;
      value: User;
    };
  }>();

  const handleDoCreate = useCallback(async () => {
    try {
      const { amount, dealAt, desc, savingAccountId, tagId, trader } =
        await form.validateFields();

      await createFlowRecord({
        variables: {
          flowRecord: {
            amount,
            desc,
            savingAccountId,
            tagId,
            dealAt: dealAt.format('YYYY-MM-DD'),
            traderId: trader.value.id,
          },
        },
      });

      setCreated(true);
      message.success('添加成功');
      form.resetFields();
    } catch (e) {
      console.log(e);
    }
  }, [form, createFlowRecord]);

  const handleClose = useConstantFn(async (forceFetch?: boolean) => {
    if (isCreated || forceFetch) {
      await onCreated();
    } else {
      onCancelled();
    }
    setCreated(false);
    form.resetFields();
  });

  const handleCreateAndClose = useCallback(async () => {
    await handleDoCreate();
    await handleClose(true);
  }, [handleDoCreate, handleClose]);

  const amountRules: Array<FormRule> = [
    { required: true, message: '金额不能为空' },
    {
      async validator(_, value, callback) {
        const selectedTagId = form.getFieldValue('tagId');

        const selectedTag = tags.find((it) => it.id === selectedTagId);

        if (!selectedTag) {
          return;
        }

        if (selectedTag.type === TagType.EXPENDITURE && value > 0) {
          throw new Error('支出需要为负数');
        }

        if (selectedTag.type === TagType.INCOME && value < 0) {
          throw new Error('收入需要为正数');
        }
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      onCancel={() => handleClose()}
      title="添加流水"
      footer={
        <>
          <Button onClick={() => handleClose()}>取消</Button>
          <Button type="primary" onClick={handleDoCreate}>
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
                    style={{ background: TagColorMap[tag.type].color }}
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
          name="trader"
          rules={[{ required: true, message: '交易人员不能为空' }]}
        >
          <UserSelect includeSelf={true} />
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea autoSize={{ minRows: 3 }} placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModel;
