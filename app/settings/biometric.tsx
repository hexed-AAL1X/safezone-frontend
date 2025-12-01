import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';

export default function BiometricSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [hasHardware, setHasHardware] = useState<boolean | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [typesLabel, setTypesLabel] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const has = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        setHasHardware(has);
        setIsEnrolled(enrolled);

        if (supported && supported.length > 0) {
          const labels = supported.map((t) => {
            switch (t) {
              case LocalAuthentication.AuthenticationType.FINGERPRINT:
                return 'Huella dactilar';
              case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                return 'Reconocimiento facial';
              case LocalAuthentication.AuthenticationType.IRIS:
                return 'Iris';
              default:
                return 'Biometría';
            }
          });
          setTypesLabel(labels.join(', '));
        }
      } catch (error) {
        console.error('Error obteniendo info biométrica:', error);
      }
    })();
  }, []);

  const statusText = () => {
    if (hasHardware === false) return 'Tu dispositivo no tiene biometría disponible.';
    if (hasHardware === null) return 'Comprobando compatibilidad biométrica...';
    if (!isEnrolled) return 'No tienes ninguna huella o biometría registrada en este dispositivo.';
    return 'Tu dispositivo tiene biometría configurada y puede usarse para el botón SOS.';
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autenticación biométrica</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Ionicons name="finger-print" size={32} color={ACCENT} />
          <Text style={styles.infoTitle}>Biometría para el botón SOS</Text>
          <Text style={styles.infoText}>
            SafeZone usa la biometría que ya tienes registrada en tu teléfono (como huella o rostro) para
            confirmar que eres tú antes de activar el SOS.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado de la biometría del dispositivo</Text>
          <Text style={styles.statusText}>{statusText()}</Text>
          {typesLabel ? (
            <Text style={styles.statusExtra}>Tipos disponibles: {typesLabel}</Text>
          ) : null}
        </View>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Añadir o eliminar huellas</Text>
          <Text style={styles.helpText}>
            Para gestionar tus huellas o rostros registrados debes usar los ajustes de seguridad del sistema
            de tu teléfono. SafeZone solo los utiliza; no puede ver ni guardar tus huellas.
          </Text>
          <Text style={styles.helpText}>
            Asegúrate de tener al menos una huella registrada para poder usar la autenticación biométrica en el
            botón SOS.
          </Text>
        </View>
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
  infoCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', marginBottom: 16, gap: 8 },
  infoTitle: { color: TEXT, fontSize: 16, fontWeight: '600' },
  infoText: { color: TEXT_SECONDARY, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  statusCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  statusTitle: { color: TEXT, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  statusText: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 18 },
  statusExtra: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 6 },
  helpBox: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 4 },
  helpTitle: { color: TEXT, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  helpText: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 18 },
});
