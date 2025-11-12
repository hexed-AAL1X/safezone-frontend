import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type Club = { id: string; name: string; rating: number; tags: string[]; distanceKm: number; emoji: string; openUntil: string; priceLevel: number; atmosphere: string; reviews: number; lat: number; lng: number; };

const DATA: Club[] = [
  { id: 'c1', name: 'Discoteca La Cueva', rating: 4.5, tags: ['Seguridad', 'Staff', 'Protocolo'], distanceKm: 1.2, emoji: '🎶', openUntil: '4:00 AM', priceLevel: 2, atmosphere: 'Electrónica', reviews: 234, lat: -12.0504, lng: -77.0358 },
  { id: 'c2', name: 'Club Eclipse', rating: 4.8, tags: ['Seguridad', 'Acceso', 'Iluminación'], distanceKm: 0.8, emoji: '🌃', openUntil: '5:00 AM', priceLevel: 3, atmosphere: 'Reggaetón', reviews: 512, lat: -12.0424, lng: -77.0298 },
  { id: 'c3', name: 'Neon Bar', rating: 4.2, tags: ['Staff', 'Protocolo', 'Ambiente'], distanceKm: 2.0, emoji: '🍸', openUntil: '3:00 AM', priceLevel: 1, atmosphere: 'Lounge', reviews: 156, lat: -12.0604, lng: -77.0458 },
  { id: 'c4', name: 'Pulse Nightclub', rating: 4.6, tags: ['Seguridad', 'VIP', 'Parking'], distanceKm: 1.5, emoji: '🕺', openUntil: '6:00 AM', priceLevel: 3, atmosphere: 'House', reviews: 389, lat: -12.0544, lng: -77.0398 },
];

export default function ClubsScreen() {
  const insets = useSafeAreaInsets();
  const openOnMap = (club: Club) => router.push({ pathname: '/(tabs)/map', params: { target: `club-${club.id}`, lat: club.lat.toString(), lng: club.lng.toString(), name: club.name } });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="musical-notes" size={24} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Discotecas & Clubs</Text>
            <Text style={styles.sub}>Lugares verificados cerca de ti</Text>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Ionicons name="location" size={14} color="#001311" />
            <Text style={styles.filterChipTextActive}>Cercanos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="star" size={14} color={TEXT_SECONDARY} />
            <Text style={styles.filterChipText}>Mejor valorados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="time-outline" size={14} color={TEXT_SECONDARY} />
            <Text style={styles.filterChipText}>Abiertos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.clubAvatar}>
                <Text style={styles.clubEmoji}>{item.emoji}</Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.floor(item.rating) ? 'star' : star - 0.5 <= item.rating ? 'star-half' : 'star-outline'}
                        size={11}
                        color="#fbbf24"
                      />
                    ))}
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
              </View>
              
              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={12} color={ACCENT} />
                <Text style={styles.distanceText}>{item.distanceKm} km</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="musical-note-outline" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.infoText}>{item.atmosphere}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.infoText}>{item.openUntil}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.priceLevel}>{'$'.repeat(item.priceLevel)}{'$'.repeat(3 - item.priceLevel).split('').map(() => '·').join('')}</Text>
              </View>
            </View>
            
            <View style={styles.tagsRow}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Ionicons name="checkmark-circle" size={10} color={CTA} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.mapBtn} onPress={() => openOnMap(item)}>
              <Ionicons name="navigate" size={18} color="#001311" />
              <Text style={styles.mapBtnText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
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
  clubAvatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)' },
  clubEmoji: { fontSize: 32 },
  name: { color: TEXT, fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: TEXT, fontSize: 13, fontWeight: '600', marginLeft: 4 },
  reviews: { color: TEXT_SECONDARY, fontSize: 11 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,255,209,0.12)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(0,255,209,0.25)' },
  distanceText: { color: ACCENT, fontSize: 11, fontWeight: '600' },
  infoRow: { flexDirection: 'row', gap: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: TEXT_SECONDARY, fontSize: 12 },
  priceLevel: { color: TEXT, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,255,209,0.08)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(0,255,209,0.2)' },
  tagText: { color: ACCENT, fontSize: 11, fontWeight: '600' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 12, borderRadius: 12 },
  mapBtnText: { color: '#001311', fontWeight: '600', fontSize: 14 },
});
