import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  children: React.ReactNode;
}

export default function BiometricGate({ children }: Props) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          setAuthenticated(true);
          return;
        }

        await runAuth();
      } catch (error) {
        console.error('Error comprobando biometría:', error);
        setAuthenticated(true);
      } finally {
        setChecking(false);
      }
    }

    init();
  }, []);

  async function runAuth() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquea SafeZone',
        fallbackLabel: 'Usar código del dispositivo',
      });

      if (result.success) {
        setAuthenticated(true);
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
    }
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Protegido con huella</Text>
      <Text style={styles.subtitle}>
        Usa tu huella para acceder a las funciones principales de SafeZone.
      </Text>
      {checking ? (
        <ActivityIndicator size="large" color="#00ffff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={runAuth} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Desbloquear con huella</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#d0d0d0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00ffff',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#001311',
    fontWeight: '600',
    fontSize: 16,
  },
});
