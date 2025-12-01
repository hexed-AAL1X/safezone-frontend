import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getClubs, ApiClub, getCurrentUserProfile, createClub } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

type Club = ApiClub & { distanceKm?: number; imageUrl?: string | null };

export default function ClubsScreen() {
  const insets = useSafeAreaInsets();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isGuardian, setIsGuardian] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getClubs();
        const mapped: Club[] = data.map((c) => ({
          ...c,
        }));
        setClubs(mapped);
      } catch (error) {
        console.error('Error cargando clubs:', error);
        setClubs([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentUserProfile();
        setIsGuardian(res.user.role === 'GUARDIAN');
      } catch (error) {
        console.error('Error obteniendo perfil en clubs:', error);
      }
    })();
  }, []);
  const openOnMap = (club: Club) => router.push({ pathname: '/(tabs)/map', params: { target: `club-${club.id}`, lat: club.lat.toString(), lng: club.lng.toString(), name: club.name } });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerWrapper}>
        <DashboardHeader title="SafeZone" subtitle="Discotecas & clubs" />
      </View>
      <View style={styles.topSection}>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="business" size={20} color={ACCENT} />
            <Text style={styles.statValue}>{clubs.length}</Text>
            <Text style={styles.statTitle}>Lugares</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
            <Text style={styles.statValue}>{clubs.filter(c => c.rating >= 4).length}</Text>
            <Text style={styles.statTitle}>Verificados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#fbbf24" />
            <Text style={styles.statValue}>{clubs.filter(c => c.openUntil).length}</Text>
            <Text style={styles.statTitle}>Abiertos</Text>
          </View>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterActive]}>
            <Ionicons name="location" size={14} color="#001311" />
            <Text style={styles.filterActiveText}>Cercanos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="star" size={14} color={ACCENT} />
            <Text style={styles.filterText}>Top</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="time-outline" size={14} color={ACCENT} />
            <Text style={styles.filterText}>Ahora</Text>
          </TouchableOpacity>
        </View>
        {isGuardian && (
          <TouchableOpacity
            style={styles.guardianCreateBtn}
            onPress={() => setShowCreateForm(prev => !prev)}
          >
            <Ionicons name="add-circle-outline" size={16} color={CTA} />
            <Text style={styles.guardianCreateText}>
              {showCreateForm ? 'Cerrar creación de discoteca' : 'Añadir discoteca'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          isGuardian && showCreateForm ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>Nueva discoteca</Text>
              {createError ? <Text style={styles.createError}>{createError}</Text> : null}

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Nombre</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="Nombre del local"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.createRowInline}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createLabel}>Latitud</Text>
                  <TextInput
                    style={styles.createInput}
                    placeholder="-12.0464"
                    placeholderTextColor={TEXT_SECONDARY}
                    keyboardType="decimal-pad"
                    value={newLat}
                    onChangeText={setNewLat}
                  />
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.createLabel}>Longitud</Text>
                  <TextInput
                    style={styles.createInput}
                    placeholder="-77.0428"
                    placeholderTextColor={TEXT_SECONDARY}
                    keyboardType="decimal-pad"
                    value={newLng}
                    onChangeText={setNewLng}
                  />
                </View>
              </View>

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Tags (separados por coma)</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="reggaeton, miraflores, rooftop"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newTags}
                  onChangeText={setNewTags}
                />
              </View>

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Imagen (URL opcional)</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="https://..."
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newImageUrl}
                  onChangeText={setNewImageUrl}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.createBtn, creating && styles.createBtnDisabled]}
                disabled={creating}
                onPress={async () => {
                  if (creating) return;
                  if (!newName.trim() || !newLat.trim() || !newLng.trim()) {
                    setCreateError('Nombre y coordenadas son obligatorios.');
                    return;
                  }

                  const latNum = parseFloat(newLat.replace(',', '.'));
                  const lngNum = parseFloat(newLng.replace(',', '.'));

                  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
                    setCreateError('Latitud y longitud deben ser números válidos.');
                    return;
                  }

                  setCreating(true);
                  setCreateError(null);

                  try {
                    const tagsArr = newTags
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0);

                    const created = await createClub({
                      name: newName.trim(),
                      lat: latNum,
                      lng: lngNum,
                      tags: tagsArr.length ? tagsArr : undefined,
                      imageUrl: newImageUrl.trim() ? newImageUrl.trim() : null,
                    });

                    setClubs((prev) => [created as Club, ...prev]);

                    setNewName('');
                    setNewLat('');
                    setNewLng('');
                    setNewTags('');
                    setNewImageUrl('');
                    setShowCreateForm(false);
                  } catch (error: any) {
                    console.error('Error creando discoteca:', error);
                    setCreateError(error?.message ?? 'No se pudo crear la discoteca.');
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                <Text style={styles.createBtnText}>
                  {creating ? 'Creando…' : 'Crear discoteca'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.clubCard}>
            <View style={styles.clubTop}>
              <View style={styles.clubIcon}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.clubIconImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.clubIconPlaceholder}>
                    <Ionicons name="image" size={20} color={TEXT_SECONDARY} />
                  </View>
                )}
                {item.distanceKm != null && (
                  <View style={styles.distancePill}>
                    <Text style={styles.distancePillText}>{item.distanceKm}km</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.clubMain}>
                <Text style={styles.clubName}>{item.name}</Text>
                <View style={styles.ratingRow}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.floor(item.rating) ? 'star' : star - 0.5 <= item.rating ? 'star-half' : 'star-outline'}
                        size={12}
                        color="#fbbf24"
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingValue}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.reviews})</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.clubDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="musical-note" size={14} color={ACCENT} />
                <Text style={styles.detailText}>{item.atmosphere}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={14} color="#4ade80" />
                <Text style={styles.detailText}>{item.openUntil}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cash" size={14} color="#fbbf24" />
                <Text style={styles.priceText}>{'$'.repeat(item.priceLevel)}</Text>
              </View>
            </View>
            
            <View style={styles.clubTags}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.clubTag}>
                  <Text style={styles.clubTagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={styles.clubTag}>
                  <Text style={styles.clubTagText}>+{item.tags.length - 3}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.navigateBtn} onPress={() => openOnMap(item)}>
              <Ionicons name="navigate" size={16} color="#001311" />
              <Text style={styles.navigateBtnText}>Cómo Llegar</Text>
              <Ionicons name="arrow-forward" size={16} color="#001311" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: TEXT_SECONDARY, textAlign: 'center' }}>
              Aún no hay discotecas registradas en SafeZone.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerWrapper: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 4 },
  
  // Top Section
  topSection: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 14 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { color: TEXT, fontSize: 20, fontWeight: '700' },
  statTitle: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },
  
  // Filters
  filterRow: { flexDirection: 'row', gap: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterActive: {
    backgroundColor: ACCENT,
    borderColor: 'rgba(0,255,255,0.5)',
    borderWidth: 2,
  },
  filterText: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  filterActiveText: { color: '#001311', fontSize: 12, fontWeight: '700' },
  
  // Club Card
  clubCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  clubTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  clubIcon: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.25)',
  },
  clubIconImage: { width: '100%', height: '100%' },
  clubIconPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  distancePill: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: ACCENT,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: BG,
  },
  distancePillText: { color: '#001311', fontSize: 10, fontWeight: '700' },
  clubMain: { flex: 1, gap: 6 },
  clubName: { color: TEXT, fontSize: 17, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  ratingValue: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  reviewCount: { color: TEXT_SECONDARY, fontSize: 12 },
  
  // Club Details
  clubDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  detailText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  priceText: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  
  // Club Tags
  clubTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubTag: {
    backgroundColor: 'rgba(0,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  clubTagText: { color: ACCENT, fontSize: 11, fontWeight: '700' },
  
  // Navigate Button
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  navigateBtnText: { color: '#001311', fontSize: 14, fontWeight: '700' },

  // Guardian create
  guardianCreateBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    gap: 8,
  },
  guardianCreateText: { color: CTA, fontSize: 12, fontWeight: '700' },

  createCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.25)',
    gap: 12,
  },
  createTitle: { color: TEXT, fontSize: 15, fontWeight: '700' },
  createError: { color: '#f97373', fontSize: 12 },
  createRow: { gap: 6 },
  createRowInline: { flexDirection: 'row', gap: 10 },
  createLabel: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  createInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    color: TEXT,
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  createBtn: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: { color: '#001311', fontSize: 14, fontWeight: '700' },
});
