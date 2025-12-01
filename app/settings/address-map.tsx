import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapboxGL from '@rnmapbox/maps';
import { router } from 'expo-router';
import { updateMyProfile } from '@/lib/api';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

export default function AddressMapScreen() {
  const insets = useSafeAreaInsets();
  const [initialCoord, setInitialCoord] = useState<[number, number] | null>(null); // [lng, lat]
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null); // [lng, lat]
  const [addressLabel, setAddressLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        const lngLat: [number, number] = [loc.coords.longitude, loc.coords.latitude];
        setInitialCoord(lngLat);
        setSelectedCoord(lngLat);
        await fetchAddressLabel(lngLat);
      } catch (error) {
        console.error('Error obteniendo ubicación para dirección:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchAddressLabel = async (lngLat: [number, number]) => {
    const [lng, lat] = lngLat;
    // Si no hay token, al menos mostramos las coordenadas
    if (!MAPBOX_ACCESS_TOKEN) {
      setAddressLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=es&limit=1&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const res = await fetch(url);
      const json = await res.json();
      const place = json?.features?.[0]?.place_name as string | undefined;
      if (place) {
        setAddressLabel(place);
      } else {
        setAddressLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error obteniendo dirección legible de Mapbox:', error);
      setAddressLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleMapPress = async (event: any) => {
    try {
      const { geometry } = event;
      if (!geometry?.coordinates) return;
      const [lng, lat] = geometry.coordinates as [number, number];
      const lngLat: [number, number] = [lng, lat];
      setSelectedCoord(lngLat);
      await fetchAddressLabel(lngLat);
    } catch (error) {
      console.error('Error leyendo coordenadas del mapa:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedCoord) return;
    const [lng, lat] = selectedCoord;
    const addressString = addressLabel || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    try {
      setSaving(true);
      await updateMyProfile({ address: addressString });
      router.back();
    } catch (error: any) {
      console.error('Error guardando dirección:', error);
      Alert.alert('Error', error?.message || 'No se pudo guardar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elige tu dirección</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
          </View>
        ) : initialCoord ? (
          <View style={styles.mapWrapper}>
            <MapboxGL.MapView
              style={styles.map}
              styleURL={MapboxGL.StyleURL.Dark}
              onPress={handleMapPress}
            >
              <MapboxGL.Camera
                centerCoordinate={selectedCoord || initialCoord}
                zoomLevel={15}
              />

              <MapboxGL.UserLocation showsUserHeadingIndicator />

              {selectedCoord && (
                <MapboxGL.PointAnnotation id="selected-address" coordinate={selectedCoord}>
                  <View style={styles.markerOuter}>
                    <View style={styles.markerInner} />
                  </View>
                </MapboxGL.PointAnnotation>
              )}
            </MapboxGL.MapView>

            {selectedCoord && (
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Dirección seleccionada</Text>
                {addressLabel ? (
                  <Text style={styles.coordValue} numberOfLines={2} ellipsizeMode="tail">
                    {addressLabel}
                  </Text>
                ) : (
                  <Text style={styles.coordValue}>
                    {selectedCoord[1].toFixed(6)}, {selectedCoord[0].toFixed(6)}
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No se pudo obtener tu ubicación</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
        <TouchableOpacity
          style={[styles.saveBtn, !selectedCoord || saving ? { opacity: 0.6 } : null]}
          onPress={handleSave}
          disabled={!selectedCoord || saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'GUARDANDO...' : 'GUARDAR DIRECCIÓN'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { padding: 4 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: TEXT_SECONDARY },
  mapWrapper: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  map: { flex: 1 },
  coordBox: { position: 'absolute', left: 16, right: 16, bottom: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  coordLabel: { color: TEXT_SECONDARY, fontSize: 12 },
  coordValue: { color: TEXT, fontSize: 14, fontWeight: '600', marginTop: 4 },
  markerOuter: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,255,209,0.25)', alignItems: 'center', justifyContent: 'center' },
  markerInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: CTA, borderWidth: 1, borderColor: '#000' },
  footer: { paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  saveBtn: { backgroundColor: CTA, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#001311', fontSize: 15, fontWeight: '600' },
});
