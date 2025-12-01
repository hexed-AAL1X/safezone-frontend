import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, Animated, Easing, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {
  getClubs,
  type ApiClub,
  sendSosAlert,
  getMyEmergencyContacts,
  type ApiEmergencyContact,
} from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

const NEARBY_RADIUS_KM = 2; // mismo radio que el mapa para considerar un contacto "cercano"

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [topClub, setTopClub] = useState<ApiClub | null>(null);
  const [loadingTopClub, setLoadingTopClub] = useState(true);
  const [nearestContact, setNearestContact] = useState<ApiEmergencyContact | null>(null);
  const [nearestContactDistanceKm, setNearestContactDistanceKm] = useState<number | null>(null);
  const [loadingNearestContact, setLoadingNearestContact] = useState(true);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const holdProgress = useRef(new Animated.Value(0)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const holdActiveRef = useRef(false);

  // Animación de pulso para el SOS cuando está armado
  useEffect(() => {
    if (armed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [armed]);

  const handleTrackNearestContact = useThrottle(() => {
    if (!nearestContact || typeof nearestContact.lat !== 'number' || typeof nearestContact.lng !== 'number') {
      return;
    }

    router.push({
      pathname: '/(tabs)/map',
      params: {
        target: `contact-${nearestContact.id}`,
        lat: nearestContact.lat.toString(),
        lng: nearestContact.lng.toString(),
        name: nearestContact.name,
      },
    } as any);
  }, 800);

  const toggleArm = () => setArmed(!armed);
  
  const handleSosPressIn = () => {
    if (!armed || active) return;
    holdActiveRef.current = true;
    holdProgress.setValue(0);

    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && holdActiveRef.current && armed && !active) {
        triggerSOS();
      }
    });
  };

  const handleSosPressOut = () => {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;

    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  
  const handleCallEmergency = () => {
    Alert.alert(
      'Llamar a emergencias',
      '¿Quieres llamar al número de emergencias 105?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          style: 'destructive',
          onPress: () => {
            try {
              Linking.openURL('tel:105');
            } catch (error) {
              console.error('Error al intentar llamar a emergencias:', error);
            }
          },
        },
      ],
    );
  };

  const handleOpenMap = () => {
    router.push('/(tabs)/map' as any);
  };

  const handleOpenContacts = () => {
    router.push('/(tabs)/contacts' as any);
  };
  
  const startRecording = async (): Promise<boolean> => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso al micrófono para grabar audio SOS.');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setRecording(true);
      return true;
    } catch (error) {
      console.error('Error iniciando grabación SOS:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación de audio SOS.');
      return false;
    }
  };

  const stopRecordingAndSend = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setRecording(false);

      if (!uri) return;

      console.log('🎧 Archivo SOS guardado en:', uri);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const loc = lastLocationRef.current;

      try {
        await sendSosAlert({
          audioBase64: base64,
          mimeType: 'audio/m4a',
          lat: loc?.lat,
          lng: loc?.lng,
        });
      } catch (error: any) {
        console.error('Error enviando alerta SOS al backend:', error);
        Alert.alert('Error', error?.message || 'No se pudo enviar la alerta SOS.');
        return;
      }

      Alert.alert(
        'Alerta SOS enviada',
        'Tu audio SOS y ubicación se han enviado automáticamente a tus contactos de emergencia.',
      );
    } catch (error) {
      console.error('Error al detener/guardar grabación SOS:', error);
    }
  };
  
  const triggerSOS = async () => {
    if (!armed) return;

    // Autenticación biométrica antes de activar SOS
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirma con tu huella para activar SOS',
          fallbackLabel: 'Usar código del dispositivo',
        });

        if (!result.success) {
          return;
        }
      }
    } catch (error) {
      console.error('Error en autenticación biométrica para SOS:', error);
      return;
    }
    const started = await startRecording();
    if (!started) {
      return;
    }

    setActive(true);
    
    // Obtener ubicación actual
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        lastLocationRef.current = { lat: latitude, lng: longitude };
        
        // Simular envío de alerta a contactos
        Alert.alert(
          '🚨 ALERTA SOS ACTIVADA',
          `📍 Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n✅ Contactos de emergencia notificados\n🎙️ Grabación de audio iniciada\n🚓 Policía contactada automáticamente\n\n⏱️ Seguimiento en tiempo real activado`,
          [{ text: 'OK' }]
        );
        
        setAlertSent(true);
        
        // Simular grabación de audio (en producción usarías expo-av)
        console.log('🎙️ Grabación de audio iniciada');
        console.log(`📍 Ubicación actual: ${latitude}, ${longitude}`);
        console.log('📧 Alertas enviadas a contactos de emergencia');
        console.log('🚓 Notificación enviada a la policía');
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
    
    // Detener después de 10 segundos (demo) y procesar audio
    setTimeout(() => {
      setActive(false);
      setAlertSent(false);
      stopRecordingAndSend();
    }, 10000);
  };
  
  // Animación de pulso cuando está activo
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [active]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const clubs = await getClubs();
        if (!clubs || clubs.length === 0) {
          if (!cancelled) setTopClub(null);
          return;
        }

        const best = [...clubs].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
        if (!cancelled) setTopClub(best);
      } catch (error) {
        console.error('Error cargando reviews de lugares:', error);
        if (!cancelled) setTopClub(null);
      } finally {
        if (!cancelled) setLoadingTopClub(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar contacto de emergencia más cercano con ubicación visible
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setNearestContact(null);
            setNearestContactDistanceKm(null);
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = current.coords;

        const contacts = await getMyEmergencyContacts();
        const withCoords = contacts.filter(
          (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
        ) as ApiEmergencyContact[];

        if (withCoords.length === 0) {
          if (!cancelled) {
            setNearestContact(null);
            setNearestContactDistanceKm(null);
          }
          return;
        }

        let best: ApiEmergencyContact | null = null;
        let bestD = Infinity;

        for (const c of withCoords) {
          const d = distanceKm(latitude, longitude, c.lat as number, c.lng as number);
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }

        if (!cancelled) {
          if (best && bestD <= NEARBY_RADIUS_KM) {
            setNearestContact(best);
            setNearestContactDistanceKm(bestD);
          } else {
            setNearestContact(null);
            setNearestContactDistanceKm(null);
          }
        }
      } catch (error) {
        console.error('Error cargando contacto cercano:', error);
        if (!cancelled) {
          setNearestContact(null);
          setNearestContactDistanceKm(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingNearestContact(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerWrapper}>
        <DashboardHeader title="SafeZone" subtitle="Inicio SafeZone" />
      </View>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom + 16) }]}
        showsVerticalScrollIndicator={false}
      >

      {/* SOS Hero Card */}
      <View style={styles.sosHeroCard}>
        <View style={styles.sosHeader}>
          <View style={styles.sosHeaderLeft}>
            <View style={styles.sosIconBadge}>
              <Ionicons name="notifications" size={22} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sosCardTitle}>Alerta de Emergencia</Text>
              <Text style={styles.sosCardSubtitle}>Presiona el botón para enviar SOS</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.statusPill, armed ? styles.statusPillActive : styles.statusPillInactive]} 
            onPress={toggleArm}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={armed ? 'shield-checkmark' : 'power-outline'} 
              size={16} 
              color={armed ? ACCENT : TEXT_SECONDARY} 
            />
            <Text style={[styles.statusText, armed && styles.statusTextActive]}>
              {armed ? 'SOS activado' : 'SOS apagado'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sosButtonContainer}>
          {/* Anillos de resplandor */}
          <Animated.View style={[
            styles.glowRing, 
            styles.glowRing1, 
            armed && styles.glowRingActive,
            { transform: [{ scale: pulseAnim }] }
          ]} />
          <View style={[styles.glowRing, styles.glowRing2, armed && styles.glowRingActive]} />
          <View style={[styles.glowRing, styles.glowRing3, armed && styles.glowRingActive]} />
          
          {/* Botón SOS Principal */}
          <TouchableOpacity
            activeOpacity={0.95}
            style={[
              styles.sosMainButton, 
              armed && styles.sosMainButtonArmed, 
              active && styles.sosMainButtonActive
            ]}
            onPressIn={handleSosPressIn}
            onPressOut={handleSosPressOut}
            disabled={!armed}
          >
            <View style={styles.sosButtonInner}>
              <Animated.View
                style={[
                  styles.sosHoldFill,
                  {
                    transform: [
                      {
                        scale: holdProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: holdProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.8],
                    }),
                  },
                ]}
              />
              <Ionicons 
                name="finger-print" 
                size={56} 
                color={armed ? (active ? '#fff' : '#001311') : 'rgba(0,255,255,0.3)'} 
              />
              <Text style={[
                styles.sosMainButtonText,
                armed && styles.sosMainButtonTextArmed,
                active && styles.sosMainButtonTextActive
              ]}>SOS</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sosInstructions}>
          <Ionicons 
            name={armed ? 'finger-print-outline' : 'lock-closed-outline'} 
            size={18} 
            color={armed ? ACCENT : TEXT_SECONDARY} 
          />
          <Text style={[styles.sosInstructionText, armed && styles.sosInstructionTextActive]}>
            {armed 
              ? 'Mantén presionado 2 segundos para enviar la alerta' 
              : 'Activa el botón de arriba para poder usar el SOS'}
          </Text>
        </View>
        
        {/* Indicadores de estado activo */}
        {active && (
          <View style={styles.activeStatusBanner}>
            {recording && (
              <View style={styles.statusBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.statusBadgeText}>Grabando audio</Text>
              </View>
            )}
            {alertSent && (
              <>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4ade80" />
                  <Text style={[styles.statusBadgeText, { color: '#4ade80' }]}>Contactos alertados</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#4ade80" />
                  <Text style={[styles.statusBadgeText, { color: '#4ade80' }]}>Policía notificada</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Accesos Rápidos */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionLabel}>ACCESOS RÁPIDOS</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionTile}
            onPress={handleCallEmergency}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Ionicons name="call" size={24} color="#ef4444" />
            </View>
            <Text style={styles.quickActionTitle}>Emergencias</Text>
            <Text style={styles.quickActionDesc}>Llamar al 105</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionTile}
            onPress={handleOpenMap}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
              <Ionicons name="map" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.quickActionTitle}>Mapa</Text>
            <Text style={styles.quickActionDesc}>Ver ubicación</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionTile}
            onPress={handleOpenContacts}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
              <Ionicons name="people" size={24} color="#a855f7" />
            </View>
            <Text style={styles.quickActionTitle}>Contactos</Text>
            <Text style={styles.quickActionDesc}>Ver aliados</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionTile}
            onPress={() => router.push('/(tabs)/community' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
            </View>
            <Text style={styles.quickActionTitle}>Comunidad</Text>
            <Text style={styles.quickActionDesc}>Grupos cerca</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lugar Destacado */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>LUGAR DESTACADO</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/clubs' as any)}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color={ACCENT} />
          </TouchableOpacity>
        </View>

        {loadingTopClub ? (
          <View style={styles.featuredCard}>
            <Text style={styles.loadingText}>Cargando lugares...</Text>
          </View>
        ) : !topClub ? (
          <View style={styles.featuredCard}>
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={32} color={TEXT_SECONDARY} />
              <Text style={styles.emptyText}>No hay lugares disponibles</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/clubs' as any)}
          >
            <View style={styles.featuredCardHeader}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>{topClub.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.reviewCount}>
                <Text style={styles.reviewCountText}>{topClub.reviews} reviews</Text>
              </View>
            </View>

            <Text style={styles.featuredPlaceName}>{topClub.name}</Text>
            
            <View style={styles.placeMetaRow}>
              <View style={styles.placeMetaItem}>
                <Ionicons name="location-outline" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.placeMetaText}>2.3 km</Text>
              </View>
              <View style={styles.placeMetaItem}>
                <Ionicons name="time-outline" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.placeMetaText}>{topClub.openUntil || 'Cerrado'}</Text>
              </View>
              <View style={styles.placeMetaItem}>
                <Text style={styles.priceLevelText}>{'$'.repeat(topClub.priceLevel)}</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {topClub.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Contacto Cercano */}
      <View style={styles.nearbyContactSection}>
        <Text style={styles.sectionLabel}>CONTACTO CERCANO</Text>
        {loadingNearestContact ? (
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Buscando contactos con ubicación...</Text>
              <Text style={styles.contactLocation}>
                Esto puede tardar unos segundos.
              </Text>
            </View>
          </View>
        ) : !nearestContact ? (
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Sin contactos cercanos</Text>
              <Text style={styles.contactLocation}>
                Añade contactos con ubicación visible para verlos aquí.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(nearestContact.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{nearestContact.name}</Text>
              <View style={styles.contactLocationRow}>
                <Ionicons name="location" size={12} color="#4ade80" />
                <Text style={styles.contactLocation}>
                  {nearestContactDistanceKm != null
                    ? `${nearestContactDistanceKm.toFixed(1)} km • ubicación cercana`
                    : 'Ubicación compartida'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.trackButton}
              onPress={handleTrackNearestContact}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={16} color="#001311" />
              <Text style={styles.trackButtonText}>Rastrear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 0 },
  headerWrapper: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 4 },
  
  // SOS Hero Card
  sosHeroCard: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 24, 
    padding: 20, 
    marginTop: 12,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  sosHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  sosIconBadge: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: 'rgba(0,255,255,0.12)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  sosCardTitle: { color: TEXT, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  sosCardSubtitle: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  
  // Status Pill
  statusPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 999,
    borderWidth: 1.5,
  },
  statusPillActive: { 
    backgroundColor: 'rgba(0,255,255,0.15)', 
    borderColor: ACCENT,
  },
  statusPillInactive: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusDotActive: { 
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: { color: TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  statusTextActive: { color: ACCENT },
  
  // SOS Button
  sosButtonContainer: { 
    position: 'relative', 
    width: '100%', 
    height: 240, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginVertical: 8,
  },
  glowRing: { 
    position: 'absolute', 
    borderRadius: 999, 
    borderWidth: 2, 
    borderColor: 'rgba(0,255,255,0.15)',
  },
  glowRing1: { width: 240, height: 240 },
  glowRing2: { width: 200, height: 200 },
  glowRing3: { width: 160, height: 160 },
  glowRingActive: { 
    borderColor: ACCENT, 
    shadowColor: ACCENT, 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 20,
  },
  sosMainButton: { 
    width: 140, 
    height: 140, 
    borderRadius: 999, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 4, 
    borderColor: 'rgba(0,255,255,0.2)',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  sosHoldFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  sosMainButtonArmed: { 
    backgroundColor: ACCENT, 
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 1,
    shadowRadius: 32,
  },
  sosMainButtonActive: { 
    backgroundColor: '#ff6b6b', 
    borderColor: '#ff6b6b',
    shadowColor: '#ff6b6b',
  },
  sosButtonInner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  sosMainButtonText: { 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 18, 
    fontWeight: '800', 
    letterSpacing: 2,
    marginTop: 4,
  },
  sosMainButtonTextArmed: { color: '#001311' },
  sosMainButtonTextActive: { color: '#fff' },
  
  // SOS Instructions
  sosInstructions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sosInstructionText: { 
    color: TEXT_SECONDARY, 
    fontSize: 13, 
    textAlign: 'center',
    flex: 1,
  },
  sosInstructionTextActive: { color: ACCENT },
  
  // Active Status Banner
  activeStatusBanner: { 
    marginTop: 16, 
    gap: 8, 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: 'rgba(255,107,107,0.12)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  pulsingDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#ff6b6b',
  },
  statusBadgeText: { color: '#ff6b6b', fontSize: 11, fontWeight: '600' },
  
  // Quick Access Section
  quickAccessSection: { marginTop: 24 },
  sectionLabel: { 
    color: TEXT_SECONDARY, 
    fontSize: 11, 
    fontWeight: '700', 
    letterSpacing: 1.2, 
    marginBottom: 12,
  },
  quickActionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
  },
  quickActionTile: { 
    width: '47.5%', 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    padding: 16, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionTitle: { 
    color: TEXT, 
    fontSize: 14, 
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionDesc: { 
    color: TEXT_SECONDARY, 
    fontSize: 11,
    textAlign: 'center',
  },
  
  // Featured Section
  featuredSection: { marginTop: 32 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12,
  },
  seeAllBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,255,0.08)',
  },
  seeAllText: { color: ACCENT, fontSize: 12, fontWeight: '600' },
  featuredCard: { 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    padding: 18, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 14,
  },
  loadingText: { color: TEXT_SECONDARY, textAlign: 'center', paddingVertical: 20 },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { color: TEXT_SECONDARY, fontSize: 13 },
  featuredCardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: 'rgba(251,191,36,0.15)', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  ratingText: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
  reviewCount: { 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reviewCountText: { color: TEXT_SECONDARY, fontSize: 11 },
  featuredPlaceName: { 
    color: TEXT, 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  placeMetaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  placeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeMetaText: { color: TEXT_SECONDARY, fontSize: 12 },
  priceLevelText: { color: ACCENT, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { 
    backgroundColor: 'rgba(0,255,255,0.1)', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  tagText: { color: ACCENT, fontSize: 11, fontWeight: '600' },
  
  // Nearby Contact Section
  nearbyContactSection: { marginTop: 32, marginBottom: 12 },
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    padding: 16, 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  contactAvatar: { position: 'relative' },
  avatarPlaceholder: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: 'rgba(0,255,255,0.15)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  avatarText: { color: ACCENT, fontSize: 24, fontWeight: '700' },
  onlineIndicator: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#4ade80',
    borderWidth: 2.5,
    borderColor: BG,
  },
  contactInfo: { flex: 1, gap: 4 },
  contactName: { color: TEXT, fontSize: 16, fontWeight: '700' },
  contactLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactLocation: { color: TEXT_SECONDARY, fontSize: 12 },
  trackButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: ACCENT, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 12,
  },
  trackButtonText: { color: '#001311', fontSize: 13, fontWeight: '700' },
});
