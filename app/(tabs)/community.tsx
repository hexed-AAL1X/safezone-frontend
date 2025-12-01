import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThrottle } from '@/hooks/useDebounce';
import { getCommunityGroups, ApiCommunityGroup, getCurrentUserProfile, createCommunityGroup } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';

const BG = '#0c0b0c';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#d0d0d0';
const ACCENT = '#00ffff';
const CTA = '#00ffff';

type Group = { id: string; name: string; members: number; joined?: boolean; category: string; online: number; avatar: string; description: string; };

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGuardian, setIsGuardian] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCommunityGroups();
        const mapped: Group[] = data.map((g: ApiCommunityGroup) => ({
          id: g.id,
          name: g.name,
          category: g.category,
          description: g.description,
          avatar: g.avatar || '👥',
          members: g.membersCount,
          online: g.onlineCount,
        }));
        setGroups(mapped);
      } catch (error) {
        console.error('Error cargando grupos de comunidad:', error);
        setGroups([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentUserProfile();
        if (res.user.role === 'GUARDIAN') {
          setIsGuardian(true);
        }
      } catch (error) {
        console.error('Error obteniendo perfil en comunidad:', error);
      }
    })();
  }, []);

  const toggleJoin = (id: string) => setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: !g.joined } : g));
  const openChat = useThrottle((id: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: `group-${id}` } });
  }, 800);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerWrapper}>
        <DashboardHeader title="SafeZone" subtitle="Comunidad SafeZone" />
      </View>
      <View style={styles.topSection}>
        <View style={styles.statsGrid}>
          <View style={styles.mainStatCard}>
            <Ionicons name="people" size={28} color={ACCENT} />
            <Text style={styles.mainStatNumber}>{groups.length}</Text>
            <Text style={styles.mainStatLabel}>Grupos Activos</Text>
          </View>
          <View style={styles.secondaryStats}>
            <View style={styles.miniStatCard}>
              <Ionicons name="globe-outline" size={20} color={"#4ade80"} />
              <View style={{ flex: 1 }}>
                <Text style={styles.miniStatNumber}>{groups.reduce((acc, g) => acc + g.online, 0)}</Text>
                <Text style={styles.miniStatLabel}>En Línea</Text>
              </View>
            </View>
            <View style={styles.miniStatCard}>
              <Ionicons name="person-add-outline" size={20} color={"#fbbf24"} />
              <View style={{ flex: 1 }}>
                <Text style={styles.miniStatNumber}>{groups.filter(g => g.joined).length}</Text>
                <Text style={styles.miniStatLabel}>Unidos</Text>
              </View>
            </View>
          </View>
        </View>
        {isGuardian && (
          <TouchableOpacity
            style={styles.guardianCreateBtn}
            onPress={() => setShowCreateForm(prev => !prev)}
          >
            <Ionicons name="add-circle-outline" size={16} color={CTA} />
            <Text style={styles.guardianCreateText}>
              {showCreateForm ? 'Cerrar creación de grupo' : 'Crear grupo de comunidad'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={groups}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 12 }}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          isGuardian && showCreateForm ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>Nuevo grupo de comunidad</Text>
              {createError ? <Text style={styles.createError}>{createError}</Text> : null}

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Nombre</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="Nombre del grupo"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Categoría</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="Ej: Seguridad Miraflores"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
              </View>

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Descripción</Text>
                <TextInput
                  style={[styles.createInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Cuenta brevemente de qué va este grupo y a quién está dirigido"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                />
              </View>

              <View style={styles.createRow}>
                <Text style={styles.createLabel}>Avatar (emoji o iniciales, opcional)</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="👮‍♀️, 🏙️, SZ..."
                  placeholderTextColor={TEXT_SECONDARY}
                  value={newAvatar}
                  onChangeText={setNewAvatar}
                />
              </View>

              <TouchableOpacity
                style={[styles.createBtn, creating && styles.createBtnDisabled]}
                disabled={creating}
                onPress={async () => {
                  if (creating) return;
                  if (!newName.trim() || !newCategory.trim() || !newDescription.trim()) {
                    setCreateError('Nombre, categoría y descripción son obligatorios.');
                    return;
                  }

                  setCreating(true);
                  setCreateError(null);

                  try {
                    const created = await createCommunityGroup({
                      name: newName.trim(),
                      category: newCategory.trim(),
                      description: newDescription.trim(),
                      avatar: newAvatar.trim() ? newAvatar.trim() : undefined,
                    });

                    const mapped: Group = {
                      id: created.id,
                      name: created.name,
                      category: created.category,
                      description: created.description,
                      avatar: created.avatar || '👥',
                      members: created.membersCount,
                      online: created.onlineCount,
                    };

                    setGroups(prev => [mapped, ...prev]);

                    setNewName('');
                    setNewCategory('');
                    setNewDescription('');
                    setNewAvatar('');
                    setShowCreateForm(false);
                  } catch (error: any) {
                    console.error('Error creando grupo de comunidad:', error);
                    setCreateError(error?.message ?? 'No se pudo crear el grupo.');
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                <Text style={styles.createBtnText}>
                  {creating ? 'Creando…' : 'Crear grupo'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupAvatarWrapper}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupEmoji}>{item.avatar}</Text>
                </View>
                {item.joined && <View style={styles.memberBadge} />}
              </View>
              
              <View style={styles.groupInfo}>
                <View style={styles.groupNameRow}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  {item.joined && (
                    <View style={styles.joinedPill}>
                      <Ionicons name="checkmark-circle" size={12} color={ACCENT} />
                      <Text style={styles.joinedText}>Miembro</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.groupCategory}>{item.category}</Text>
              </View>
            </View>
            
            <Text style={styles.groupDescription}>{item.description}</Text>
            
            <View style={styles.groupMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="people" size={14} color={TEXT_SECONDARY} />
                <Text style={styles.metaText}>{item.members} miembros</Text>
              </View>
              <View style={styles.onlineIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.onlineText}>{item.online} en línea</Text>
              </View>
            </View>
            
            <View style={styles.groupActions}>
              {item.joined ? (
                <>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => openChat(item.id)}>
                    <Ionicons name="chatbubbles" size={16} color="#001311" />
                    <Text style={styles.primaryBtnText}>Abrir Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => toggleJoin(item.id)}>
                    <Ionicons name="exit-outline" size={16} color="#ff6b6b" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.joinButton} onPress={() => toggleJoin(item.id)}>
                  <Ionicons name="add-circle" size={16} color="#001311" />
                  <Text style={styles.joinButtonText}>Unirme al Grupo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: TEXT_SECONDARY, textAlign: 'center' }}>
              Aún no hay grupos de comunidad creados.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerWrapper: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 4 },
  
  // Top Stats Section
  topSection: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  mainStatCard: {
    flex: 1,
    backgroundColor: 'rgba(0,255,255,0.08)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  mainStatNumber: { color: ACCENT, fontSize: 32, fontWeight: '700' },
  mainStatLabel: { color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  secondaryStats: { flex: 1, gap: 12 },
  miniStatCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  miniStatNumber: { color: TEXT, fontSize: 18, fontWeight: '700' },
  miniStatLabel: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '600' },
  
  // Group Card
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  groupAvatarWrapper: { position: 'relative' },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  groupEmoji: { fontSize: 32 },
  memberBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    borderWidth: 3,
    borderColor: BG,
  },
  groupInfo: { flex: 1, gap: 6 },
  groupNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  groupName: { color: TEXT, fontSize: 17, fontWeight: '700' },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,255,0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  joinedText: { color: ACCENT, fontSize: 10, fontWeight: '700' },
  groupCategory: { color: TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  groupDescription: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 20 },
  
  // Group Meta
  groupMeta: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '500' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  onlineText: { color: '#4ade80', fontSize: 12, fontWeight: '600' },
  
  // Group Actions
  groupActions: { flexDirection: 'row', gap: 8 },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  primaryBtnText: { color: '#001311', fontSize: 13, fontWeight: '700' },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,255,255,0.5)',
  },
  joinButtonText: { color: '#001311', fontSize: 13, fontWeight: '700' },
  
  // Guardian create
  guardianCreateBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    gap: 8,
  },
  guardianCreateText: { color: CTA, fontSize: 12, fontWeight: '700' },

  createCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,255,0.25)',
    gap: 12,
  },
  createTitle: { color: TEXT, fontSize: 15, fontWeight: '700' },
  createError: { color: '#f97373', fontSize: 12 },
  createRow: { gap: 6 },
  createLabel: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  createInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    color: TEXT,
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  createBtn: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: { color: '#001311', fontSize: 14, fontWeight: '700' },
});
