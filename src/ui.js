import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fromISO, toISO, fmtDate } from './calc';

export const C = {
  bg: '#F7F2E8', card: '#FFFFFF', primary: '#2E6A57', primarySoft: '#DCEBE4',
  text: '#23302B', muted: '#7A857F', danger: '#B8442F', border: '#E4DCCB', accent: '#E9A93B',
};

export function Btn({ title, onPress, kind = 'primary', style, disabled }) {
  const bg = kind === 'primary' ? C.primary : kind === 'danger' ? C.danger : 'transparent';
  const color = kind === 'ghost' ? C.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.45 : 1 },
        kind === 'ghost' && { borderWidth: 1.5, borderColor: C.primary }, style]}
    >
      <Text style={[s.btnText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;
export const Label = ({ children }) => <Text style={s.label}>{children}</Text>;
export const Title = ({ children }) => <Text style={s.title}>{children}</Text>;

export function Input(props) {
  return <TextInput placeholderTextColor={C.muted} {...props} style={[s.input, props.style]} />;
}

export function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function DateField({ label, value, onChange, style }) {
  const [show, setShow] = useState(false);
  return (
    <View style={[{ flex: 1 }, style]}>
      {label ? <Label>{label}</Label> : null}
      <TouchableOpacity style={s.input} onPress={() => setShow(true)}>
        <Text style={{ color: C.text, fontSize: 16 }}>{fmtDate(value)}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={fromISO(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={(e, d) => {
            setShow(false);
            if (d) onChange(toISO(d));
          }}
          onDismiss={() => setShow(false)}
        />
      )}
    </View>
  );
}

export const s = StyleSheet.create({
  btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
  },
  label: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 6, marginTop: 4, letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.border, backgroundColor: '#FFFDF8', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 16, color: C.text,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    borderColor: C.primary, marginRight: 8, marginBottom: 8,
  },
  chipActive: { backgroundColor: C.primary },
  chipText: { color: C.primary, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  cal: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  nav: { fontSize: 22, fontWeight: '800', color: C.primary, paddingHorizontal: 10 },
  wk: { flex: 1, textAlign: 'center', color: C.muted, fontWeight: '700', paddingVertical: 6 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
});
