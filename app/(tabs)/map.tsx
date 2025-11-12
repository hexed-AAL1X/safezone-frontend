import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Switch, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type ContactShare = { id: string; name: string; share: boolean; lat: number; lng: number; };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ target?: string; lat?: string; lng?: string; name?: string }>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState<ContactShare[]>([
    { id: '1', name: 'Ana S.', share: true, lat: -12.0464, lng: -77.0328 },
    { id: '2', name: 'Carlos M.', share: false, lat: -12.0564, lng: -77.0528 },
    { id: '3', name: 'Sara', share: false, lat: -12.0364, lng: -77.0228 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'SafeZone necesita acceso a tu ubicación.');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar tu ubicación.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShare = (id: string) => setShares(prev => prev.map(s => s.id === id ? { ...s, share: !s.share } : s));

  const targetName = useMemo(() => params.target?.toString().replace('club-', '').replace('-', ' ').toUpperCase(), [params.target]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="map" size={24} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Mapa en Tiempo Real</Text>
            <Text style={styles.sub}>Ubicación y contactos cercanos</Text>
          </View>
        </View>
        
        {params.target && (
          <View style={styles.banner}>
            <Ionicons name="navigate" size={16} color={ACCENT} />
            <Text style={styles.bannerText}>Destino: {targetName}</Text>
          </View>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={16} color={ACCENT} />
            <Text style={styles.statText}>3 contactos</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="location" size={16} color="#4ade80" />
            <Text style={styles.statText}>Precisión: Alta</Text>
          </View>
        </View>
      </View>
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        ) : location ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={darkMapStyle}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Tu ubicación"
              pinColor={ACCENT}
            />
            
            {/* Marcadores de contactos que están compartiendo */}
            {shares.filter(s => s.share).map((contact) => (
              <Marker
                key={contact.id}
                coordinate={{
                  latitude: contact.lat,
                  longitude: contact.lng,
                }}
                title={contact.name}
                description="Compartiendo ubicación"
              >
                <View style={styles.customMarkerContainer}>
                  <View style={styles.markerPhoto}>
                    <Text style={styles.markerPhotoText}>{contact.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.markerPulse} />
                </View>
              </Marker>
            ))}
            
            {/* Marcador de club/discoteca si viene de clubs */}
            {params.lat && params.lng && (
              <Marker
                coordinate={{
                  latitude: parseFloat(params.lat),
                  longitude: parseFloat(params.lng),
                }}
                title={params.name || 'Destino'}
                description="Discoteca verificada"
                pinColor="#ff6b6b"
              >
                <View style={styles.clubMarkerContainer}>
                  <Ionicons name="musical-notes" size={24} color="#fff" />
                </View>
              </Marker>
            )}
          </MapView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="location-outline" size={48} color={TEXT_SECONDARY} />
            <Text style={styles.errorText}>No se pudo obtener tu ubicación</Text>
          </View>
        )}
      </View>

      {location && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="navigate-circle" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>Latitud</Text>
            </View>
            <Text style={styles.infoValue}>{location.coords.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="navigate-circle" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>Longitud</Text>
            </View>
            <Text style={styles.infoValue}>{location.coords.longitude.toFixed(6)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>Precisión</Text>
            </View>
            <Text style={styles.infoValue}>±{location.coords.accuracy?.toFixed(0) || 0}m</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.refresh} onPress={refreshLocation} disabled={loading}>
        <Ionicons name="locate" size={16} color="#001311" />
        <Text style={styles.refreshText}>ACTUALIZAR UBICACIÓN</Text>
      </TouchableOpacity>

      <View style={styles.shareSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="share-social" size={18} color={ACCENT} />
          <Text style={styles.sectionTitle}>Compartir ubicación</Text>
        </View>
        {shares.map(c => (
          <View key={c.id} style={styles.shareRow}>
            <View style={styles.shareAvatar}>
              <Text style={styles.shareAvatarText}>{c.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareName}>{c.name}</Text>
              <Text style={styles.shareStatus}>{c.share ? 'Compartiendo ubicación' : 'Sin compartir'}</Text>
            </View>
            <Switch value={c.share} onValueChange={() => toggleShare(c.id)} trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }} thumbColor={c.share ? CTA : '#777'} />
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.3)' },
  header: { color: TEXT, fontSize: 20, fontWeight: '700' },
  sub: { color: TEXT_SECONDARY, marginTop: 2, fontSize: 13 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,255,209,0.08)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,209,0.2)', marginBottom: 12 },
  bannerText: { color: ACCENT, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statText: { color: TEXT, fontSize: 12, fontWeight: '600' },
  mapContainer: { height: 280, backgroundColor: '#0c0c0c', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16, marginTop: 12, overflow: 'hidden' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: TEXT_SECONDARY },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: TEXT_SECONDARY },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { color: TEXT_SECONDARY, fontSize: 12 },
  infoValue: { color: TEXT, fontSize: 13, fontWeight: '600' },
  refresh: { backgroundColor: CTA, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, marginHorizontal: 16, marginTop: 12 },
  refreshText: { color: '#001311', fontWeight: '600' },
  shareSection: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: TEXT, fontSize: 16, fontWeight: '600' },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  shareAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,209,0.3)' },
  shareAvatarText: { color: ACCENT, fontSize: 18, fontWeight: '700' },
  shareName: { color: TEXT, fontWeight: '600' },
  shareStatus: { color: TEXT_SECONDARY, fontSize: 11, marginTop: 2 },
  customMarkerContainer: { alignItems: 'center', justifyContent: 'center', width: 60, height: 60 },
  markerPhoto: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4ade80', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 8 },
  markerPhotoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  markerPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(74, 222, 128, 0.2)', borderWidth: 2, borderColor: 'rgba(74, 222, 128, 0.4)' },
  clubMarkerContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ff6b6b', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#ff6b6b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 8 },
});
