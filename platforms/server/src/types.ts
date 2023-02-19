export type PrefixKey<K, P extends string> = K extends string | number
  ? `${P}_${K}`
  : K;

export type PrefixWrapper<
  O,
  P extends string,
  K extends keyof O = keyof O,
> = Record<PrefixKey<K, P>, O[K]>;
