import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';

type Props = {
  title: string;
  subtitle?: string;
};

export default function DashboardHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/icon_launcher.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <View style={styles.textContainer}>
            <Text
              style={styles.headerBrand}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <View style={styles.subtitleRow}>
              <Ionicons name="shield-checkmark" size={12} color={ACCENT} />
              <Text
                style={styles.headerSubtitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subtitle ?? 'Salidas más seguras'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightRow}>
          <TouchableOpacity style={styles.planBadge} activeOpacity={0.7}>
            <Ionicons name="star" size={12} color={ACCENT} />
            <Text style={styles.planText}>Gratis</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/settings' as any)} 
            style={styles.settingsBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-sharp" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.25)',
  },
  headerLogo: { 
    width: 32, 
    height: 32,
  },
  textContainer: { 
    flexShrink: 1, 
    minWidth: 0,
    gap: 4,
  },
  headerBrand: { 
    color: TEXT, 
    letterSpacing: -0.3, 
    fontWeight: '700', 
    fontSize: 18,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerSubtitle: { 
    color: TEXT_SECONDARY, 
    fontSize: 11,
    fontWeight: '500',
  },
  rightRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderColor: 'rgba(0,255,255,0.25)',
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  planText: { 
    color: ACCENT, 
    fontSize: 11, 
    fontWeight: '700', 
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.25)',
  },
});
