export function splitString(str: string, splitLength: number = 4) {
  const firstPart = str.slice(0, splitLength + 1);
  const secondPart = str.slice(str.length - (splitLength + 1), str.length);
  return firstPart + '...' + secondPart;
}
