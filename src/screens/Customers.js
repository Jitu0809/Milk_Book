import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Btn, Card, Input, Label, Title, C } from '../ui';
import { num, uid } from '../calc';

export default function Customers({ customers, onChange }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [editId, setEditId] = useState(null);

  const reset = () => { setName(''); setQty('1'); setEditId(null); };

  const submit = () => {
    if (!name.trim()) return Alert.alert('Enter a name');
    const item = { id: editId || uid(), name: name.trim(), defaultQty: num(qty) };
    onChange(editId ? customers.map((c) => (c.id === editId ? item : c)) : [...customers, item]);
    reset();
  };

  const remove = (c) =>
    Alert.alert('Delete user?', `${c.name} will be removed. Their old bills stay saved.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onChange(customers.filter((x) => x.id !== c.id)); if (editId === c.id) reset(); } },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Title>Users</Title>
      <Card>
        <Label>{editId ? 'Edit user' : 'Add user'}</Label>
        <Input placeholder="Name (e.g. Sharma ji)" value={name} onChangeText={setName} />
        <Label>Regular milk per day (litres)</Label>
        <Input keyboardType="decimal-pad" value={qty} onChangeText={setQty} />
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Btn title={editId ? 'Update' : 'Add user'} onPress={submit} style={{ flex: 1 }} />
          {editId ? <Btn title="Cancel" kind="ghost" onPress={reset} style={{ marginLeft: 10 }} /> : null}
        </View>
      </Card>

      {customers.length === 0 && <Text style={{ color: C.muted }}>No users yet. Add the first one above.</Text>}
      {customers.map((c) => (
        <Card key={c.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>{c.name}</Text>
            <Text style={{ color: C.muted }}>{c.defaultQty} L / day</Text>
          </View>
          <TouchableOpacity onPress={() => { setEditId(c.id); setName(c.name); setQty(String(c.defaultQty)); }}>
            <Text style={{ color: C.primary, fontWeight: '700', marginRight: 18 }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => remove(c)}>
            <Text style={{ color: C.danger, fontWeight: '700' }}>Delete</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </ScrollView>
  );
}
