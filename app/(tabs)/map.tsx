import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { getMyEmergencyContacts, ApiEmergencyContact } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import MapboxGL from '@rnmapbox/maps';
import DashboardHeader from '@/components/DashboardHeader';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

const NEARBY_RADIUS_KM = 2; // radio de cercanía para considerar contactos "cerca" en el mapa

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371;
  return R * c;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ target?: string; lat?: string; lng?: string; name?: string }>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<number[][] | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [nearbyContacts, setNearbyContacts] = useState<number>(0);
  const [contactMarkers, setContactMarkers] = useState<ApiEmergencyContact[]>([]);

  useEffect(() => {
    let subscription: any = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'SafeZone necesita acceso a tu ubicación.');
          setLoading(false);
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 2,
            timeInterval: 1000,
          },
          (loc) => {
            setLocation(loc);
          },
        );

        setLoading(false);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación.');
        setLoading(false);
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Cargar contactos de emergencia con ubicación (si existe)
  useEffect(() => {
    (async () => {
      try {
        const contacts = await getMyEmergencyContacts();
        const withCoords = contacts.filter(
          (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
        ) as ApiEmergencyContact[];
        setContactMarkers(withCoords);
      } catch (error) {
        console.error('Error cargando contactos:', error);
        setContactMarkers([]);
      }
    })();
  }, []);

  // Calcular cuántos contactos están cerca del usuario (si hay coordenadas)
  useEffect(() => {
    if (!location || contactMarkers.length === 0) {
      setNearbyContacts(0);
      return;
    }

    const lat1 = location.coords.latitude;
    const lon1 = location.coords.longitude;
    const nearby = contactMarkers.filter((c) => {
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return false;
      const d = distanceKm(lat1, lon1, c.lat, c.lng);
      return d <= NEARBY_RADIUS_KM;
    }).length;

    setNearbyContacts(nearby);
  }, [location, contactMarkers]);

  // Obtener ruta desde la ubicación actual hasta el destino (si viene por params.lat/lng)
  useEffect(() => {
    const destLngLat =
      params.lat && params.lng
        ? [parseFloat(params.lng as string), parseFloat(params.lat as string)]
        : null;

    if (!location || !destLngLat || !MAPBOX_ACCESS_TOKEN) {
      setRouteCoords(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const from = [location.coords.longitude, location.coords.latitude];
        const to = destLngLat;
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

        const res = await fetch(url);
        const json = await res.json();

        if (!json?.routes?.[0]?.geometry?.coordinates) {
          if (!cancelled) setRouteCoords(null);
          return;
        }

        if (!cancelled) {
          setRouteCoords(json.routes[0].geometry.coordinates as number[][]);
        }
      } catch (error) {
        if (!cancelled) setRouteCoords(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, params.lat, params.lng]);

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

  const targetName = useMemo(
    () =>
      params.target?.toString().replace('club-', '').replace('-', ' ').toUpperCase(),
    [params.target],
  );

  const distanceToTargetKm = useMemo(() => {
    if (!location || !params.lat || !params.lng) return null;

    const lat2 = parseFloat(params.lat as string);
    const lon2 = parseFloat(params.lng as string);
    if (!Number.isFinite(lat2) || !Number.isFinite(lon2)) return null;

    return distanceKm(location.coords.latitude, location.coords.longitude, lat2, lon2);
  }, [location, params.lat, params.lng]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerWrapper}>
        <DashboardHeader title="SafeZone" subtitle="Mapa en tiempo real" />
      </View>
      
      <View style={styles.mapFullContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        ) : location ? (
          <MapboxGL.MapView
            style={styles.map}
            styleURL="mapbox://styles/mapbox/dark-v11"
            zoomEnabled
            scrollEnabled
            pitchEnabled={true}
            rotateEnabled={true}
            compassEnabled
          >
            <MapboxGL.Camera
              centerCoordinate={[location.coords.longitude, location.coords.latitude]}
              zoomLevel={16}
              minZoomLevel={10}
              maxZoomLevel={22}
              pitch={is3D ? 60 : 0}
              animationMode="flyTo"
              animationDuration={800}
            />

            {/* Marcador nativo de Mapbox con flecha de dirección */}
            <MapboxGL.UserLocation
              visible
              androidRenderMode="compass"
              showsUserHeadingIndicator
            />

            {/* Edificios 3D - solo si está en modo 3D */}
            {is3D && (
              <MapboxGL.FillExtrusionLayer
                id="building-3d"
                sourceID="composite"
                sourceLayerID="building"
                minZoomLevel={15}
                maxZoomLevel={22}
                style={{
                  fillExtrusionColor: '#1a1a1a',
                  fillExtrusionHeight: ['get', 'height'],
                  fillExtrusionBase: ['get', 'min_height'],
                  fillExtrusionOpacity: 0.85,
                }}
              />
            )}

            {/* Parques en verde oscuro */}
            <MapboxGL.FillLayer
              id="parks-fill"
              sourceID="composite"
              sourceLayerID="landuse"
              minZoomLevel={10}
              maxZoomLevel={22}
              filter={['==', ['get', 'class'], 'park']}
              style={{
                fillColor: '#052816',
                fillOpacity: 0.9,
              }}
            />

            {/* Ruta hacia el destino si existe */}
            {routeCoords && (
              <MapboxGL.ShapeSource
                id="route-source"
                shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: routeCoords,
                  },
                  properties: {},
                }}
              >
                <MapboxGL.LineLayer
                  id="route-layer"
                  style={{
                    lineColor: CTA,
                    lineWidth: 4,
                    lineOpacity: 0.9,
                    lineJoin: 'round',
                    lineCap: 'round',
                  }}
                />
              </MapboxGL.ShapeSource>
            )}

            {/* Marcador de club/discoteca si viene de clubs */}
            {params.lat && params.lng && (
              <MapboxGL.PointAnnotation
                id="club-destino"
                coordinate={[parseFloat(params.lng as string), parseFloat(params.lat as string)]}
              >
                <View style={styles.clubMarkerContainer}>
                  <Ionicons name="musical-notes" size={24} color="#fff" />
                </View>
              </MapboxGL.PointAnnotation>
            )}

            {/* Marcadores de contactos con ubicación conocida */}
            {contactMarkers.map((c) =>
              typeof c.lat === 'number' && typeof c.lng === 'number' ? (
                <MapboxGL.PointAnnotation
                  key={c.id}
                  id={`contact-${c.id}`}
                  coordinate={[c.lng as number, c.lat as number]}
                >
                  <View style={styles.contactMarkerOuter}>
                    <View style={styles.contactMarkerInner}>
                      <Ionicons name="person" size={16} color="#001311" />
                    </View>
                  </View>
                </MapboxGL.PointAnnotation>
              ) : null,
            )}
          </MapboxGL.MapView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="location-outline" size={48} color={TEXT_SECONDARY} />
            <Text style={styles.errorText}>No se pudo obtener tu ubicación</Text>
          </View>
        )}
      </View>

      {/* Floating Controls */}
      {params.target && (
        <View style={styles.destinationBanner}>
          <Ionicons name="navigate" size={18} color={ACCENT} />
          <Text style={styles.destinationText}>{targetName}</Text>
        </View>
      )}

      {/* Stats con contactos reales y distancia personalizada */}
      {location && (
        <View style={styles.statsOverlay}>
          <View style={styles.statPill}>
            <Ionicons name="people" size={14} color={ACCENT} />
            <Text style={styles.statPillText}>{nearbyContacts} cerca</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons
              name={distanceToTargetKm != null ? 'navigate' : 'speedometer'}
              size={14}
              color={distanceToTargetKm != null ? ACCENT : '#4ade80'}
            />
            <Text style={styles.statPillText}>
              {distanceToTargetKm != null
                ? `${distanceToTargetKm.toFixed(1)} km destino`
                : `±${location.coords.accuracy?.toFixed(0) || 0}m`}
            </Text>
          </View>
        </View>
      )}

      {/* Toggle 2D/3D - Más abajo */}
      <TouchableOpacity 
        style={styles.toggle3DButton}
        onPress={() => setIs3D(!is3D)}
        activeOpacity={0.8}
      >
        <Ionicons name={is3D ? "cube" : "square"} size={20} color={ACCENT} />
        <Text style={styles.toggle3DText}>{is3D ? '3D' : '2D'}</Text>
      </TouchableOpacity>

      {/* Botón de ubicación */}
      <TouchableOpacity 
        style={styles.locateButton} 
        onPress={refreshLocation} 
        disabled={loading}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={20} color={loading ? TEXT_SECONDARY : "#001311"} />
      </TouchableOpacity>
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
  headerWrapper: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 4 },
  
  // Fullscreen Map Container
  mapFullContainer: { 
    flex: 1, 
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  map: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 16,
    backgroundColor: BG,
  },
  loadingText: { color: TEXT_SECONDARY, fontSize: 14 },
  errorContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 16,
    backgroundColor: BG,
  },
  errorText: { color: TEXT_SECONDARY, fontSize: 14 },
  
  // Marcador de Usuario Personalizado (punto con anillo)
  userMarker: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59,130,246,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.6)',
  },
  userMarkerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: '#e5f0ff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  userMarkerArrow: {
    position: 'absolute',
    top: -2,
  },
  
  // Marcador 2D (plano con flecha)
  userMarker2D: {
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userMarker2DPulse: {
    position: 'absolute',
    bottom: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.4)',
  },
  userMarker2DDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 5,
  },
  userMarker2DArrow: {
    position: 'absolute',
    top: -2,
  },
  
  // Marcador 3D (con sombra y flecha)
  userMarker3D: {
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker3DBase: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker3DPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  userMarker3DDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  userMarker3DArrow: {
    position: 'absolute',
    top: -5,
  },
  
  // Floating Destination Banner
  destinationBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(12,11,12,0.92)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  destinationText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  
  // Toggle 2D/3D Button - Más abajo
  toggle3DButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(12,11,12,0.92)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  toggle3DText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Stats Overlay - Más abajo
  statsOverlay: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(12,11,12,0.92)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statPillText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Locate Button - Rediseñado
  locateButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Club Marker - Mejorado
  clubMarkerContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#ff6b6b', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 4, 
    borderColor: '#fff', 
    shadowColor: '#ff6b6b', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 1, 
    shadowRadius: 16, 
    elevation: 12,
  },
  contactMarkerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.7)',
  },
  contactMarkerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00e0b8',
  },
  
});
