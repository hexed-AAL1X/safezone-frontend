import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';

export default function GuiaAcosoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingBottom: Math.max(16, insets.bottom + 8) },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guía contra el acoso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. ¿Qué es el acoso? */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={24} color={ACCENT} />
            <Text style={styles.cardTitle}>1. ¿Qué es el acoso?</Text>
          </View>

          <Text style={styles.cardText}>
            El acoso es cualquier conducta no deseada que hace que una persona se
            sienta intimidada, humillada o en peligro. Puede ser físico, verbal o
            digital: miradas invasivas, comentarios sexuales, tocamientos sin
            permiso, seguir a alguien, grabar o tomar fotos sin consentimiento,
            insistir cuando la otra persona ya dijo que no.
          </Text>

          <Text style={styles.cardText}>
            Estar en una discoteca, fiesta o espacio con música y alcohol no
            justifica el acoso. Que algo sea frecuente no lo hace normal ni
            aceptable.
          </Text>
        </View>

        {/* 2. ¿Cómo intervenir de forma segura? */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
            <Text style={styles.cardTitle}>2. ¿Cómo intervenir de forma segura?</Text>
          </View>

          <Text style={styles.cardText}>
            Si ves una situación de acoso, tu intervención puede marcar la
            diferencia. Hazlo siempre cuidando tu integridad y la de la persona
            afectada.
          </Text>

          <Text style={styles.cardText}>
            • Acércate con calma y pregúntale directamente a la persona si está
            bien o si necesita ayuda.
          </Text>
          <Text style={styles.cardText}>
            • Si no te sientes seguro interviniendo, pide apoyo al personal del
            local o a alguien de confianza.
          </Text>
          <Text style={styles.cardText}>
            • Evita exponerte a situaciones violentas. No te arriesgues solo:
            busca apoyo de otras personas cercanas antes de actuar.
          </Text>
          <Text style={styles.cardText}>
            • Valida lo que la persona te cuente: no minimices lo ocurrido ni
            pongas la culpa en la víctima.
          </Text>
        </View>

        {/* 3. Si eres víctima o acompañante */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart-circle" size={24} color="#fb7185" />
            <Text style={styles.cardTitle}>3. Si eres víctima o acompañante</Text>
          </View>

          <Text style={styles.cardText}>
            • Aléjate del agresor y busca un lugar seguro dentro del local o
            cerca de personal de apoyo.
          </Text>
          <Text style={styles.cardText}>
            • Habla con alguien de confianza sobre lo que pasó. Lo que sentiste
            es importante y merece ser escuchado.
          </Text>
          <Text style={styles.cardText}>
            • Si lo necesitas, registra detalles (lugar, hora, descripción) para
            poder denunciar más adelante.
          </Text>
          <Text style={styles.cardText}>
            • Usa SafeZone para avisar rápido a tus contactos de emergencia y
            compartir tu ubicación cuando sientas que algo no está bien.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: TEXT, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  cardText: { color: TEXT_SECONDARY, fontSize: 13, lineHeight: 20 },
});

