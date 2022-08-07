export const omit = <O, P extends keyof O, R = Omit<O, P>>(
  obj: O,
  ...props: Array<P>
): R => {
  const newObj = {} as R;
  for (const key in obj) {
    if (!props.includes(key as unknown as P)) {
      newObj[key as unknown as string] = obj[key];
    }
  }
  return newObj;
};
