import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type Group = { id: string; name: string; members: number; joined?: boolean; category: string; online: number; avatar: string; description: string; };

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([
    { id: 'g1', name: 'Universidad Central', members: 234, joined: true, category: 'Educación', online: 45, avatar: '🎓', description: 'Comunidad de estudiantes para compartir ubicaciones y alertas' },
    { id: 'g2', name: 'Zona Rosa Segura', members: 511, category: 'Vida Nocturna', online: 89, avatar: '🌃', description: 'Grupo para salir de noche con seguridad' },
    { id: 'g3', name: 'Barrio La Estrella', members: 98, category: 'Vecindario', online: 12, avatar: '🏘️', description: 'Vecinos cuidándose entre sí' },
    { id: 'g4', name: 'Runners Lima', members: 156, category: 'Deportes', online: 23, avatar: '🏃', description: 'Corredores que comparten rutas seguras' },
  ]);

  const toggleJoin = (id: string) => setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: !g.joined } : g));
  const openChat = useThrottle((id: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: `group-${id}` } });
  }, 800);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="people" size={24} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Comunidad SafeZone</Text>
            <Text style={styles.sub}>Conéctate con personas cerca de ti</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groups.reduce((acc, g) => acc + g.online, 0)}</Text>
            <Text style={styles.statLabel}>En línea</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={groups}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 12 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{item.avatar}</Text>
                {item.joined && (
                  <View style={styles.joinedBadge}>
                    <Ionicons name="checkmark" size={12} color="#001311" />
                  </View>
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.joined && <View style={styles.activeDot} />}
                </View>
                <Text style={styles.category}>{item.category}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statText}>{item.online} en línea</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                {item.joined ? (
                  <>
                    <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(item.id)}>
                      <Ionicons name="chatbubbles" size={18} color="#001311" />
                      <Text style={styles.chatBtnText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.leaveBtn} onPress={() => toggleJoin(item.id)}>
                      <Ionicons name="exit-outline" size={18} color={TEXT_SECONDARY} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.joinBtn} onPress={() => toggleJoin(item.id)}>
                    <Ionicons name="add" size={18} color="#001311" />
                    <Text style={styles.joinBtnText}>Unirme</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  headerIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.3)' },
  header: { color: TEXT, fontSize: 20, fontWeight: '700' },
  sub: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: 'rgba(0,255,209,0.08)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,209,0.2)', alignItems: 'center' },
  statNumber: { color: ACCENT, fontSize: 20, fontWeight: '700' },
  statLabel: { color: TEXT_SECONDARY, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarContainer: { position: 'relative' },
  avatarEmoji: { fontSize: 40, width: 56, height: 56, textAlign: 'center', lineHeight: 56, backgroundColor: 'rgba(0,255,209,0.12)', borderRadius: 14, borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)', overflow: 'hidden' },
  joinedBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 20, backgroundColor: CTA, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BG },
  name: { color: TEXT, fontSize: 16, fontWeight: '700' },
  category: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  activeDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#4ade80' },
  description: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsContainer: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: TEXT_SECONDARY, fontSize: 12 },
  onlineDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#4ade80' },
  actions: { flexDirection: 'row', gap: 8 },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  joinBtnText: { color: '#001311', fontWeight: '600', fontSize: 14 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  chatBtnText: { color: '#001311', fontWeight: '600', fontSize: 14 },
  leaveBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});
