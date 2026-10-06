import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Btn, Card, C } from '../ui';
import { billHtml } from '../billHtml';
import { dayName, fmtDate, money } from '../calc';

const Row = ({ a, b, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
    <Text style={{ color: C.muted }}>{a}</Text>
    <Text style={{ color: C.text, fontWeight: bold ? '800' : '600' }}>{b}</Text>
  </View>
);

const DayRow = ({ d }) => {
  const color = d.status === 'skipped' ? C.muted : d.status === 'changed' ? '#B5731A' : C.text;
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderColor: C.border }}>
      <Text style={{ flex: 2, color }}>{fmtDate(d.date)} {dayName(d.date)}</Text>
      <Text style={{ flex: 1, color, textAlign: 'right' }}>{d.status === 'skipped' ? 'Skipped' : `${d.qty} L`}</Text>
      <Text style={{ flex: 1, color, textAlign: 'right' }}>{money(d.amount)}</Text>
    </View>
  );
};

export default function BillDetail({ bill, onBack, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const savePdf = async () => {
    try {
      setBusy(true);
      const { uri } = await Print.printToFileAsync({ html: billHtml(bill, showAll) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Milk bill' });
      } else {
        Alert.alert('PDF created', uri);
      }
    } catch (e) {
      Alert.alert('Could not create PDF', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const print = async () => {
    try { await Print.printAsync({ html: billHtml(bill, showAll) }); } catch (e) {}
  };

  const del = () =>
    Alert.alert('Delete this bill?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(bill.id) },
    ]);

  const t = bill.totals;
  const changed = bill.days.filter((d) => d.status === 'changed');
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Btn title="‹ Back" kind="ghost" onPress={onBack} style={{ alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 8 }} />
      <Card>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text }}>{bill.customerName}</Text>
        <Text style={{ color: C.muted, marginBottom: 10 }}>{fmtDate(bill.from)} – {fmtDate(bill.to)}</Text>
        <Row a="Rate per litre" b={money(bill.price)} />
        <Row a="Regular quantity" b={`${bill.defaultQty} L / day`} />
        <Row a="Days delivered" b={t.delivered} />
        <Row a="Days skipped" b={t.skipped} />
        <Row a="Total milk" b={`${t.totalQty} L`} />
        <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
        <Row a="Total payable" b={money(t.totalAmount)} bold />
      </Card>

      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: C.text }}>Show all days</Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>Also applies to the PDF and print</Text>
        </View>
        <Switch value={showAll} onValueChange={setShowAll} trackColor={{ true: C.primary }} />
      </Card>

      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Btn title={busy ? 'Please wait…' : 'Save / Share PDF'} onPress={savePdf} disabled={busy} style={{ flex: 1 }} />
        <Btn title="Print" kind="ghost" onPress={print} style={{ marginLeft: 10 }} />
      </View>

      {changed.length > 0 && (
        <Card>
          <Text style={{ fontWeight: '800', color: C.text, marginBottom: 8 }}>Days with different quantity</Text>
          {changed.map((d) => <DayRow key={d.date} d={d} />)}
        </Card>
      )}

      {showAll && (
        <Card>
          <Text style={{ fontWeight: '800', color: C.text, marginBottom: 8 }}>All days</Text>
          {bill.days.map((d) => <DayRow key={d.date} d={d} />)}
        </Card>
      )}
      <Btn title="Delete bill" kind="danger" onPress={del} />
    </ScrollView>
  );
}
