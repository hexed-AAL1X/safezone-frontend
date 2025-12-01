import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteMyAccount, resetMyData } from '@/lib/api';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const DANGER = '#ff6b6b';

export default function DangerZoneScreen() {
  const insets = useSafeAreaInsets();
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = () => {
    if (confirmText !== 'ELIMINAR') {
      Alert.alert('Error', 'Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    Alert.alert(
      '⚠️ Última advertencia',
      'Esta acción es IRREVERSIBLE. Se eliminarán todos tus datos, contactos, historial y suscripciones. ¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteMyAccount();

              // Limpiar credenciales locales
              await AsyncStorage.multiRemove(['auth_token', 'auth_user']);

              Alert.alert('Cuenta eliminada', res.message || 'Tu cuenta ha sido eliminada permanentemente.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/login' as any),
                },
              ]);
            } catch (error: any) {
              console.error('Error al eliminar la cuenta:', error);
              Alert.alert('Error', error?.message || 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Restablecer datos',
      'Se eliminarán tus chats, ubicaciones y configuraciones de SafeZone. Tu cuenta (nombre, correo, teléfono, contraseña) permanecerá activa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await resetMyData();
              Alert.alert('Éxito', res.message || 'Datos restablecidos correctamente');
            } catch (error: any) {
              console.error('Error al restablecer datos:', error);
              Alert.alert('Error', error?.message || 'No se pudieron restablecer los datos.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zona Peligrosa</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(24, insets.bottom + 12) },
        ]}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={32} color={DANGER} />
          <Text style={styles.warningTitle}>¡Precaución!</Text>
          <Text style={styles.warningText}>
            Las acciones en esta sección son irreversibles y pueden resultar en pérdida permanente de datos.
          </Text>
        </View>

        {/* Restablecer datos */}
        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <Ionicons name="refresh-circle-outline" size={24} color={DANGER} />
            <Text style={styles.dangerTitle}>Restablecer datos</Text>
          </View>
          <Text style={styles.dangerDescription}>
            Elimina todo tu historial de chats, ubicaciones y configuraciones. Tu cuenta permanecerá activa.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleResetData}>
            <Text style={styles.dangerBtnText}>Restablecer datos</Text>
          </TouchableOpacity>
        </View>

        {/* Eliminar cuenta */}
        <View style={[styles.dangerSection, styles.dangerSectionCritical]}>
          <View style={styles.dangerHeader}>
            <Ionicons name="trash-outline" size={24} color={DANGER} />
            <Text style={styles.dangerTitle}>Eliminar cuenta</Text>
          </View>
          <Text style={styles.dangerDescription}>
            Esta acción eliminará permanentemente tu cuenta, todos tus datos, contactos de emergencia, historial y suscripciones. No podrás recuperar tu cuenta después.
          </Text>

          <View style={styles.confirmBox}>
            <Text style={styles.confirmLabel}>
              Para confirmar, escribe <Text style={styles.confirmKeyword}>ELIMINAR</Text> en el campo:
            </Text>
            <TextInput
              style={styles.confirmInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Escribe ELIMINAR"
              placeholderTextColor={TEXT_SECONDARY}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.dangerBtn, styles.dangerBtnCritical, confirmText !== 'ELIMINAR' && styles.dangerBtnDisabled]}
            onPress={handleDeleteAccount}
            disabled={confirmText !== 'ELIMINAR'}
          >
            <Ionicons name="warning" size={20} color={confirmText === 'ELIMINAR' ? '#fff' : TEXT_SECONDARY} />
            <Text style={[styles.dangerBtnText, confirmText !== 'ELIMINAR' && styles.dangerBtnTextDisabled]}>
              Eliminar mi cuenta permanentemente
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info adicional */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={TEXT_SECONDARY} />
          <Text style={styles.infoText}>
            Si tienes problemas con tu cuenta, contacta a soporte antes de eliminarla. Podemos ayudarte a resolver cualquier inconveniente.
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
  warningBanner: { backgroundColor: 'rgba(255,107,107,0.1)', borderWidth: 2, borderColor: 'rgba(255,107,107,0.3)', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24 },
  warningTitle: { color: DANGER, fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  warningText: { color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
  dangerSection: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 },
  dangerSectionCritical: { borderWidth: 2, borderColor: 'rgba(255,107,107,0.4)', backgroundColor: 'rgba(255,107,107,0.05)' },
  dangerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dangerTitle: { color: DANGER, fontSize: 18, fontWeight: '600' },
  dangerDescription: { color: TEXT_SECONDARY, lineHeight: 20, marginBottom: 16 },
  confirmBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', borderRadius: 10, padding: 12, marginBottom: 16 },
  confirmLabel: { color: TEXT_SECONDARY, marginBottom: 8, fontSize: 14 },
  confirmKeyword: { color: DANGER, fontWeight: '700' },
  confirmInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: TEXT, fontSize: 16, fontWeight: '600' },
  dangerBtn: { backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.4)', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dangerBtnCritical: { backgroundColor: DANGER, borderColor: DANGER },
  dangerBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', opacity: 0.5 },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  dangerBtnTextDisabled: { color: TEXT_SECONDARY },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginTop: 8 },
  infoText: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 18, flex: 1 },
});
