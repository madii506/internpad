// Reads the stocks on the intern's list from Yahoo Finance's public chart endpoint (last price, previous close, today's 15-minute closes).
// If Yahoo refuses the server, the response says so and carries the last snapshot the intern saw, stamped with its date — never a made-up number.
const LIST = ['NVDA','AAPL','TSLA','META','COIN','AMD','MSFT','AMZN','HOOD','GOOGL'];
const NAMES = { NVDA:'NVIDIA', AAPL:'Apple', TSLA:'Tesla', META:'Meta', COIN:'Coinbase', AMD:'AMD', MSFT:'Microsoft', AMZN:'Amazon', HOOD:'Robinhood', GOOGL:'Alphabet' };
// snapshot read 2026-09-18 after the close (regularMarketPrice, chartPreviousClose, last five daily closes)
const SNAP = {
  NVDA:[222.27,218.29,[210.96,212.17,213.9,219.34,222.27]],
  TSLA:[364.27,365.44,[358.97,356.58,358.08,366.2,364.27]],
  AAPL:[336.13,332.27,[333.08,331.34,332.41,337,336.13]],
  AMZN:[253.71,256.78,[253.54,248.42,245.96,251.19,253.71]],
  META:[665.75,648.03,[665.6,670.24,673.31,682.31,665.75]],
  MSFT:[493.78,495.63,[505.41,497.12,490.3,497.75,493.78]],
  COIN:[194.25,175.26,[191.45,172.11,164.51,173.97,194.25]],
  AMD:[559.82,516.13,[493.41,504.2,512.5,545.09,559.82]],
  HOOD:[119.82,112.57,[114.33,110.45,104.42,109.81,119.82]],
  GOOGL:[349.54,338.5,[349.39,344.98,342.87,347.33,349.54]],
};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function yahoo(tk) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${tk}?range=1d&interval=15m`, { headers: { 'user-agent': UA, accept: 'application/json' } });
  if (!r.ok) throw new Error('yahoo ' + r.status);
  const j = await r.json(); const res = j.chart && j.chart.result && j.chart.result[0];
  if (!res || !res.meta) throw new Error('no result');
  const closes = ((res.indicators && res.indicators.quote && res.indicators.quote[0] && res.indicators.quote[0].close) || []).filter(x => x != null).map(x => +x.toFixed(2));
  return { price: res.meta.regularMarketPrice, prev: res.meta.chartPreviousClose, closes, t: res.meta.regularMarketTime };
}

export default async function handler(req, res) {
  const want = String((req.query && req.query.t) || '').toUpperCase().split(',').filter(t => LIST.includes(t));
  const tks = want.length ? want : LIST;
  const quotes = {}; let live = 0; let latest = 0;
  await Promise.all(tks.map(async tk => {
    try { const q = await yahoo(tk); quotes[tk] = { ...q, name: NAMES[tk], live: true }; live++; latest = Math.max(latest, q.t || 0); }
    catch (e) { const s = SNAP[tk]; quotes[tk] = { price: s[0], prev: s[1], closes: s[2], name: NAMES[tk], live: false, asof: '2026-09-18' }; }
  }));
  res.setHeader('cache-control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ ok: true, list: LIST, quotes, live, of: tks.length, via: live ? 'Yahoo Finance chart API' : 'snapshot 2026-09-18 (Yahoo refused the server read)', t: latest || null });
}
