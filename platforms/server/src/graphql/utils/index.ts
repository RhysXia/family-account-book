import { ParameterException } from '../../exception/ServiceException';

export enum EntityName {
  DETAIL_USER = 'DetailUser',
  USER = 'User',
  ACCOUNT_BOOK = 'AccountBook',
  ACCOUNT_BOOK_STATISTICS = 'AccountBookStatistics',
  CATEGORY = 'Category',
  CATEGORY_STATISTICS = 'CategoryStatistics',
  SAVING_ACCOUNT = 'SavingAccount',
  SAVING_ACCOUNT_HISTORY = 'SavingAccountHistory',
  FLOW_RECORD = 'FlowRecord',
  TAG = 'Tag',
  SAVING_ACCOUNT_TRANSFER_RECORD = 'SavingAccountTransferRecord',
}

export const encodeId = (name: EntityName, id: number) => {
  return Buffer.from(`${name}:${id}`).toString('base64');
};

export const getIdInfo = (value: string) => {
  const [name, id] = Buffer.from(value, 'base64').toString('ascii').split(':');

  if (!name || !id) {
    throw new ParameterException('id 不正确');
  }

  return {
    name: name as EntityName,
    id: +id,
  };
};

export const decodeId = (name: EntityName, id: string) => {
  const { name: nameValue, id: idValue } = getIdInfo(id);

  if (nameValue !== name) {
    throw new ParameterException('id 不正确');
  }

  return idValue;
};
