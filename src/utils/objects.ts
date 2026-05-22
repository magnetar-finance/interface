// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDictionaryFromArray<T extends Record<string, any>>(arr: T[], s: keyof T) {
  return arr.reduce(
    (previous, current) => {
      const isString = typeof current[s] === 'string';
      const key = isString ? current[s].toLowerCase() : current[s];
      return {
        ...previous,
        [key]: current,
      };
    },
    {} as { [key: string | number]: T },
  );
}
