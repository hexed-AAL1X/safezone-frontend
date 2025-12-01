import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUserProfile, updateMyProfile } from '@/lib/api';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCurrentUserProfile();
        if (!mounted) return;
        const u = res.user;
        setName(u.name || '');
        setEmail(u.email || '');
        const rawPhone = (u.phone || '').replace(/\s+/g, '');
        if (rawPhone.startsWith('+51') && rawPhone.length > 3) {
          setPhoneDigits(rawPhone.slice(3));
        } else {
          setPhoneDigits(rawPhone);
        }
        setAddress(u.address || '');
        setAvatarUrl(u.avatarUrl || '');
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  useFocusEffect(
    useCallback(() => {
      setReloadTick((t) => t + 1);
    }, []),
  );

  const handleSave = async () => {
    try {
      const normalizedDigits = phoneDigits.replace(/\D/g, '');
      const phoneToSend = normalizedDigits ? `+51${normalizedDigits}` : undefined;
      await updateMyProfile({
        name,
        email,
        phone: phoneToSend,
        address,
        avatarUrl: avatarUrl ? avatarUrl : null,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error', error?.message || 'No se pudo actualizar el perfil.');
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'No se pudo leer la imagen seleccionada.');
        return;
      }

      const mime = asset.mimeType || 'image/jpeg';
      const dataUri = `data:${mime};base64,${asset.base64}`;
      setAvatarUrl(dataUri);
    } catch (error) {
      console.error('Error seleccionando foto de perfil:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto de perfil.');
    }
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 94, height: 94, borderRadius: 94 }}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color={ACCENT} />
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickAvatar}>
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
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phoneFlag}>🇵🇪</Text>
                <Text style={styles.phonePrefixText}>+51</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phoneDigits}
                onChangeText={(text) =>
                  setPhoneDigits(text.replace(/\D/g, '').slice(0, 9))
                }
                placeholder="999 999 999"
                placeholderTextColor={TEXT_SECONDARY}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => router.push('/settings/address-map' as any)}
              activeOpacity={0.8}
            >
              <Text style={{ color: address ? TEXT : TEXT_SECONDARY }} numberOfLines={1} ellipsizeMode="tail">
                {address || 'Selecciona un punto en el mapa'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>GUARDAR CAMBIOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => router.push('/settings/change-password' as any)}
        >
          <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
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
  sectionTitle: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  inputGroup: { gap: 8 },
  label: { color: TEXT, fontSize: 14, fontWeight: '500' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, fontSize: 15 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phonePrefix: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  phoneFlag: { fontSize: 16, marginRight: 6 },
  phonePrefixText: { color: TEXT, fontSize: 14, fontWeight: '600' },
  phoneInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, color: TEXT, fontSize: 15 },
  saveBtn: { backgroundColor: CTA, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#001311', fontSize: 16, fontWeight: '600' },
  changePasswordBtn: { backgroundColor: CTA, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  changePasswordText: { color: '#001311', fontSize: 16, fontWeight: '600' },
});
