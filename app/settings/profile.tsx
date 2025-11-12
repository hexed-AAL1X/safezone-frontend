import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('Usuario Demo');
  const [email, setEmail] = useState('usuario@safezone.com');
  const [phone, setPhone] = useState('+51 999 888 777');
  const [address, setAddress] = useState('Lima, Perú');

  const handleSave = () => {
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={ACCENT} />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Ionicons name="camera" size={16} color="#001311" />
            <Text style={styles.changePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={TEXT_SECONDARY}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={TEXT_SECONDARY}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+51 999 999 999"
              placeholderTextColor={TEXT_SECONDARY}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Ciudad, País"
              placeholderTextColor={TEXT_SECONDARY}
            />
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>GUARDAR CAMBIOS</Text>
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
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 100, backgroundColor: 'rgba(0,255,209,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: ACCENT, marginBottom: 16 },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CTA, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  changePhotoText: { color: '#001311', fontWeight: '600' },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { color: TEXT, fontSize: 14, fontWeight: '500' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, fontSize: 15 },
  saveBtn: { backgroundColor: CTA, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#001311', fontSize: 16, fontWeight: '600' },
});
