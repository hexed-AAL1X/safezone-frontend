import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#000000';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffd1';
const CTA = '#00e0b8';

type ChatItem = { id: string; name: string; lastMessage: string; timestamp: string };

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const chatKeys = keys.filter(k => k.startsWith('chat_history_'));
        
        const chatData: ChatItem[] = [];
        for (const key of chatKeys) {
          const stored = await AsyncStorage.getItem(key);
          if (stored) {
            const msgs = JSON.parse(stored);
            const lastMsg = msgs[msgs.length - 1];
            const id = key.replace('chat_history_', '');
            const name = id.replace('contact-', '').replace('group-', '').replace('driver-', '').toUpperCase();
            
            chatData.push({
              id,
              name,
              lastMessage: lastMsg?.text || 'Sin mensajes',
              timestamp: 'Hace 2h',
            });
          }
        }
        
        setChats(chatData);
      } catch (error) {
        console.error('Error cargando historial de chats:', error);
      }
    };
    
    loadChats();
  }, []);

  const openChat = (id: string) => {
    router.push(`/chat/${id}` as any);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Ionicons name="chatbubbles" size={22} color={ACCENT} />
        <Text style={styles.header}>Historial de Conversaciones</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={TEXT_SECONDARY} />
          <Text style={styles.emptyText}>No hay conversaciones recientes</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openChat(item.id)}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                <Ionicons name="chevron-forward" size={18} color={TEXT_SECONDARY} style={{ marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingHorizontal: 16 },
  header: { color: TEXT, fontSize: 18, flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { color: TEXT_SECONDARY },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 48, height: 48, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)' },
  name: { color: TEXT, fontWeight: '600' },
  lastMessage: { color: TEXT_SECONDARY, marginTop: 2 },
  timestamp: { color: TEXT_SECONDARY, fontSize: 12 },
});
