import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';
const DANGER = '#ff6b6b';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const navigateToProfile = useThrottle(() => router.push('/settings/profile' as any), 800);
  const navigateToPlans = useThrottle(() => router.push('/settings/plans' as any), 800);
  const navigateToDangerZone = useThrottle(() => router.push('/settings/danger-zone' as any), 800);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            // Aquí iría la lógica de logout
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUENTA</Text>
          
          <TouchableOpacity style={styles.profileCard} onPress={navigateToProfile}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Usuario Demo</Text>
              <Text style={styles.profileEmail}>usuario@safezone.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUSCRIPCIÓN</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPlans}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="diamond-outline" size={20} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Plan actual</Text>
              <Text style={styles.menuSubtext}>Gratuito</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="notifications-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Notificaciones</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }}
              thumbColor={notifications ? CTA : '#777'}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="location-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Compartir ubicación</Text>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }}
              thumbColor={locationSharing ? CTA : '#777'}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="moon-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Modo oscuro</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }}
              thumbColor={darkMode ? CTA : '#777'}
            />
          </View>
        </View>

        {/* Seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEGURIDAD</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Contactos de emergencia</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="finger-print-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Autenticación biométrica</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="document-text-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Términos y condiciones</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Política de privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Ayuda y soporte</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="information-circle-outline" size={20} color={ACCENT} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Versión</Text>
            <Text style={styles.menuSubtext}>1.0.0</Text>
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={TEXT} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Zona peligrosa */}
        <TouchableOpacity style={styles.dangerZoneBtn} onPress={navigateToDangerZone}>
          <Ionicons name="warning-outline" size={20} color={DANGER} />
          <Text style={styles.dangerZoneText}>Zona Peligrosa</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { padding: 4 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 64, height: 64, borderRadius: 64, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: ACCENT },
  profileName: { color: TEXT, fontSize: 16, fontWeight: '600' },
  profileEmail: { color: TEXT_SECONDARY, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  menuIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(0,255,209,0.08)', alignItems: 'center', justifyContent: 'center' },
  menuText: { color: TEXT, fontSize: 15 },
  menuSubtext: { color: TEXT_SECONDARY, fontSize: 13 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 8 },
  logoutText: { color: TEXT, fontSize: 15, fontWeight: '600' },
  dangerZoneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,107,107,0.08)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)', marginTop: 12 },
  dangerZoneText: { color: DANGER, fontSize: 15, fontWeight: '600' },
});
