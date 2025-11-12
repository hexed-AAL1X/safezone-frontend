import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type Contact = { id: string; name: string; phone: string; favorite?: boolean; avatar?: string; status?: 'online' | 'offline'; lastSeen?: string; };

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Ana Sánchez', phone: '+51 987 654 321', favorite: true, avatar: '👩', status: 'online' },
    { id: '2', name: 'Carlos Mendoza', phone: '+51 912 345 678', avatar: '👨', status: 'offline', lastSeen: 'Hace 2h' },
    { id: '3', name: 'Sara López', phone: '+51 998 765 432', favorite: true, avatar: '👧', status: 'online' },
    { id: '4', name: 'Miguel Torres', phone: '+51 923 456 789', avatar: '🧑', status: 'offline', lastSeen: 'Hace 1d' },
  ]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [historyOn, setHistoryOn] = useState(true);

  const navigateToChat = useThrottle((id: string) => {
    router.push(`/chat/contact-${id}` as any);
  }, 800);

  const navigateToHistory = useThrottle(() => {
    router.push('/chat-history' as any);
  }, 800);

  const toggleFav = (id: string) => setContacts(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  const remove = (id: string) => setContacts(prev => prev.filter(c => c.id !== id));
  const add = () => {
    if (!name || !phone) return;
    setContacts(prev => [{ id: Date.now().toString(), name, phone }, ...prev]);
    setName(''); setPhone(''); setAdding(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="shield-checkmark" size={24} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Contactos de Emergencia</Text>
            <Text style={styles.sub}>Recibirán alertas y tu ubicación</Text>
          </View>
          <TouchableOpacity onPress={navigateToHistory} style={styles.historyBtn}>
            <Ionicons name="chatbubbles" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{item.avatar || item.name.charAt(0)}</Text>
              {item.status === 'online' && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.favorite && <Ionicons name="star" size={14} color="#fbbf24" />}
              </View>
              <Text style={styles.phone}>{item.phone}</Text>
              {item.status === 'offline' && item.lastSeen && (
                <Text style={styles.lastSeen}>{item.lastSeen}</Text>
              )}
            </View>
            
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigateToChat(item.id)}>
                <Ionicons name="chatbubbles" size={18} color={CTA} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleFav(item.id)}>
                <Ionicons name={item.favorite ? 'star' : 'star-outline'} size={18} color={item.favorite ? '#fbbf24' : TEXT_SECONDARY} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => remove(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={() => (
          <View>
            {adding ? (
              <View style={styles.addBox}>
                <TextInput placeholder="Nombre Completo" placeholderTextColor={TEXT_SECONDARY} style={styles.input} value={name} onChangeText={setName} />
                <TextInput placeholder="Número de teléfono" placeholderTextColor={TEXT_SECONDARY} style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TouchableOpacity style={styles.cta} onPress={add}><Text style={styles.ctaText}>GUARDAR CONTACTO</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setAdding(false)} style={{ marginTop: 8, alignSelf: 'center' }}><Text style={{ color: TEXT_SECONDARY }}>Cancelar</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
                <Ionicons name="add" size={18} color="#001311" />
                <Text style={styles.addBtnText}>AÑADIR NUEVO CONTACTO</Text>
              </TouchableOpacity>
            )}

            <View style={styles.historyBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.historyTitle}>Historial de Ubicación</Text>
                  <Text style={styles.historySub}>7 DÍAS (Gratis)</Text>
                </View>
                <Switch value={historyOn} onValueChange={setHistoryOn} trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }} thumbColor={historyOn ? CTA : '#777'} />
              </View>
              <View style={styles.historyFooter}>
                <Text style={styles.historyFooterText}>12:20:00 • Hoy</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.3)' },
  header: { color: TEXT, fontSize: 20, fontWeight: '700' },
  sub: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 13 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 10 },
  avatarContainer: { position: 'relative' },
  avatarText: { fontSize: 32, width: 56, height: 56, textAlign: 'center', lineHeight: 56, backgroundColor: 'rgba(0,255,209,0.12)', borderRadius: 14, borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)', overflow: 'hidden' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 14, backgroundColor: '#4ade80', borderWidth: 2, borderColor: BG },
  name: { color: TEXT, fontWeight: '700', fontSize: 16 },
  phone: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 13 },
  lastSeen: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 11 },
  actionsRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  deleteBtn: { backgroundColor: 'rgba(255,107,107,0.08)', borderColor: 'rgba(255,107,107,0.2)' },
  addBtn: { flexDirection: 'row', backgroundColor: CTA, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 12 },
  addBtnText: { color: '#001311', fontWeight: '600' },
  addBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: TEXT, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cta: { backgroundColor: CTA, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  ctaText: { color: '#001311' },
  historyBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  historyTitle: { color: TEXT, fontWeight: '600' },
  historySub: { color: TEXT_SECONDARY, marginTop: 2 },
  historyFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', marginTop: 10, paddingTop: 8 },
  historyFooterText: { color: TEXT_SECONDARY, fontSize: 12 },
  historyBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,255,209,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.2)' },
});
