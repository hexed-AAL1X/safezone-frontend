import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset, verifyResetCode, resetPasswordWithCode } from '@/lib/api';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function RecoverScreen() {
  const insets = useSafeAreaInsets();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const value = newPassword || '';
    let score = 0;
    if (value.length >= 6) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score++;

    if (!value) {
      return { label: '', color: TEXT_SECONDARY, score: 0, max: 3 };
    }

    if (score <= 1) return { label: 'Débil', color: '#ff4d4f', score: 1, max: 3 };
    if (score === 2) return { label: 'Media', color: '#ffc53d', score: 2, max: 3 };
    return { label: 'Fuerte', color: '#52c41a', score: 3, max: 3 };
  }, [newPassword]);

  const onSendCode = async () => {
    if (!email) {
      Alert.alert('Correo requerido', 'Ingresa tu correo para enviarte un código.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      Alert.alert('Código enviado', res.message || 'Revisa tu correo para obtener el código.');
      setStep('verify');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo enviar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async () => {
    if (!code) {
      Alert.alert('Código requerido', 'Ingresa el código que recibiste por correo.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyResetCode({ email, token: code });
      Alert.alert('Código verificado', res.message || 'Ahora puedes elegir una nueva contraseña.');
      setStep('reset');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Campos faltantes', 'Completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Verifica tu nueva contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordWithCode({ email, token: code, newPassword });
      Alert.alert('Contraseña cambiada', res.message || 'Ya puedes iniciar sesión con tu nueva contraseña.');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 12) }]} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <Ionicons name="finger-print-outline" size={40} color={ACCENT} />
            <Text style={[styles.brandText, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>SAFEZONE</Text>
          </View>

          <Text style={[styles.title, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Recupera tu contraseña</Text>
          <Text style={[styles.subtitle, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>
            {step === 'request'
              ? 'Te enviaremos un código a tu correo'
              : step === 'verify'
              ? 'Ingresa el código que te enviamos'
              : 'Elige tu nueva contraseña'}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {step === 'request' && (
              <TouchableOpacity style={styles.cta} onPress={onSendCode} disabled={loading}>
                <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{loading ? 'Enviando...' : 'ENVIAR CÓDIGO'}</Text>
              </TouchableOpacity>
            )}

            {step === 'verify' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Código de recuperación"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={styles.cta} onPress={onVerifyCode} disabled={loading}>
                  <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{loading ? 'Verificando...' : 'VERIFICAR CÓDIGO'}</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'reset' && (
              <>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(prev => !prev)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                {newPassword ? (
                  <>
                    <View style={styles.passwordStrengthRow}>
                      {[0, 1, 2].map((idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.passwordStrengthBar,
                            idx < passwordStrength.score && { backgroundColor: passwordStrength.color },
                          ]}
                        />
                      ))}
                    </View>
                    {passwordStrength.label ? (
                      <Text
                        style={{
                          color: passwordStrength.color,
                          fontSize: 12,
                          marginTop: 4,
                          marginBottom: 4,
                        }}
                      >
                        Seguridad de la contraseña: {passwordStrength.label}
                      </Text>
                    ) : null}
                  </>
                ) : null}

                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cta} onPress={onChangePassword} disabled={loading}>
                  <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{loading ? 'Guardando...' : 'CAMBIAR CONTRASEÑA'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.bottomLinks}>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Crear nueva cuenta</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.dot}> • </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Volver a Iniciar Sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 20, gap: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 8 },
  brandText: { color: TEXT, fontSize: 18, letterSpacing: 1.2 },
  title: { color: TEXT, fontSize: 22, textAlign: 'center', marginTop: 8 },
  subtitle: { color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 8 },
  form: { gap: 12, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#001311', fontSize: 16 },
  bottomLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  link: { color: ACCENT },
  dot: { color: '#666', marginHorizontal: 6 },
  passwordStrengthRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  passwordStrengthBar: { width: 16, height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  passwordInputRow: { position: 'relative', justifyContent: 'center', marginTop: 4 },
  passwordInput: { paddingRight: 40 },
  eyeButton: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
});
