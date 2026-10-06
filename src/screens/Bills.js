import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { Card, Chip, Title, C } from '../ui';
import { fmtDate, money } from '../calc';

export default function Bills({ bills, customers, onOpen }) {
  const [filter, setFilter] = useState('all');

  const sections = useMemo(() => {
    const map = {};
    bills.forEach((b) => {
      if (filter !== 'all' && b.customerId !== filter) return;
      (map[b.customerId] = map[b.customerId] || { id: b.customerId, title: b.customerName, data: [] }).data.push(b);
    });
    return Object.values(map)
      .map((sec) => ({ ...sec, data: sec.data.sort((a, b) => b.from.localeCompare(a.from)), total: sec.data.reduce((a, b) => a + b.totals.totalAmount, 0) }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [bills, filter]);

  const nameFor = (id) => customers.find((c) => c.id === id)?.name || bills.find((b) => b.customerId === id)?.customerName;
  const ids = [...new Set(bills.map((b) => b.customerId))];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Title>Bills</Title>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        {ids.map((id) => <Chip key={id} label={nameFor(id)} active={filter === id} onPress={() => setFilter(id)} />)}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(b) => b.id}
        ListEmptyComponent={<Text style={{ color: C.muted }}>No bills yet. Create one from the "New bill" tab.</Text>}
        renderSectionHeader={({ section }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: C.bg }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.primary }}>{section.title}</Text>
            <Text style={{ color: C.muted, fontWeight: '600' }}>Total {money(section.total)}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onOpen(item)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: C.text }}>{fmtDate(item.from)} – {fmtDate(item.to)}</Text>
                <Text style={{ color: C.muted, marginTop: 2 }}>{item.totals.totalQty} L @ {money(item.price)}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{money(item.totals.totalAmount)}</Text>
            </Card>
          </TouchableOpacity>
        )}
        stickySectionHeadersEnabled
      />
    </View>
  );
}
