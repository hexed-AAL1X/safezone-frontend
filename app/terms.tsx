import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  const handleAccept = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(24, insets.top + 8) }]}> 
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Condiciones</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>1. Información general</Text>
        <Text style={styles.paragraph}>
          SafeZone es una aplicación de seguridad personal pensada para ayudarte a sentirte más seguro en tus
          desplazamientos y momentos de ocio. Al crear una cuenta y usar la app aceptas estos Términos y Condiciones.
        </Text>

        <Text style={styles.sectionTitle}>2. Edad mínima y responsabilidad</Text>
        <Text style={styles.paragraph}>
          La app está dirigida a personas mayores de 18 años. Eres responsable de mantener la confidencialidad de tus
          credenciales de acceso y de toda actividad que ocurra con tu cuenta.
        </Text>

        <Text style={styles.sectionTitle}>3. Uso de datos de ubicación</Text>
        <Text style={styles.paragraph}>
          SafeZone utiliza la ubicación de tu dispositivo para mostrar tu posición en el mapa, compartirla con tus
          contactos de emergencia y calcular rutas hacia lugares o contactos. Puedes activar o desactivar el
          compartido de ubicación desde los ajustes de la app y de tu sistema operativo.
        </Text>

        <Text style={styles.sectionTitle}>4. Contactos de emergencia y notificaciones</Text>
        <Text style={styles.paragraph}>
          Al añadir contactos de emergencia confirmas que tienes su consentimiento para compartirles tu información en
          caso de alerta. SafeZone enviará notificaciones, mensajes o enlaces con tu ubicación cuando actives el SOS u
          otras funciones de seguridad.
        </Text>

        <Text style={styles.sectionTitle}>5. Grabación de audio y contenido</Text>
        <Text style={styles.paragraph}>
          Algunas funciones pueden iniciar grabación de audio o recopilar información sobre tu actividad dentro de la
          app. No debes usar SafeZone para grabar o compartir contenido que viole derechos de terceros, sea ilegal o
          infrinja la privacidad de otras personas.
        </Text>

        <Text style={styles.sectionTitle}>6. Comunidad y reviews de lugares</Text>
        <Text style={styles.paragraph}>
          Puedes publicar opiniones, valoraciones y comentarios sobre lugares. Eres el único responsable del contenido
          que publicas. No se permite lenguaje de odio, amenazas, acoso ni información falsa o difamatoria.
          SafeZone podrá moderar o eliminar contenido que considere inapropiado.
        </Text>

        <Text style={styles.sectionTitle}>7. SafeZone no reemplaza a las autoridades</Text>
        <Text style={styles.paragraph}>
          SafeZone es una herramienta de apoyo y no sustituye a los servicios de emergencia ni a las autoridades
          locales. En una situación de peligro real, siempre debes contactar directamente con la policía u otros
          servicios oficiales disponibles en tu zona.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitación de responsabilidad</Text>
        <Text style={styles.paragraph}>
          Hacemos esfuerzos razonables para que la app funcione correctamente, pero SafeZone no garantiza que el
          servicio esté libre de errores, fallos de red o interrupciones. En ningún caso seremos responsables por daños
          directos o indirectos derivados del uso o la imposibilidad de uso de la aplicación.
        </Text>

        <Text style={styles.sectionTitle}>9. Seguridad de la cuenta y del dispositivo</Text>
        <Text style={styles.paragraph}>
          Debes mantener tu dispositivo actualizado y protegido. No compartas tu contraseña con otras personas y
          notifícanos si sospechas de un acceso no autorizado a tu cuenta.
        </Text>

        <Text style={styles.sectionTitle}>10. Cambios en los Términos</Text>
        <Text style={styles.paragraph}>
          Podemos actualizar estos Términos y Condiciones para reflejar mejoras del servicio, cambios legales u otras
          necesidades. Cuando se realicen cambios relevantes te lo notificaremos dentro de la app o por correo
          electrónico.
        </Text>

        <Text style={styles.sectionTitle}>11. Contacto</Text>
        <Text style={styles.paragraph}>
          Si tienes dudas sobre estos Términos y Condiciones puedes escribirnos al correo de soporte indicado en la app
          o en nuestra página web oficial.
        </Text>

        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={18} color={ACCENT} />
          <Text style={styles.infoText}>Última actualización: 2025</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 12) }]}> 
        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Text style={styles.acceptText}>ACEPTAR TÉRMINOS Y CONDICIONES</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '600' },
  scroll: { flex: 1 },
  sectionTitle: { color: TEXT, fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  paragraph: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 19 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 16, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: TEXT_SECONDARY, fontSize: 12 },
  footer: { paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  acceptBtn: { backgroundColor: CTA, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  acceptText: { color: '#001311', fontWeight: '600', fontSize: 14 },
});
