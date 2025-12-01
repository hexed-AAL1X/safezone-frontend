import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

type Msg = { id: string; me?: boolean; text: string };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = useMemo(() => (id || '').toString().toUpperCase(), [id]);

  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);

  // Cargar historial desde AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const key = `chat_history_${id}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setMsgs(JSON.parse(stored));
        } else {
          // Mensajes iniciales si no hay historial - conversaciones sobre experiencias en discotecas
          const isGroupChat = id?.toString().startsWith('group-');
          if (isGroupChat) {
            setMsgs([
              { id: 'm1', text: 'Alguien fue a Club Eclipse el fin de semana?' },
              { id: 'm2', text: 'Sí! La seguridad estuvo excelente, el staff muy atento 👍' },
              { id: 'm3', text: 'Confirmo, me sentí muy segura. Los guardias revisan bien en la entrada' },
              { id: 'm4', me: true, text: 'Qué bueno saberlo! Estaba pensando ir este sábado' },
              { id: 'm5', text: 'Recomendado! Pero llega temprano porque se llena rápido' },
              { id: 'm6', text: 'La Cueva también está buena, tienen protocolo anti-acoso muy estricto' },
              { id: 'm7', text: 'Alguien conoce Neon Bar? Vi que tiene buenas reviews' },
              { id: 'm8', text: 'Sí, es más tranquilo. Ideal si quieres algo más lounge' },
            ]);
          } else {
            setMsgs([
              { id: 'm1', text: 'Hola! ¿Todo bien?' },
              { id: 'm2', me: true, text: 'Sí, todo perfecto!' },
            ]);
          }
        }
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    };
    loadHistory();
  }, [id]);

  // Guardar historial cuando cambian los mensajes
  useEffect(() => {
    const saveHistory = async () => {
      if (msgs.length === 0) return;
      try {
        const key = `chat_history_${id}`;
        await AsyncStorage.setItem(key, JSON.stringify(msgs));
      } catch (error) {
        console.error('Error guardando historial:', error);
      }
    };
    saveHistory();
  }, [msgs, id]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs(prev => [...prev, { id: Date.now().toString(), me: true, text: text.trim() }]);
    setText('');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(8, insets.top) }]}> 
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Ionicons name="chatbubbles" size={18} color={ACCENT} />
        <Text style={styles.headerText}>{title}</Text>
      </View>

      <FlatList
        data={msgs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.me ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={item.me ? styles.bubbleTextMe : styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.composer, { paddingBottom: Math.max(8, insets.bottom) }]}> 
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje"
            placeholderTextColor={TEXT_SECONDARY}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.send} onPress={send}>
            <Ionicons name="send" size={18} color="#001311" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginTop: 6 },
  headerText: { color: TEXT, fontWeight: '600' },
  bubble: { maxWidth: '75%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.05)' },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: CTA },
  bubbleText: { color: TEXT },
  bubbleTextMe: { color: '#001311' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: TEXT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  send: { backgroundColor: CTA, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
});
