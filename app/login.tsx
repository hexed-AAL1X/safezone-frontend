import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigateToRecover = useThrottle(() => router.push('/recover' as any), 800);
  const navigateToRegister = useThrottle(() => router.push('/register' as any), 800);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      // Aquí iría la lógica de autenticación
      console.log('Iniciando sesión con:', { email, password });
      
      // Simulando una petición a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navegar al inicio después del inicio de sesión exitoso
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoginThrottled = useThrottle(handleLogin, 1000);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(24, insets.bottom + 12) }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={[styles.brand, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>SAFEZONE</Text>
            <Text style={[styles.title, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Tu Zona Segura</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#d0d0d0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#d0d0d0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />
            </View>

            <TouchableOpacity 
              style={[styles.cta, isLoading && styles.buttonDisabled]}
              onPress={handleLoginThrottled}
              disabled={isLoading}
            >
              <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>
                {isLoading ? 'Iniciando...' : 'INICIAR SESIÓN'}
              </Text>
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity onPress={navigateToRecover}>
                <Text style={styles.linkText}>Olvidé mi contraseña</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}> • </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.linkText}>Crear nueva cuenta</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O continuar con</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]}>
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, styles.facebookBtn]}>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <Text style={styles.socialBtnText}>Facebook</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.socialBtn, styles.appleBtn]}>
              <Ionicons name="logo-apple" size={22} color="#fff" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 96, height: 96, marginBottom: 8 },
  brand: { color: TEXT, fontSize: 18, letterSpacing: 1.2 },
  title: { color: TEXT, fontSize: 22, marginTop: 4 },
  formContainer: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 13, color: TEXT },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  ctaText: { color: '#001311', fontSize: 16 },
  buttonDisabled: { opacity: 0.8 },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  linkText: { color: ACCENT },
  footerDot: { color: '#666' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: TEXT_SECONDARY, paddingHorizontal: 16, fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  googleBtn: { backgroundColor: '#DB4437', borderColor: '#DB4437' },
  facebookBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  appleBtn: { backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.2)' },
  socialBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
