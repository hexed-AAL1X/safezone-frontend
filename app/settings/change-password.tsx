import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { changeMyPassword, verifyMyPassword } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Ingresa tu contraseña actual.');
      return;
    }
    try {
      setLoading(true);
      await verifyMyPassword({ currentPassword });
      setStep(2);
      Alert.alert('Listo', 'Contraseña actual verificada. Ahora elige una nueva.');
    } catch (error: any) {
      console.error('Error verificando contraseña:', error);
      Alert.alert('Error', error?.message || 'No se pudo verificar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Completa la nueva contraseña y su confirmación.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    try {
      setLoading(true);
      const res = await changeMyPassword({ currentPassword, newPassword });
      const message = res.message || 'Contraseña actualizada correctamente.';

      // Al cambiar la contraseña, cerramos la sesión actual
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);

      Alert.alert('Contraseña actualizada', message, [
        {
          text: 'Ir a iniciar sesión',
          onPress: () => router.replace('/login' as any),
        },
      ]);
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      Alert.alert('Error', error?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom + 16) }] }>
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={22} color={ACCENT} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Por tu seguridad</Text>
            <Text style={styles.infoText}>
              Primero verificaremos tu contraseña actual. Luego podrás elegir una nueva contraseña para tu cuenta.
            </Text>
          </View>
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.stepLabel}>Paso 1 de 2</Text>
            <Text style={styles.label}>Contraseña actual</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Tu contraseña actual"
              placeholderTextColor={TEXT_SECONDARY}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'VERIFICANDO...' : 'VALIDAR CONTRASEÑA'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.stepLabel}>Paso 2 de 2</Text>
            <Text style={styles.verifiedText}>Contraseña actual verificada</Text>

            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva contraseña"
              placeholderTextColor={TEXT_SECONDARY}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar nueva contraseña</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la nueva contraseña"
              placeholderTextColor={TEXT_SECONDARY}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'GUARDANDO...' : 'ACTUALIZAR CONTRASEÑA'}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  infoTitle: { color: TEXT, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoText: { color: TEXT_SECONDARY, fontSize: 13 },
  form: { gap: 12 },
  stepLabel: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  verifiedText: { color: '#4ade80', fontSize: 13, marginBottom: 8 },
  label: { color: TEXT, fontSize: 14, fontWeight: '500', marginTop: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: TEXT, fontSize: 15 },
  primaryBtn: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#001311', fontSize: 15, fontWeight: '600' },
});
