export const getProp = (value: any, path?: string) => {
  if (!path) {
    return value;
  }
  const paths = path.split('.');
  let ret = value;
  paths.forEach((p) => {
    ret = ret[p];
  });

  return ret;
};

export const mergeProp = (obj: any, v: any, path?: string) => {
  if (!path) {
    return v;
  }

  const paths = (path || '').split('.');

  const ret = { ...obj };

  let temp = ret;

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];

    if (i < paths.length - 1) {
      temp[p] = { ...temp[p] };
    } else {
      temp[p] = v;
    }

    temp = temp[p];
  }

  return ret;
};
