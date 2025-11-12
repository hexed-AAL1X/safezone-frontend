import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

// Datos de ejemplo de conductores
const DRIVERS: Record<string, any> = {
  'd1': { id: 'd1', name: 'Luis Rojas', rating: 4.9, verified: true, avatar: '👨‍🦲', vehicle: 'Toyota Corolla', plate: 'ABC-123', trips: 1250, phone: '+51 987 654 321', license: 'Q12345678', age: 42, experience: '15 años', background: 'Verificado', emergencyContact: 'María Rojas (+51 912 345 678)' },
  'd2': { id: 'd2', name: 'María Pérez', rating: 4.8, verified: true, avatar: '👩', vehicle: 'Honda Civic', plate: 'XYZ-789', trips: 890, phone: '+51 998 765 432', license: 'Q87654321', age: 35, experience: '10 años', background: 'Verificado', emergencyContact: 'Pedro Pérez (+51 923 456 789)' },
  'd3': { id: 'd3', name: 'Jorge Salas', rating: 4.5, verified: true, avatar: '👨', vehicle: 'Nissan Sentra', plate: 'DEF-456', trips: 650, phone: '+51 956 789 012', license: 'Q11223344', age: 38, experience: '8 años', background: 'Verificado', emergencyContact: 'Ana Salas (+51 934 567 890)' },
  'd4': { id: 'd4', name: 'Carmen Vega', rating: 4.7, verified: true, avatar: '👩‍🦱', vehicle: 'Hyundai Accent', plate: 'GHI-321', trips: 420, phone: '+51 945 678 901', license: 'Q55667788', age: 29, experience: '5 años', background: 'Verificado', emergencyContact: 'Luis Vega (+51 967 890 123)' },
};

export default function DriverProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const driver = DRIVERS[id || ''];

  if (!driver) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Conductor no encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del Conductor</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar y nombre */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{driver.avatar}</Text>
            {driver.verified && (
              <View style={styles.verifiedBadgeLarge}>
                <Ionicons name="shield-checkmark" size={20} color="#001311" />
              </View>
            )}
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#fbbf24" />
            <Text style={styles.ratingText}>{driver.rating}</Text>
            <Text style={styles.tripsText}>• {driver.trips} viajes</Text>
          </View>
        </View>

        {/* Información del vehículo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={20} color={ACCENT} />
            <Text style={styles.sectionTitle}>Vehículo</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modelo</Text>
              <Text style={styles.infoValue}>{driver.vehicle}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Placa</Text>
              <Text style={styles.infoValue}>{driver.plate}</Text>
            </View>
          </View>
        </View>

        {/* Datos personales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={ACCENT} />
            <Text style={styles.sectionTitle}>Datos Personales</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{driver.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Licencia</Text>
              <Text style={styles.infoValue}>{driver.license}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Edad</Text>
              <Text style={styles.infoValue}>{driver.age} años</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experiencia</Text>
              <Text style={styles.infoValue}>{driver.experience}</Text>
            </View>
          </View>
        </View>

        {/* Seguridad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={ACCENT} />
            <Text style={styles.sectionTitle}>Verificación de Seguridad</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Antecedentes</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.verifiedTagText}>{driver.background}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contacto de emergencia</Text>
              <Text style={[styles.infoValue, { fontSize: 12 }]}>{driver.emergencyContact}</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="chatbubbles" size={20} color="#001311" />
            <Text style={styles.primaryBtnText}>ENVIAR MENSAJE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons name="call" size={20} color={ACCENT} />
            <Text style={styles.secondaryBtnText}>LLAMAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '700' },
  profileSection: { alignItems: 'center', paddingVertical: 24 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(0,255,209,0.3)', position: 'relative', marginBottom: 16 },
  avatarLargeText: { fontSize: 48 },
  verifiedBadgeLarge: { position: 'absolute', bottom: -4, right: -4, width: 36, height: 36, borderRadius: 18, backgroundColor: CTA, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: BG },
  driverName: { color: TEXT, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: TEXT, fontSize: 18, fontWeight: '600' },
  tripsText: { color: TEXT_SECONDARY, fontSize: 14 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: TEXT, fontSize: 16, fontWeight: '700' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: TEXT_SECONDARY, fontSize: 14 },
  infoValue: { color: TEXT, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74, 222, 128, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.3)' },
  verifiedTagText: { color: '#4ade80', fontSize: 12, fontWeight: '600' },
  actionsSection: { paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  primaryBtn: { backgroundColor: CTA, paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#001311', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { backgroundColor: 'rgba(0,255,209,0.12)', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: 'rgba(0,255,209,0.3)' },
  secondaryBtnText: { color: ACCENT, fontSize: 16, fontWeight: '700' },
  errorText: { color: TEXT, textAlign: 'center', marginTop: 50 },
});
