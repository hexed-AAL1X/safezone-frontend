import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      safeAreaInsets={{ bottom: Math.max(8, insets.bottom) }}
      screenOptions={{
        tabBarActiveTintColor: '#00e0b8',
        tabBarInactiveTintColor: '#9BA1A6',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 62 + Math.max(0, insets.bottom - 4),
          paddingTop: 6,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: '#000' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="contacts" options={{ title: 'Contactos', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Comunidad', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }} />
      <Tabs.Screen name="clubs" options={{ title: 'Discotecas', tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} /> }} />
      <Tabs.Screen name="taxis" options={{ title: 'Taxis', tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} /> }} />
    </Tabs>
  );
}
