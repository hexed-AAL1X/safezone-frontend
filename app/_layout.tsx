import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import PrivacyShield from '@/components/PrivacyShield';

// Mantener la pantalla de splash hasta que estemos listos para ocultarla
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Esto asegura que cualquier enlace profundo abra `(tabs)`
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Cargar fuentes
  useEffect(() => {
    // No dependemos de fuentes locales para mostrar el splash
    setAppIsReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Esto le dice a la pantalla de splash que se oculte
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <Stack initialRouteName="index" screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
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
        <PrivacyShield />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
