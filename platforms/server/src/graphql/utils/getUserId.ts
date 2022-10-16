import { EntityName, getIdInfo } from '.';
import { ParameterException } from '../../exception/ServiceException';

export const getUserId = (str: string) => {
  const { name, id } = getIdInfo(str);

  if (name === EntityName.USER || name === EntityName.DETAIL_USER) {
    return id;
  }

  throw new ParameterException('id 不正确');
};
