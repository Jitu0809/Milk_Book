import AsyncStorage from '@react-native-async-storage/async-storage';

const K = { customers: 'milkbook.customers', bills: 'milkbook.bills', price: 'milkbook.price' };

async function read(key, fallback) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
async function write(key, val) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export const loadCustomers = () => read(K.customers, []);
export const saveCustomers = (v) => write(K.customers, v);
export const loadBills = () => read(K.bills, []);
export const saveBills = (v) => write(K.bills, v);
export const loadPrice = () => read(K.price, 0);
export const savePrice = (v) => write(K.price, v);
