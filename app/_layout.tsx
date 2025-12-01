import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import PrivacyShield from '@/components/PrivacyShield';

export const unstable_settings = {
  // Esto asegura que cualquier enlace profundo abra `(tabs)`
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const [appIsReady, setAppIsReady] = useState(false);
  const pathname = usePathname();

  // Cargar fuentes
  useEffect(() => {
    // No dependemos de fuentes locales para mostrar el splash
    setAppIsReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // App está lista
    }
  }, [appIsReady]);

  // Pedir permisos clave la primera vez
  useEffect(() => {
    async function requestInitialPermissions() {
      try {
        const flag = await AsyncStorage.getItem('sz_permissions_requested');
        if (flag === '1') return;

        try {
          await Location.requestForegroundPermissionsAsync();
        } catch (e) {
          console.error('Error pidiendo permiso de ubicación:', e);
        }

        if (Platform.OS === 'android') {
          try {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
          } catch (e) {
            console.error('Error pidiendo permisos Android extra:', e);
          }
        }

        await AsyncStorage.setItem('sz_permissions_requested', '1');
      } catch (e) {
        console.error('Error en permisos iniciales:', e);
      }
    }

    requestInitialPermissions();
  }, []);

  if (!appIsReady) {
    return null;
  }

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isWelcomeRoute =
    pathname === '/onboarding' ||
    pathname === '/onboarding/index';
  const shouldShowPrivacyShield = !isAuthRoute && !isWelcomeRoute;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <Stack initialRouteName="index" screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="recover" options={{ headerShown: false }} />
          <Stack.Screen name="plan" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="chat-history" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="settings/profile" options={{ headerShown: false }} />
          <Stack.Screen name="settings/plans" options={{ headerShown: false }} />
          <Stack.Screen name="settings/danger-zone" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        {shouldShowPrivacyShield && <PrivacyShield />}
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
