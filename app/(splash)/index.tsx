import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AnimatedLogo from '../../components/AnimatedLogo';

// El manejo del splash nativo se realiza en app/_layout.tsx

const SplashScreenComponent: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    (async () => {
      try {
        const [token, onboardingFlag] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('sz_onboarding_completed'),
        ]);

        let target: string;
        if (token) {
          target = '/(tabs)';
        } else if (onboardingFlag === '1') {
          target = '/login';
        } else {
          target = '/onboarding';
        }

        timeout = setTimeout(() => {
          router.replace(target as any);
        }, 1800);
      } catch (error) {
        console.error('Error en splash SafeZone:', error);
        timeout = setTimeout(() => {
          router.replace('/login' as any);
        }, 1800);
      }
    })();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>
        <AnimatedLogo size={680} />
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>En SafeZone el acoso no tiene lugar</Text>
          <Text style={styles.messageText}>
            Si ves algo que incomoda o pone en riesgo a alguien, actúa de forma segura y busca ayuda.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 80,
    left: 32,
    right: 32,
  },
  messageTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    color: '#d0d0d0',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default SplashScreenComponent;

