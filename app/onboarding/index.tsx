import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff'; // cian neón
const CTA = '#00ffff'; // verde-agua intenso

const slides = [
  {
    key: 's1',
    header: 'BIENVENIDO A SAFEZONE',
    subtitle: 'Tu seguridad personal, siempre contigo',
    icon: 'shield-checkmark-outline' as const,
    bulletTitle: '1. SOS inteligente & contactos de emergencia',
    bulletBody: 'Activa el SOS para compartir tu ubicación, grabar audio y avisar a tus contactos de confianza en segundos.',
  },
  {
    key: 's2',
    header: 'SAFEZONE',
    subtitle: 'Muévete con rutas y mapa seguros',
    icon: 'help-buoy-outline' as const,
    bulletTitle: '2. Mapa de contactos & rutas seguras',
    bulletBody: 'Ve tu posición, la de tus contactos y la mejor ruta para llegar a lugares clave en el mapa.',
  },
  {
    key: 's3',
    header: 'SAFEZONE',
    subtitle: 'Construye una comunidad más segura',
    icon: 'map-outline' as const,
    bulletTitle: '3. Comunidad & reviews de lugares',
    bulletBody: 'Descubre discotecas y puntos de encuentro con reviews de seguridad de la comunidad SafeZone.',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = index === slides.length - 1;

  const onNext = () => {
    if (!isLast) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      AsyncStorage.setItem('sz_onboarding_completed', '1').catch(() => {});
      router.replace('/login');
    }
  };

  const onSkip = () => {
    AsyncStorage.setItem('sz_onboarding_completed', '1').catch(() => {});
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG, paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={[styles.skip, { top: insets.top + 12 }]} onPress={onSkip}>
        <Text style={[styles.skipText, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>SALTAR</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={ref}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(nextIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, paddingVertical: 32 }]}> 
            <View style={styles.top}>
              <Image source={require('../../assets/images/logo1.png')} style={styles.brand} contentFit="contain" />
              <Text style={[styles.header, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>{item.header}</Text>
              <Text style={[styles.subtitle, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>{item.subtitle}</Text>
            </View>

            <View style={styles.heroWrap}>
              <View style={styles.heroCircle}> 
                <Ionicons name={item.icon} size={164} color={ACCENT} />
              </View>
            </View>

            <View style={styles.body}>
              <Text style={[styles.bulletTitle, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>{item.bulletTitle}</Text>
              <Text style={[styles.bulletBody, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>{item.bulletBody}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(40, insets.bottom + 24) }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 18, 8],
              extrapolate: 'clamp',
            });

            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#1f2a2a', ACCENT, '#1f2a2a'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor: dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.cta} onPress={onNext}>
          <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>
            {isLast ? 'COMENZAR' : 'CONTINUAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'space-between' },
  top: { marginTop: 24, alignItems: 'center', gap: 6 },
  brand: { width: 160, height: 80, marginBottom: 12 },
  header: { fontSize: 22, color: TEXT, letterSpacing: 1.2 },
  subtitle: { fontSize: 14, color: TEXT_SECONDARY },
  heroWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  heroCircle: { width: 220, height: 220, borderRadius: 999, borderWidth: 2, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,255,209,0.07)' },
  body: { width: '100%', marginTop: 12 },
  bulletTitle: { fontSize: 16, color: TEXT },
  bulletBody: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 6, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#1f2a2a' },
  dotActive: { width: 18, height: 8, borderRadius: 8, backgroundColor: ACCENT },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#001311', fontSize: 16 },
  skip: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  skipText: { color: TEXT_SECONDARY, fontSize: 13 },
});
