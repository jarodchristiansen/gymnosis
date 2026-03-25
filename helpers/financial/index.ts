import { FormatUnixTime } from "../formatters/time";

type FinancialPoint = Record<string, unknown>;

function appendIf<T>(
  row: FinancialPoint,
  predicate: (r: FinancialPoint) => boolean,
  build: (r: FinancialPoint) => T,
  bucket: T[]
) {
  if (predicate(row)) {
    bucket.push(build(row));
  }
}

export const processFinancialHistory = (financialData: FinancialPoint[]) => {
  const market_dominance: Array<{
    market_dominance: unknown;
    time: string;
  }> = [];
  const volatility: Array<{ volatility: unknown; time: string }> = [];
  const volume: Array<{
    volumeTo: unknown;
    volumeFrom: unknown;
    time: string;
  }> = [];
  const highs: unknown[] = [];
  const lows: unknown[] = [];
  const closes: Array<{
    close: unknown;
    time: string;
    low: unknown;
    high: unknown;
  }> = [];
  const percent_change: Array<{ percent_change: unknown; time: string }> = [];
  const price_btc: Array<{ price_btc: unknown; time: string }> = [];

  for (const row of financialData) {
    appendIf(
      row,
      (i) => Boolean(i?.market_dominance),
      (i) => ({
        market_dominance: i.market_dominance,
        time: FormatUnixTime(i.time),
      }),
      market_dominance
    );
    appendIf(
      row,
      (i) => Boolean(i?.volatility),
      (i) => ({
        volatility: i.volatility,
        time: FormatUnixTime(i.time),
      }),
      volatility
    );
    appendIf(
      row,
      (i) => Boolean(i.volumeto && i.volumefrom),
      (i) => ({
        volumeTo: i.volumeto,
        volumeFrom: i.volumefrom,
        time: FormatUnixTime(i.time),
      }),
      volume
    );
    appendIf(
      row,
      (i) => Boolean(i?.percent_change_24h),
      (i) => ({
        percent_change: i.percent_change_24h,
        time: FormatUnixTime(i.time),
      }),
      percent_change
    );
    appendIf(
      row,
      (i) => Boolean(i?.close),
      (i) => ({
        close: i.close,
        time: FormatUnixTime(i.time),
        low: i.low,
        high: i.high,
      }),
      closes
    );
    appendIf(
      row,
      (i) => Boolean(i?.price_btc),
      (i) => ({
        price_btc: i.price_btc,
        time: FormatUnixTime(i.time),
      }),
      price_btc
    );
    if (row?.high) {
      highs.push(row.high);
    }
    if (row?.low) {
      lows.push(row.low);
    }
  }

  return {
    market_dominance,
    volatility,
    volume,
    highs,
    lows,
    closes,
    percent_change,
    price_btc,
  };
};
