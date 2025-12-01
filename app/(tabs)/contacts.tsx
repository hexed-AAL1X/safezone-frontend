import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';
import { getMyEmergencyContacts, ApiEmergencyContact } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

type Contact = {
  id: string;
  name: string;
  phone: string;
  favorite?: boolean;
  avatar?: string;
  status?: 'online' | 'offline';
  lastSeen?: string;
  lat?: number;
  lng?: number;
};

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [historyOn, setHistoryOn] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyEmergencyContacts();
        const mapped: Contact[] = data.map((c: ApiEmergencyContact) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          avatar: c.avatar || undefined,
          favorite: c.favorite,
          status: c.status ? (c.status.toLowerCase() as 'online' | 'offline') : undefined,
          lastSeen: c.lastSeen || undefined,
          lat: typeof c.lat === 'number' ? c.lat : undefined,
          lng: typeof c.lng === 'number' ? c.lng : undefined,
        }));
        setContacts(mapped);
      } catch (error) {
        console.error('Error cargando contactos de emergencia:', error);
        setContacts([]);
      }
    })();
  }, []);

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
      <View style={styles.headerWrapper}>
        <DashboardHeader title="SafeZone" subtitle="Contactos de emergencia" />
      </View>
      <View style={styles.topSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={ACCENT} />
            <Text style={styles.statNumber}>{contacts.length}</Text>
            <Text style={styles.statLabel}>Contactos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#fbbf24" />
            <Text style={styles.statNumber}>{contacts.filter(c => c.favorite).length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <TouchableOpacity style={styles.chatCard} onPress={navigateToHistory}>
            <Ionicons name="chatbubbles" size={24} color={ACCENT} />
            <Text style={styles.chatLabel}>Chats</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom }}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{item.avatar || item.name.charAt(0).toUpperCase()}</Text>
                </View>
                {item.status === 'online' && <View style={styles.statusDot} />}
              </View>
              
              <View style={styles.contactInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  {item.favorite && (
                    <View style={styles.favBadge}>
                      <Ionicons name="star" size={10} color="#001311" />
                    </View>
                  )}
                </View>
                <Text style={styles.contactPhone}>{item.phone}</Text>
                {item.status === 'offline' && item.lastSeen && (
                  <Text style={styles.contactStatus}>{item.lastSeen}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.primaryAction} onPress={() => navigateToChat(item.id)}>
                <Ionicons name="chatbubbles" size={16} color="#001311" />
                <Text style={styles.primaryActionText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => toggleFav(item.id)}>
                <Ionicons name={item.favorite ? 'star' : 'star-outline'} size={16} color={item.favorite ? '#fbbf24' : ACCENT} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryAction, styles.dangerAction]} onPress={() => remove(item.id)}>
                <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
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
  headerWrapper: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 4 },
  
  // Top Stats Section
  topSection: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 8,
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: { color: TEXT, fontSize: 24, fontWeight: '700' },
  statLabel: { color: TEXT_SECONDARY, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  chatCard: {
    flex: 1,
    backgroundColor: 'rgba(0,255,255,0.08)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  chatLabel: { color: ACCENT, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  
  // Contact Card
  contactCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  avatarLetter: { color: ACCENT, fontSize: 24, fontWeight: '700' },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ade80',
    borderWidth: 3,
    borderColor: BG,
  },
  contactInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactName: { color: TEXT, fontSize: 17, fontWeight: '700' },
  favBadge: {
    backgroundColor: '#fbbf24',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactPhone: { color: TEXT_SECONDARY, fontSize: 14, fontWeight: '500' },
  contactStatus: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  
  // Card Actions
  cardActions: { flexDirection: 'row', gap: 8 },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: { color: '#001311', fontSize: 13, fontWeight: '700' },
  secondaryAction: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dangerAction: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderColor: 'rgba(255,107,107,0.3)',
  },
  
  // Add Contact
  addBtn: { 
    flexDirection: 'row', 
    backgroundColor: CTA, 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  addBtnText: { color: '#001311', fontWeight: '700', fontSize: 14 },
  addBox: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.1)', 
    marginVertical: 12,
    gap: 10,
  },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    color: TEXT, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.15)',
    fontSize: 15,
  },
  cta: { 
    backgroundColor: CTA, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  ctaText: { color: '#001311', fontWeight: '700', fontSize: 14 },
  
  // History Box
  historyBox: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.1)', 
    marginBottom: 16,
    gap: 12,
  },
  historyTitle: { color: TEXT, fontWeight: '700', fontSize: 15 },
  historySub: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 12, fontWeight: '600' },
  historyFooter: { 
    borderTopWidth: 1.5, 
    borderTopColor: 'rgba(255,255,255,0.1)', 
    paddingTop: 12,
  },
  historyFooterText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '500' },
});
