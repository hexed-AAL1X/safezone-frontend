import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, StatusBar, Switch, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';
import { registerUser } from '@/lib/api';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+51 ');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accept, setAccept] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'guardian'>('user');
  const [guardianAccept, setGuardianAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const value = password || '';
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
  }, [password]);

  const handleSocialRegister = (provider: 'google' | 'facebook') => {
    Alert.alert(
      'Registro con redes sociales',
      `El registro con ${provider === 'google' ? 'Google' : 'Facebook'} estará disponible próximamente. Por ahora usa tu correo y contraseña.`,
    );
  };

  const onRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password || !confirm) {
      Alert.alert('Campos faltantes', 'Completa todos los campos.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas no coinciden', 'Verifica tu contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const normalizedPhone = phone.replace(/\s+/g, '');
    if (!/^\+51\d{9}$/.test(normalizedPhone)) {
      Alert.alert('Teléfono inválido', 'El número debe comenzar con +51 y tener 9 dígitos (ej. +51 987654321).');
      return;
    }

    if (!accept) {
      Alert.alert(
        'Términos y condiciones',
        'Debes leer y aceptar los Términos y Condiciones para crear tu cuenta.',
      );
      return;
    }

    if (accountType === 'guardian') {
      if (!guardianAccept) {
        Alert.alert(
          'Programa Guardián',
          'Debes aceptar las condiciones del programa Guardián SafeZone.',
        );
        return;
      }
    }
    setLoading(true);
    try {
      await registerUser({
        firstName,
        lastName,
        email,
        phone: normalizedPhone,
        password,
        role: accountType === 'guardian' ? 'GUARDIAN' : 'USER',
        guardianAcceptedTerms: accountType === 'guardian' ? guardianAccept : undefined,
      });
      router.replace('/plan');
    } catch (error: any) {
      console.error('Error al registrar:', error);
      Alert.alert('Error', error?.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 12) }]} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <Image
              source={require('../assets/images/icon_launcher.png')}
              style={styles.brandLogo}
              contentFit="contain"
            />
            <Text style={[styles.brandText, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>SAFEZONE</Text>
          </View>

          <Text style={[styles.title, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Crea tu cuenta</Text>
          <Text style={[styles.subtitle, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Únete a la comunidad de seguridad</Text>

          <View style={styles.form}>
            <View style={styles.accountTypeRow}>
              <TouchableOpacity
                style={[styles.accountTypeBtn, accountType === 'user' && styles.accountTypeBtnActive]}
                onPress={() => setAccountType('user')}
              >
                <Text style={[styles.accountTypeText, accountType === 'user' && styles.accountTypeTextActive]}>Usuario</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.accountTypeBtn, accountType === 'guardian' && styles.accountTypeBtnActive]}
                onPress={() => setAccountType('guardian')}
              >
                <Text style={[styles.accountTypeText, accountType === 'guardian' && styles.accountTypeTextActive]}>Guardián SafeZone</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Nombre"
                placeholderTextColor={TEXT_SECONDARY}
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Apellidos"
                placeholderTextColor={TEXT_SECONDARY}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.phoneRow}>
              <View style={styles.phoneFlagBox}>
                <Text style={styles.phoneFlagText}>🇵🇪</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="Número de teléfono (+51...)"
                placeholderTextColor={TEXT_SECONDARY}
                value={phone}
                onChangeText={(value) => {
                  // Forzar prefijo +51 y limitar a 9 dígitos
                  const digits = value.replace(/[^0-9]/g, '');
                  const withoutPrefix = digits.startsWith('51') ? digits.slice(2) : digits;
                  const limited = withoutPrefix.slice(0, 9);
                  const display = limited ? `+51 ${limited}` : '+51 ';
                  setPhone(display);
                }}
                keyboardType="phone-pad"
              />
            </View>
            {password && (
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
            )}
            <View style={styles.passwordInputRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                placeholderTextColor={TEXT_SECONDARY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirmar contraseña"
                placeholderTextColor={TEXT_SECONDARY}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(prev => !prev)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={18}
                  color={TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>

            {accountType === 'guardian' && (
              <>
                <Text style={[styles.termsText, { marginTop: 4 }]}>Para completar tu perfil como Guardián SafeZone debes rellenar el formulario externo.</Text>
                <TouchableOpacity
                  style={styles.guardianLinkBtn}
                  onPress={() => Linking.openURL('https://safezone.app/guardian-form')}
                >
                  <Text style={styles.guardianLinkText}>ABRIR FORMULARIO GUARDIÁN</Text>
                </TouchableOpacity>
                <View style={styles.termsRow}>
                  <Switch
                    value={guardianAccept}
                    onValueChange={setGuardianAccept}
                    trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }}
                    thumbColor={guardianAccept ? CTA : '#777'}
                  />
                  <Text style={[styles.termsText, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Acepto las condiciones del programa Guardián SafeZone</Text>
                </View>
              </>
            )}

            <View style={styles.termsRow}>
              <Ionicons
                name={accept ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={accept ? CTA : TEXT_SECONDARY}
              />
              <Text style={[styles.termsText, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>
                {accept
                  ? 'Has aceptado los Términos y Condiciones de SafeZone.'
                  : 'Debes aceptar los Términos y Condiciones para continuar.'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.termsLinkBtn}
              onPress={() => {
                setAccept(true);
                router.push('/terms' as any);
              }}
            >
              <Text style={[styles.termsLinkText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>VER TÉRMINOS Y CONDICIONES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cta} onPress={onRegister} disabled={loading}>
              <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{loading ? 'Creando...' : 'CREAR CUENTA'}</Text>
            </TouchableOpacity>

            {accountType === 'user' && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>O registrarte con</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={[styles.socialBtn, styles.googleBtn]}
                    onPress={() => handleSocialRegister('google')}
                  >
                    <Ionicons name="logo-google" size={20} color="#fff" />
                    <Text style={styles.socialBtnText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialBtn, styles.facebookBtn]}
                    onPress={() => handleSocialRegister('facebook')}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#fff" />
                    <Text style={styles.socialBtnText}>Facebook</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>¿Ya tienes cuenta? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Inicia sesión</Text>
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
  brandRow: { alignItems: 'center', alignSelf: 'center', marginTop: 8, gap: 6 },
  brandLogo: { width: 96, height: 96, marginBottom: 4 },
  brandText: { color: TEXT, fontSize: 18, letterSpacing: 1.2 },
  title: { color: TEXT, fontSize: 24, textAlign: 'center', marginTop: 8 },
  subtitle: { color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 8 },
  form: { gap: 12, marginTop: 12 },
  nameRow: { flexDirection: 'row', gap: 8 },
  nameInput: { flex: 1 },
  accountTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  accountTypeBtn: { flex: 1, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, alignItems: 'center' },
  accountTypeBtnActive: { backgroundColor: CTA, borderColor: CTA },
  accountTypeText: { color: TEXT_SECONDARY, fontSize: 13 },
  accountTypeTextActive: { color: '#001311', fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  passwordStrength: { marginTop: 4, fontSize: 12 },
  passwordStrengthRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  passwordStrengthBar: { width: 16, height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  passwordInputRow: { position: 'relative', justifyContent: 'center', marginTop: 4 },
  passwordInput: { paddingRight: 40 },
  eyeButton: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneFlagBox: { width: 56, height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  phoneFlagText: { fontSize: 24 },
  phoneInput: { flex: 1 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  termsText: { color: TEXT_SECONDARY },
  guardianLinkBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: CTA, alignItems: 'center' },
  guardianLinkText: { color: CTA, fontWeight: '600', fontSize: 13 },
  termsLinkBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center' },
  termsLinkText: { color: TEXT, fontSize: 12, letterSpacing: 0.5 },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#001311', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: TEXT_SECONDARY, paddingHorizontal: 16, fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  googleBtn: { backgroundColor: '#DB4437', borderColor: '#DB4437' },
  facebookBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  socialBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  bottomText: { color: TEXT_SECONDARY },
  link: { color: ACCENT },
});
