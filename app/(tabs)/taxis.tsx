import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type Driver = { id: string; name: string; rating: number; verified: boolean; favorite?: boolean; avatar: string; vehicle: string; plate: string; trips: number; };

export default function TaxisScreen() {
  const insets = useSafeAreaInsets();
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 'd1', name: 'Luis Rojas', rating: 4.9, verified: true, favorite: true, avatar: '👨‍🦲', vehicle: 'Toyota Corolla', plate: 'ABC-123', trips: 1250 },
    { id: 'd2', name: 'María Pérez', rating: 4.8, verified: true, avatar: '👩', vehicle: 'Honda Civic', plate: 'XYZ-789', trips: 890 },
    { id: 'd3', name: 'Jorge Salas', rating: 4.5, verified: true, favorite: true, avatar: '👨', vehicle: 'Nissan Sentra', plate: 'DEF-456', trips: 650 },
    { id: 'd4', name: 'Carmen Vega', rating: 4.7, verified: true, avatar: '👩‍🦱', vehicle: 'Hyundai Accent', plate: 'GHI-321', trips: 420 },
  ]);

  const toggleFav = (id: string) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, favorite: !d.favorite } : d));
  const chat = (id: string) => router.push({ pathname: '/chat/[id]', params: { id: `driver-${id}` } });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="car" size={24} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Taxis Verificados</Text>
            <Text style={styles.sub}>Conductores confiables y seguros</Text>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Ionicons name="star" size={14} color="#001311" />
            <Text style={styles.filterChipTextActive}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="shield-checkmark-outline" size={14} color={TEXT_SECONDARY} />
            <Text style={styles.filterChipText}>Verificados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="location-outline" size={14} color={TEXT_SECONDARY} />
            <Text style={styles.filterChipText}>Cercanos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => router.push(`/driver/${item.id}` as any)}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarWrapper}>
                <Text style={styles.avatar}>{item.avatar}</Text>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#001311" />
                  </View>
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.favorite && <Ionicons name="heart" size={14} color="#ff6b6b" />}
                </View>
                
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.floor(item.rating) ? 'star' : star - 0.5 <= item.rating ? 'star-half' : 'star-outline'}
                      size={12}
                      color="#fbbf24"
                    />
                  ))}
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.tripsText}>• {item.trips} viajes</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleRow}>
                <Ionicons name="car-sport-outline" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.vehicleText}>{item.vehicle}</Text>
              </View>
              <View style={styles.plateBox}>
                <Text style={styles.plateText}>{item.plate}</Text>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.chatBtn} onPress={() => chat(item.id)}>
                <Ionicons name="chatbubbles" size={18} color="#001311" />
                <Text style={styles.chatBtnText}>Contactar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.favBtn} onPress={() => toggleFav(item.id)}>
                <Ionicons name={item.favorite ? 'heart' : 'heart-outline'} size={18} color={item.favorite ? '#ff6b6b' : TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.3)' },
  header: { color: TEXT, fontSize: 20, fontWeight: '700' },
  sub: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 13 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: CTA, borderColor: CTA },
  filterChipText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#001311', fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarWrapper: { position: 'relative' },
  avatar: { fontSize: 36, width: 56, height: 56, textAlign: 'center', lineHeight: 56, backgroundColor: 'rgba(0,255,209,0.12)', borderRadius: 14, borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)', overflow: 'hidden' },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 20, backgroundColor: CTA, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BG },
  name: { color: TEXT, fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: { color: TEXT, fontSize: 13, fontWeight: '600', marginLeft: 4 },
  tripsText: { color: TEXT_SECONDARY, fontSize: 11, marginLeft: 2 },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, marginBottom: 12 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleText: { color: TEXT_SECONDARY, fontSize: 13 },
  plateBox: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  plateText: { color: TEXT, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 12, borderRadius: 12 },
  chatBtnText: { color: '#001311', fontWeight: '600', fontSize: 14 },
  favBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});
