import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { C } from './src/ui';
import {
  loadBills, loadCustomers, loadPrice, saveBills, saveCustomers, savePrice,
} from './src/storage';
import Bills from './src/screens/Bills';
import NewBill from './src/screens/NewBill';
import Customers from './src/screens/Customers';
import BillDetail from './src/screens/BillDetail';

const TABS = [
  { key: 'bills', label: 'Bills' },
  { key: 'new', label: 'New bill' },
  { key: 'users', label: 'Users' },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('bills');
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [price, setPrice] = useState(0);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      setCustomers(await loadCustomers());
      setBills(await loadBills());
      setPrice(await loadPrice());
      setReady(true);
    })();
  }, []);

  const updateCustomers = (v) => { setCustomers(v); saveCustomers(v); };
  const updateBills = (v) => { setBills(v); saveBills(v); };
  const updatePrice = (v) => { setPrice(v); savePrice(v); };

  const openBill = bills.find((b) => b.id === openId);

  let body;
  if (!ready) body = <ActivityIndicator style={{ marginTop: 60 }} color={C.primary} size="large" />;
  else if (openBill)
    body = (
      <BillDetail
        bill={openBill}
        onBack={() => setOpenId(null)}
        onDelete={(id) => { updateBills(bills.filter((b) => b.id !== id)); setOpenId(null); }}
      />
    );
  else if (tab === 'bills') body = <Bills bills={bills} customers={customers} onOpen={(b) => setOpenId(b.id)} />;
  else if (tab === 'new')
    body = (
      <NewBill
        customers={customers}
        price={price}
        onSetDefaultPrice={updatePrice}
        onSave={(bill) => { updateBills([bill, ...bills]); setOpenId(bill.id); }}
      />
    );
  else body = <Customers customers={customers} onChange={updateCustomers} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        {/* {!openBill && ( */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
            <Image source={require('./assets/logo.png')} style={{ width: 52, height: 52 }} resizeMode="contain" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.primary }}>Milk Book</Text>
              <Text style={{ fontSize: 13, color: C.muted }}>Track and Manage Your Milk Expenses</Text>
            </View>
          </View>
        {/* )} */}
        <View style={{ flex: 1 }}>{body}</View>
        {!openBill && (
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.border, backgroundColor: '#fff' }}>
            {TABS.map((t) => (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={{ flex: 1, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', color: tab === t.key ? C.primary : C.muted }}>{t.label}</Text>
                {tab === t.key && <View style={{ height: 3, width: 28, backgroundColor: C.accent, borderRadius: 2, marginTop: 4 }} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
