import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts as useOrbitron, Orbitron_500Medium } from '@expo-google-fonts/orbitron';
import { useFonts as useMontserrat, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { useFonts as useInter, Inter_400Regular } from '@expo-google-fonts/inter';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';
const GOLD = '#ffcc33';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const [orbitronLoaded] = useOrbitron({ Orbitron_500Medium });
  const [montLoaded] = useMontserrat({ Montserrat_600SemiBold });
  const [interLoaded] = useInter({ Inter_400Regular });
  const [plan, setPlan] = useState<'free' | 'premium'>('premium');

  const onContinue = () => {
    // Aquí podrías disparar flujo de pago o activar trial
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(24, insets.top + 8) }]}> 
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 12) }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <Ionicons name="finger-print-outline" size={40} color={ACCENT} />
          <Text style={[styles.brandText, { fontFamily: orbitronLoaded ? 'Orbitron_500Medium' : undefined }]}>SAFEZONE</Text>
        </View>

        <Text style={[styles.title, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>Elige tu plan de seguridad</Text>
        <Text style={[styles.subtitle, { fontFamily: interLoaded ? 'Inter_400Regular' : undefined }]}>Tu tranquilidad, tu decisión</Text>

        <View style={styles.cards}>
          <TouchableOpacity style={[styles.card, plan === 'free' && styles.cardActive]} onPress={() => setPlan('free')}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-outline" size={22} color={ACCENT} />
              <Text style={[styles.cardTitle, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>PLAN GRATUITO</Text>
            </View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Botón SOS 1, 2 y 3</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Aviso a 1 contacto</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Geolocalización</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Historial 7 días</Text></View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardPremium, plan === 'premium' && styles.cardActive]} onPress={() => setPlan('premium')}>
            <View style={styles.cardHeader}>
              <Ionicons name="star" size={20} color={GOLD} />
              <Text style={[styles.cardTitle, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>PLAN PREMIUM</Text>
            </View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Hasta 5 contactos HD</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Grado "Falso Cierre"</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Acompañamiento satelital</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Historial 30 días</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Mapas con riesgo</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Comunidad avanzada</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>Perfiles verificados</Text></View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onContinue}>
          <Text style={[styles.ctaText, { fontFamily: montLoaded ? 'Montserrat_600SemiBold' : undefined }]}>
            {plan === 'premium' ? 'PROBAR PREMIUM GRATIS' : 'CONTINUAR CON GRATUITO'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 8 },
  brandText: { color: TEXT, fontSize: 18, letterSpacing: 1.2 },
  title: { color: TEXT, fontSize: 22, textAlign: 'center', marginTop: 8 },
  subtitle: { color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 12 },
  cards: { gap: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardPremium: { borderColor: 'rgba(0,255,209,0.3)' },
  cardActive: { borderColor: ACCENT },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { color: TEXT, fontSize: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  bullet: { color: ACCENT, fontSize: 18, lineHeight: 18 },
  bulletText: { color: TEXT_SECONDARY, flex: 1 },
  cta: { backgroundColor: CTA, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  ctaText: { color: '#001311', fontSize: 16 },
});
