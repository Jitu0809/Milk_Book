import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Btn, Card, Chip, DateField, Input, Label, Title, C } from '../ui';
import { calculate, fmtDate, money, num, toISO, uid } from '../calc';

const rangeText = (r) => (r.from === r.to ? fmtDate(r.from) : `${fmtDate(r.from)} – ${fmtDate(r.to)}`);

function RangeAdder({ periodFrom, periodTo, withQty, onAdd, addLabel }) {
  const [f, setF] = useState(periodFrom);
  const [t, setT] = useState(periodFrom);
  const [qty, setQty] = useState('');
  useEffect(() => { setF(periodFrom); setT(periodFrom); }, [periodFrom]);

  const add = () => {
    if (f > t) return Alert.alert('"From" date is after "To" date');
    if (f < periodFrom || t > periodTo) return Alert.alert('Dates must be inside the billing period');
    if (withQty && qty.trim() === '') return Alert.alert('Enter the quantity for these days');
    onAdd(withQty ? { from: f, to: t, qty: num(qty) } : { from: f, to: t });
    setQty('');
  };
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <DateField label="From" value={f} onChange={(v) => { setF(v); if (v > t) setT(v); }} />
        <View style={{ width: 10 }} />
        <DateField label="To" value={t} onChange={setT} />
      </View>
      {withQty && (
        <>
          <Label>Litres per day on these days</Label>
          <Input keyboardType="decimal-pad" value={qty} onChangeText={setQty} placeholder="e.g. 2" />
        </>
      )}
      <Btn title={addLabel} kind="ghost" onPress={add} style={{ marginTop: 10 }} />
    </View>
  );
}

const Tag = ({ text, onRemove }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.primarySoft, borderRadius: 10, padding: 10, marginTop: 8 }}>
    <Text style={{ flex: 1, color: C.text }}>{text}</Text>
    <TouchableOpacity onPress={onRemove}><Text style={{ color: C.danger, fontWeight: '800', fontSize: 16 }}>✕</Text></TouchableOpacity>
  </View>
);

export default function NewBill({ customers, price, onSetDefaultPrice, onSave }) {
  const now = new Date();
  const [cid, setCid] = useState(customers[0]?.id);
  const [from, setFrom] = useState(toISO(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  const [priceTxt, setPriceTxt] = useState(price ? String(price) : '');
  const [qtyTxt, setQtyTxt] = useState('1');
  const [skips, setSkips] = useState([]);
  const [changes, setChanges] = useState([]);

  const customer = customers.find((c) => c.id === cid);
  useEffect(() => { if (!customer && customers[0]) setCid(customers[0].id); }, [customers]);
  useEffect(() => { if (customer) setQtyTxt(String(customer.defaultQty)); }, [cid]);
  useEffect(() => { if (price) setPriceTxt(String(price)); }, [price]);

  const p = num(priceTxt);
  const dq = num(qtyTxt);
  const result = useMemo(
    () => calculate({ from, to, price: p, defaultQty: dq, skips, changes }),
    [from, to, p, dq, skips, changes]
  );

  if (customers.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Title>New bill</Title>
        <Text style={{ color: C.muted, fontSize: 16 }}>Add at least one user in the "Users" tab first.</Text>
      </View>
    );
  }

  const valid = customer && from <= to && p > 0;

  const save = () => {
    const bill = {
      id: uid(), createdAt: Date.now(),
      customerId: customer.id, customerName: customer.name,
      from, to, price: p, defaultQty: dq, skips, changes,
      days: result.days,
      totals: { totalQty: result.totalQty, totalAmount: result.totalAmount, delivered: result.delivered, skipped: result.skipped },
    };
    onSave(bill);
    setSkips([]); setChanges([]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Title>New bill</Title>

      <Card>
        <Label>Bill for</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {customers.map((c) => <Chip key={c.id} label={c.name} active={c.id === cid} onPress={() => setCid(c.id)} />)}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <DateField label="Delivered from" value={from} onChange={(v) => { setFrom(v); if (v > to) setTo(v); setSkips([]); setChanges([]); }} />
          <View style={{ width: 10 }} />
          <DateField label="Delivered to" value={to} onChange={(v) => { setTo(v); setSkips([]); setChanges([]); }} />
        </View>
        {from > to && <Text style={{ color: C.danger, marginTop: 6 }}>"From" must be before "To"</Text>}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Label>Price per litre ({'₹'})</Label>
            <Input keyboardType="decimal-pad" value={priceTxt} onChangeText={setPriceTxt} placeholder="e.g. 60" />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Label>Regular litres / day</Label>
            <Input keyboardType="decimal-pad" value={qtyTxt} onChangeText={setQtyTxt} />
          </View>
        </View>
        <TouchableOpacity onPress={() => { if (p > 0) { onSetDefaultPrice(p); Alert.alert('Saved', `${money(p)} is now the default price.`); } }}>
          <Text style={{ color: C.primary, fontWeight: '700', marginTop: 10 }}>
            {price === p ? '✓ This is the default price' : 'Save this as the default price'}
          </Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Label>Skipped days (no milk)</Label>
        <RangeAdder periodFrom={from} periodTo={to} addLabel="+ Add skipped day(s)" onAdd={(r) => setSkips([...skips, r])} />
        {skips.map((r, i) => <Tag key={i} text={`Skipped: ${rangeText(r)}`} onRemove={() => setSkips(skips.filter((_, j) => j !== i))} />)}
      </Card>

      <Card>
        <Label>Days with different quantity</Label>
        <RangeAdder periodFrom={from} periodTo={to} withQty addLabel="+ Add quantity change" onAdd={(r) => setChanges([...changes, r])} />
        {changes.map((r, i) => <Tag key={i} text={`${rangeText(r)}: ${r.qty} L/day`} onRemove={() => setChanges(changes.filter((_, j) => j !== i))} />)}
      </Card>

      <Card style={{ backgroundColor: C.primary, borderColor: C.primary }}>
        <Text style={{ color: '#CFE6DA', fontWeight: '700' }}>CALCULATED</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', marginVertical: 4 }}>{money(result.totalAmount)}</Text>
        <Text style={{ color: '#E8F3EC' }}>
          {result.totalQty} L · {result.delivered} days delivered · {result.skipped} skipped
        </Text>
      </Card>

      <Btn title="Save bill" onPress={save} disabled={!valid} />
      {!(p > 0) && <Text style={{ color: C.muted, marginTop: 8 }}>Enter the milk price to continue.</Text>}
    </ScrollView>
  );
}
