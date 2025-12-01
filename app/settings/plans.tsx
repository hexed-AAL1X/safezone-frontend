import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

type Plan = 'free' | 'premium';

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    if (plan === 'premium') {
      setSelectedPlan('premium');
      setShowPaymentForm(true);
    } else {
      Alert.alert(
        'Cambiar a Plan Gratuito',
        'Perderás acceso a las funciones Premium. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: 'destructive',
            onPress: () => {
              setSelectedPlan('free');
              setShowPaymentForm(false);
              Alert.alert('Plan actualizado', 'Ahora estás en el plan gratuito.');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Elige el plan que mejor se adapte a tus necesidades</Text>

        {/* Plan Gratuito */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'free' && styles.planCardSelected]}
          onPress={() => handleSelectPlan('free')}
        >
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Plan Gratuito</Text>
              <Text style={styles.planPrice}>$0<Text style={styles.planPeriod}>/mes</Text></Text>
            </View>
            {selectedPlan === 'free' && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>ACTUAL</Text>
              </View>
            )}
          </View>

          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Botón SOS básico</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Hasta 3 contactos de emergencia</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Compartir ubicación en tiempo real</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Historial de 7 días</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Acceso a comunidad</Text>
            </View>
          </View>

          {selectedPlan !== 'free' && (
            <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectPlan('free')}>
              <Text style={styles.selectBtnText}>Cambiar a Gratuito</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Plan Premium */}
        <TouchableOpacity
          style={[styles.planCard, styles.planCardPremium, selectedPlan === 'premium' && styles.planCardSelected]}
          onPress={() => handleSelectPlan('premium')}
        >
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color="#001311" />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>

          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Plan Premium</Text>
              <Text style={styles.planPrice}>$9.99<Text style={styles.planPeriod}>/mes</Text></Text>
            </View>
            {selectedPlan === 'premium' && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>ACTUAL</Text>
              </View>
            )}
          </View>

          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Todo lo del plan Gratuito</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Contactos ilimitados</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Grabación de audio automática</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Historial ilimitado (30 días)</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Alertas automáticas a policía</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Zonas seguras personalizadas</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={CTA} />
              <Text style={styles.featureText}>Soporte prioritario 24/7</Text>
            </View>
          </View>

          {selectedPlan !== 'premium' && (
            <TouchableOpacity
              style={[styles.selectBtn, styles.selectBtnPremium]}
              onPress={() => handleSelectPlan('premium')}
            >
              <Text style={[styles.selectBtnText, { color: '#001311' }]}>Probar Premium 14 días gratis</Text>
            </TouchableOpacity>
          )}

          {selectedPlan === 'premium' && showPaymentForm && (
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>Prueba gratis por 14 días</Text>
              <Text style={styles.paymentSubtitle}>
                No se te cobrará nada hoy. Después de los 14 días, el plan cuesta $9.99/mes. Puedes
                cancelar en cualquier momento.
              </Text>

              <Text style={styles.paymentLabel}>Número de tarjeta</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="number-pad"
              />

              <View style={styles.paymentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentLabel}>Vencimiento</Text>
                  <TextInput
                    style={styles.paymentInput}
                    placeholder="MM/AA"
                    placeholderTextColor={TEXT_SECONDARY}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentLabel}>CVV</Text>
                  <TextInput
                    style={styles.paymentInput}
                    placeholder="123"
                    placeholderTextColor={TEXT_SECONDARY}
                    keyboardType="number-pad"
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.paymentCta}
                onPress={() => {
                  Alert.alert(
                    'Prueba activada',
                    'Tu prueba gratis de 14 días de SafeZone Premium ha sido activada.',
                  );
                  setShowPaymentForm(false);
                }}
              >
                <Text style={styles.paymentCtaText}>INICIAR PRUEBA GRATIS DE 14 DÍAS</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
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
  subtitle: { color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 24 },
  planCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 },
  planCardPremium: { borderColor: 'rgba(0,255,209,0.3)' },
  planCardSelected: { borderColor: ACCENT, backgroundColor: 'rgba(0,255,209,0.08)' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 12 },
  premiumBadgeText: { color: '#001311', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  planName: { color: TEXT, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  planPrice: { color: TEXT, fontSize: 32, fontWeight: '700' },
  planPeriod: { fontSize: 16, color: TEXT_SECONDARY },
  currentBadge: { backgroundColor: 'rgba(0,255,209,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  currentBadgeText: { color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  featuresList: { gap: 12, marginBottom: 20 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: TEXT, fontSize: 15, flex: 1 },
  selectBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  selectBtnPremium: { backgroundColor: CTA, borderColor: CTA },
  selectBtnText: { color: TEXT, fontSize: 15, fontWeight: '600' },
  paymentBox: { marginTop: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(0,255,209,0.25)', gap: 10 },
  paymentTitle: { color: TEXT, fontSize: 16, fontWeight: '700' },
  paymentSubtitle: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },
  paymentLabel: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 10, marginBottom: 4 },
  paymentInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', fontSize: 14 },
  paymentRow: { flexDirection: 'row', marginTop: 4 },
  paymentCta: { marginTop: 14, backgroundColor: CTA, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  paymentCtaText: { color: '#001311', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
});
