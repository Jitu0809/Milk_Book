export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const CURRENCY = '₹';

export const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const fmtDate = (s) => {
  const d = fromISO(s);
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const dayName = (s) => DAYS[fromISO(s).getDay()];
export const num = (s) => {
  const n = parseFloat(String(s).replace(',', '.'));
  return isNaN(n) ? 0 : n;
};
export const money = (n) => `${CURRENCY}${(Math.round(n * 100) / 100).toFixed(2)}`;
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const inRange = (iso, r) => iso >= r.from && iso <= r.to;

/**
 * skips:   [{from, to}]            -> no milk on these days
 * changes: [{from, to, qty}]       -> different quantity on these days
 */
export function calculate({ from, to, price, defaultQty, skips = [], changes = [] }) {
  const days = [];
  if (!from || !to || from > to) return { days, totalQty: 0, totalAmount: 0, delivered: 0, skipped: 0 };
  const cur = fromISO(from);
  const end = fromISO(to);
  let totalQty = 0, delivered = 0, skipped = 0;
  while (cur <= end) {
    const iso = toISO(cur);
    let status = 'normal';
    let qty = defaultQty;
    if (skips.some((r) => inRange(iso, r))) {
      status = 'skipped';
      qty = 0;
      skipped++;
    } else {
      for (const c of changes) {
        if (inRange(iso, c)) {
          qty = c.qty;
          status = 'changed';
        }
      }
      if (qty > 0) delivered++;
    }
    const amount = Math.round(qty * price * 100) / 100;
    totalQty += qty;
    days.push({ date: iso, status, qty, amount });
    cur.setDate(cur.getDate() + 1);
  }
  const totalAmount = Math.round(totalQty * price * 100) / 100;
  return { days, totalQty: Math.round(totalQty * 1000) / 1000, totalAmount, delivered, skipped };
}
