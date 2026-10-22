import { cache } from 'react';
import { parseForex } from './forex-data';
export const getForexSnapshot = cache(async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
    if (!response.ok) return parseForex(null);
    return parseForex(await response.json());
  } catch { return parseForex(null); }
});
