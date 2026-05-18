export function isValidNonZeroNumberString(numberString: string) {
  const valueAsNumber = Number(numberString);
  return !isNaN(valueAsNumber) && valueAsNumber > 0;
}

function replaceZerosWithSubscript(str: string) {
  return str.replace(/0{4,}/g, (match) => {
    const count = match.length;
    const subscriptDigits: { [key: string]: string } = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
    };
    const subscriptCount = count
      .toString()
      .split('')
      .map((d) => subscriptDigits[d])
      .join('');
    return `0${subscriptCount}`;
  });
}

export function formatNumber(
  num: number | string,
  locales: Intl.LocalesArgument = 'en-US',
  maximumFracts: number = 3,
  inUSD: boolean = false,
) {
  if (typeof num === 'string') num = parseFloat(num);

  const opts: Intl.NumberFormatOptions = {};

  opts.trailingZeroDisplay = 'stripIfInteger';
  opts.maximumFractionDigits = maximumFracts;
  opts.maximumSignificantDigits = 6;
  opts.notation = 'compact';
  opts.compactDisplay = 'short';
  opts.useGrouping = num < 1000000000000;

  if (inUSD) {
    opts.style = 'currency';
    opts.currency = 'USD';
  }

  return replaceZerosWithSubscript(new Intl.NumberFormat(locales, opts).format(num));
}
