import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';
import * as Location from 'expo-location';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const navigateToMap = useThrottle(() => {
    router.push('/(tabs)/map?target=club-c1' as any);
  }, 800);

  const toggleArm = () => setArmed(!armed);
  
  const triggerSOS = async () => {
    if (!armed) return;
    
    setActive(true);
    setRecording(true);
    
    // Obtener ubicación actual
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
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
    
    // Detener después de 10 segundos (demo)
    setTimeout(() => {
      setActive(false);
      setRecording(false);
      setAlertSent(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="shield-outline" size={20} color={ACCENT} />
          <Text style={styles.headerBrand}>SAFEZONE</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.planBadge}><Text style={styles.planText}>PLAN GRATUITO</Text></View>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sosWrap}>
        <Text style={styles.sosTitle}>SOS INTELIGENTE</Text>
        
        <View style={styles.sosContainer}>
          {/* Anillos de neón */}
          <View style={[styles.neonRing, styles.neonRing1, armed && styles.neonRingActive]} />
          <View style={[styles.neonRing, styles.neonRing2, armed && styles.neonRingActive]} />
          <View style={[styles.neonRing, styles.neonRing3, armed && styles.neonRingActive]} />
          
          {/* Botón central */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.sosButton, armed && styles.sosArmed, active && styles.sosActive]}
            onPress={triggerSOS}
            onLongPress={triggerSOS}
          >
            <Text style={styles.sosButtonTitle}>SOS</Text>
            <Text style={styles.sosButtonSubtitle}>INTELIGENTE</Text>
            <Ionicons name="finger-print" size={48} color={armed ? '#001311' : ACCENT} style={{ marginTop: 8 }} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.armToggle, armed ? styles.armOn : styles.armOff]} onPress={toggleArm}>
          <Ionicons name={armed ? 'lock-open' : 'lock-closed'} size={16} color={armed ? '#001311' : TEXT} />
          <Text style={[styles.armText, armed && { color: '#001311' }]}>{armed ? 'Armado' : 'Desarmado'}</Text>
        </TouchableOpacity>
        <Text style={styles.sosHint}>{armed ? 'Mantén pulsado 3 segundos para activar' : 'Activa el botón para habilitar el SOS'}</Text>
        
        {/* Indicadores de estado cuando está activo */}
        {active && (
          <View style={styles.activeIndicators}>
            {recording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>🎙️ GRABANDO AUDIO</Text>
              </View>
            )}
            {alertSent && (
              <View style={styles.alertIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.alertText}>✅ Contactos notificados</Text>
              </View>
            )}
            {alertSent && (
              <View style={styles.alertIndicator}>
                <Ionicons name="shield-checkmark" size={16} color="#4ade80" />
                <Text style={styles.alertText}>🚓 Policía contactada</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="people" size={20} color={ACCENT} />
          </View>
          <Text style={styles.featureTitle}>1. ALERTA CONTACTOS</Text>
          <Text style={styles.featureDesc}>Notifica instantáneamente a tus contactos de emergencia</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={20} color={ACCENT} />
          </View>
          <Text style={styles.featureTitle}>2. AVISO POLICÍA</Text>
          <Text style={styles.featureDesc}>Envía tu ubicación a las autoridades locales</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="videocam" size={20} color={ACCENT} />
          </View>
          <Text style={styles.featureTitle}>3. GRABACIÓN AUTO</Text>
          <Text style={styles.featureDesc}>Inicia grabación de audio y video automáticamente</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="location" size={20} color={ACCENT} />
          </View>
          <Text style={styles.featureTitle}>4. TRACKING GPS</Text>
          <Text style={styles.featureDesc}>Comparte tu ubicación en tiempo real</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Reviews de lugares</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>Gratuito</Text></View>
        </View>
        <View style={styles.reviewCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.ratingScore}>4.5</Text>
              <Ionicons name="star" size={16} color="#ffd166" />
              <Ionicons name="star" size={16} color="#ffd166" />
              <Ionicons name="star" size={16} color="#ffd166" />
              <Ionicons name="star" size={16} color="#ffd166" />
              <Ionicons name="star-half" size={16} color="#ffd166" />
            </View>
            <Text style={styles.placeName}>DISCOTECA LA CUEVA</Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}><Text style={styles.chipText}>SEGURIDAD</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>STAFF</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>PROTOCOLO</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>LUZ Y SALIDAS</Text></View>
              <View style={[styles.chip, styles.chipWarn]}><Text style={[styles.chipText, styles.chipWarnText]}>ACOSO (2)</Text></View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={TEXT_SECONDARY} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mapa de contactos</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>Gratuito</Text></View>
        </View>
        <View style={styles.contactMapCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.placeName}>DISCOTECA LA CUEVA</Text>
            <Text style={styles.placeMeta}>Sara • Cercana</Text>
          </View>
          <TouchableOpacity style={styles.viewMapCta} onPress={navigateToMap}>
            <Text style={styles.viewMapText}>VER UBICACIÓN EN TIEMPO REAL</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  headerBrand: { color: TEXT, letterSpacing: 1.2, fontWeight: '600' },
  planBadge: { backgroundColor: 'rgba(0,255,209,0.12)', borderColor: 'rgba(0,255,209,0.35)', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  planText: { color: ACCENT, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  sosWrap: { alignItems: 'center', marginVertical: 24 },
  sosTitle: { color: TEXT, fontSize: 16, letterSpacing: 2, marginBottom: 24, fontWeight: '700' },
  sosContainer: { position: 'relative', width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  neonRing: { position: 'absolute', borderRadius: 999, borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)' },
  neonRing1: { width: 220, height: 220 },
  neonRing2: { width: 190, height: 190 },
  neonRing3: { width: 160, height: 160 },
  neonRingActive: { borderColor: ACCENT, shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  sosButton: { width: 130, height: 130, borderRadius: 130, backgroundColor: 'rgba(0,255,209,0.08)', borderWidth: 3, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sosArmed: { backgroundColor: ACCENT, borderColor: ACCENT, shadowOpacity: 0.8, shadowRadius: 20 },
  sosActive: { backgroundColor: '#ff6b6b', borderColor: '#ff6b6b', shadowColor: '#ff6b6b' },
  sosButtonTitle: { color: TEXT, fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  sosButtonSubtitle: { color: TEXT_SECONDARY, fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  armToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 10 },
  armOn: { backgroundColor: CTA, borderColor: CTA },
  armOff: { backgroundColor: 'rgba(255,255,255,0.05)' },
  armText: { color: TEXT },
  sosHint: { color: TEXT_SECONDARY, marginTop: 6 },
  activeIndicators: { marginTop: 16, gap: 8, alignItems: 'center' },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,107,107,0.12)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff6b6b' },
  recordingText: { color: '#ff6b6b', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  alertIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(74,222,128,0.12)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  alertText: { color: '#4ade80', fontSize: 11, fontWeight: '600' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  featureCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featureTitle: { color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  featureDesc: { color: TEXT_SECONDARY, fontSize: 10, lineHeight: 14 },
  section: { marginTop: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { color: TEXT },
  badge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badgeText: { color: TEXT_SECONDARY, fontSize: 11 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  placeName: { color: TEXT },
  placeMeta: { color: TEXT_SECONDARY, marginTop: 2 },
  ratingScore: { color: TEXT, fontSize: 16, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { color: TEXT_SECONDARY, fontSize: 11 },
  chipWarn: { backgroundColor: 'rgba(255,0,0,0.12)', borderColor: 'rgba(255,0,0,0.25)' },
  chipWarnText: { color: '#ff8b8b' },
  contactMapCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 36, height: 36, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  viewMapCta: { backgroundColor: CTA, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  viewMapText: { color: '#001311', fontWeight: '600' },
  settingsBtn: { padding: 8, backgroundColor: 'rgba(0,255,209,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,209,0.2)' },
});
