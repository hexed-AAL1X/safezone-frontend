import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  const handleContactSupport = () => {
    const email = 'soporte@safezone.app';
    const subject = encodeURIComponent('Ayuda con SafeZone');
    const body = encodeURIComponent('Hola equipo de SafeZone,\n\nNecesito ayuda con...');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.canOpenURL(url)
      .then((canOpen) => {
        if (!canOpen) {
          Alert.alert('No se pudo abrir el correo', 'Configura una app de correo en tu dispositivo.');
          return;
        }
        return Linking.openURL(url);
      })
      .catch((err) => {
        console.error('Error abriendo correo:', err);
        Alert.alert('Error', 'No se pudo abrir la app de correo.');
      });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}> 
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y soporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Ionicons name="help-circle" size={32} color={ACCENT} />
          <Text style={styles.title}>¿Necesitas ayuda?</Text>
          <Text style={styles.text}>
            Si tienes problemas con SafeZone, dudas sobre cómo funciona el botón SOS o quieres reportar un
            problema, puedes escribirnos directamente a nuestro correo de soporte.
          </Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={handleContactSupport}>
          <Ionicons name="mail" size={20} color="#001311" />
          <Text style={styles.ctaText}>ESCRIBIR AL SOPORTE</Text>
        </TouchableOpacity>

        {/* Sección educativa sobre acoso e intervención responsable */}
        <View style={styles.eduCard}>
          <View style={styles.eduHeader}>
            <Ionicons name="alert-circle" size={22} color={ACCENT} />
            <Text style={styles.eduTitle}>El acoso nunca es aceptable</Text>
          </View>
          <Text style={styles.eduText}>
            El acoso puede ser físico, verbal o digital (miradas insistentes, tocamientos no deseados,
            comentarios sexuales, seguir a alguien, grabar sin permiso, etc.). Aunque pase en una discoteca
            o fiesta, sigue siendo violencia y no es "parte del ambiente".
          </Text>
        </View>

        <View style={styles.eduCard}>
          <View style={styles.eduHeader}>
            <Ionicons name="shield-checkmark" size={22} color="#4ade80" />
            <Text style={styles.eduTitle}>Si ves o sufres una situación de acoso</Text>
          </View>
          <Text style={styles.eduText}>
            • Prioriza siempre tu seguridad y la de la persona afectada.
          </Text>
          <Text style={styles.eduText}>
            • Si eres testigo, puedes apoyar acercándote con calma, preguntando si la persona está bien o
            avisando al personal del local.
          </Text>
          <Text style={styles.eduText}>
            • Si te sientes en peligro, usa el botón SOS de SafeZone, avisa a tus contactos de confianza o
            llama al 105 para emergencias.
          </Text>
          <Text style={styles.eduText}>
            • Nunca culpes a la víctima ni minimices lo ocurrido. Escucha, cree y acompaña.
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
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { color: TEXT, fontSize: 16, fontWeight: '600' },
  text: { color: TEXT_SECONDARY, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: CTA, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  ctaText: { color: '#001311', fontWeight: '600', fontSize: 14 },
  eduCard: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 16, gap: 8 },
  eduHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eduTitle: { color: TEXT, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  eduText: { color: TEXT_SECONDARY, fontSize: 12, lineHeight: 18 },
});
