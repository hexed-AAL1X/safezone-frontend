import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, StatusBar, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Campos faltantes', 'Completa todos los campos.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas no coinciden', 'Verifica tu contraseña.');
      return;
    }
    if (!accept) {
      Alert.alert('Términos', 'Debes aceptar los términos y condiciones.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 900));
      router.replace('/plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(24, insets.top + 8) }]}> 
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 12) }]} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <Ionicons name="finger-print-outline" size={40} color={ACCENT} />
            <Text style={[styles.brandText, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>SAFEZONE</Text>
          </View>

          <Text style={[styles.title, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Crea tu cuenta</Text>
          <Text style={[styles.subtitle, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Únete a la comunidad de seguridad</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={TEXT_SECONDARY}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={TEXT_SECONDARY}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <View style={styles.termsRow}>
              <Switch value={accept} onValueChange={setAccept} trackColor={{ true: 'rgba(0,224,184,0.5)', false: '#333' }} thumbColor={accept ? CTA : '#777'} />
              <Text style={[styles.termsText, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Aceptar términos y condiciones</Text>
            </View>

            <TouchableOpacity style={styles.cta} onPress={onRegister} disabled={loading}>
              <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{loading ? 'Creando...' : 'CREAR CUENTA'}</Text>
            </TouchableOpacity>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 8 },
  brandText: { color: TEXT, fontSize: 18, letterSpacing: 1.2 },
  title: { color: TEXT, fontSize: 24, textAlign: 'center', marginTop: 8 },
  subtitle: { color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 8 },
  form: { gap: 12, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  termsText: { color: TEXT_SECONDARY },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#001311', fontSize: 16 },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  bottomText: { color: TEXT_SECONDARY },
  link: { color: ACCENT },
});
