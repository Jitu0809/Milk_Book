import { fmtDate, dayName, money } from './calc';

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const q = (n) => `${Math.round(n * 1000) / 1000} L`;

export function billHtml(b, full = false) {
  const t = b.totals;
  const rowFor = (d) => {
      const label = d.status === 'skipped' ? 'Skipped' : d.status === 'changed' ? 'Changed' : 'Delivered';
      const color = d.status === 'skipped' ? '#9aa39e' : d.status === 'changed' ? '#b5731a' : '#23302b';
      return `<tr style="color:${color}"><td>${fmtDate(d.date)}</td><td>${dayName(d.date)}</td><td>${label}</td><td class="r">${q(d.qty)}</td><td class="r">${money(d.amount)}</td></tr>`;
  };
  const head = '<tr><th>Date</th><th>Day</th><th>Status</th><th class="r">Quantity</th><th class="r">Amount</th></tr>';
  const changedDays = b.days.filter((d) => d.status === 'changed');
  const changedBlock = changedDays.length
    ? `<h3>Days with different quantity (regular: ${q(b.defaultQty)}/day)</h3><table class="days">${head}${changedDays.map(rowFor).join('')}</table>`
    : '';
  const fullBlock = full
    ? `<h3>All days</h3><table class="days">${head}${b.days.map(rowFor).join('')}</table>`
    : '';
  const skipList = b.skips.length
    ? b.skips.map((r) => (r.from === r.to ? fmtDate(r.from) : `${fmtDate(r.from)} – ${fmtDate(r.to)}`)).join(', ')
    : 'None';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{font-family:Helvetica,Arial,sans-serif;color:#23302b;padding:28px;font-size:12px}
h1{margin:0;font-size:26px;color:#2e6a57} .sub{color:#7a857f;margin-top:2px}
.head{display:flex;justify-content:space-between;border-bottom:3px solid #2e6a57;padding-bottom:12px;margin-bottom:16px}
.meta td{padding:3px 14px 3px 0} .meta td:first-child{color:#7a857f}
table.days{width:100%;border-collapse:collapse;margin-top:6px} h3{font-size:13px;color:#2e6a57;margin:18px 0 0}
table.days th{background:#2e6a57;color:#fff;text-align:left;padding:7px;font-size:11px}
table.days td{padding:6px 7px;border-bottom:1px solid #e4dccb}
.r{text-align:right} th.r{text-align:right}
.sum{margin-top:18px;margin-left:auto;width:55%;border:2px solid #2e6a57;border-radius:8px;padding:10px 14px}
.sum div{display:flex;justify-content:space-between;padding:3px 0}
.total{font-size:18px;font-weight:bold;border-top:1px solid #2e6a57;margin-top:6px;padding-top:8px!important;color:#2e6a57}
.note{margin-top:14px;color:#555;line-height:1.5}
</style></head><body>
<div class="head"><div><h1>Milk Bill</h1><div class="sub">Bill No: ${esc(b.id.slice(-6).toUpperCase())}</div></div>
<div style="text-align:right"><div class="sub">Generated on</div><div>${fmtDate(new Date(b.createdAt).toISOString().slice(0, 10))}</div></div></div>
<table class="meta">
<tr><td>Customer</td><td><b>${esc(b.customerName)}</b></td></tr>
<tr><td>Period</td><td>${fmtDate(b.from)} to ${fmtDate(b.to)}</td></tr>
<tr><td>Rate per litre</td><td>${money(b.price)}</td></tr>
<tr><td>Regular quantity</td><td>${q(b.defaultQty)} per day</td></tr>
<tr><td>Skipped days</td><td>${skipList}</td></tr>
</table>
${changedBlock}
${fullBlock}
<div class="sum">
<div><span>Total days in period</span><span>${b.days.length}</span></div>
<div><span>Days delivered</span><span>${t.delivered}</span></div>
<div><span>Days skipped</span><span>${t.skipped}</span></div>
<div><span>Total milk</span><span>${q(t.totalQty)}</span></div>
<div class="total"><span>Total payable</span><span>${money(t.totalAmount)}</span></div>
</div>
<p class="note">Thank you!</p>
</body></html>`;
}
