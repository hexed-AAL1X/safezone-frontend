import AsyncStorage from '@react-native-async-storage/async-storage';

// MODO DEMO SIN BACKEND
// Todas las funciones devuelven datos locales y nunca hacen fetch.

interface ApiResponseSuccess<T> {
  status: 'success';
  data: T;
}

interface ApiResponseError {
  status: 'error';
  message: string;
}

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  plan?: 'FREE' | 'PREMIUM';
  planUpdatedAt?: string | null;
  notificationsEnabled?: boolean;
  locationSharingEnabled?: boolean;
  darkModeEnabled?: boolean;
  locationHistoryEnabled?: boolean;
  role?: 'USER' | 'GUARDIAN';
  createdAt: string;
  updatedAt?: string;
};

// Usuario demo fijo
const DEMO_USER: ApiUser = {
  id: 'demo-user-1',
  email: 'safezone@gmail.com',
  name: 'Jhon Doe',
  firstName: 'Jhon',
  lastName: 'Doe',
  phone: '+51 987654321',
  address: 'Miraflores, Lima',
  avatarUrl: null,
  plan: 'FREE',
  planUpdatedAt: null,
  notificationsEnabled: true,
  locationSharingEnabled: true,
  darkModeEnabled: true,
  locationHistoryEnabled: true,
  role: 'USER',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_TOKEN = 'demo-token-safezone';


export async function registerUser(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'USER' | 'GUARDIAN';
  guardianCity?: string;
  guardianMotivation?: string;
  guardianExperience?: string;
  guardianAcceptedTerms?: boolean;
}): Promise<{ user: ApiUser; token: string }> {
  // Ignoramos credenciales reales y siempre registramos al usuario demo
  const user: ApiUser = {
    ...DEMO_USER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.multiSet([
    ['auth_token', DEMO_TOKEN],
    ['auth_user', JSON.stringify(user)],
  ]);

  return { user, token: DEMO_TOKEN };
}

export async function deleteMyAccount(): Promise<{ message: string }> {
  // Modo demo: simplemente borramos los datos locales
  await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  return { message: 'Cuenta demo eliminada localmente.' };
}

export async function resetMyData(): Promise<{ message: string }> {
  // Modo demo: limpiamos chats y contactos almacenados localmente
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter((k) =>
    k.startsWith('chat_history_') ||
    k === 'auth_token' ||
    k === 'auth_user',
  );
  if (toRemove.length) {
    await AsyncStorage.multiRemove(toRemove);
  }
  await AsyncStorage.multiSet([
    ['auth_token', DEMO_TOKEN],
    ['auth_user', JSON.stringify(DEMO_USER)],
  ]);
  return { message: 'Datos de la cuenta demo reiniciados localmente.' };
}

export async function verifyMyPassword(params: {
  currentPassword: string;
}): Promise<{ message: string }> {
  // Modo demo: siempre consideramos la contraseña válida
  return { message: 'Contraseña verificada (demo, sin backend).' };
}

export async function getCurrentUserProfile(): Promise<{ user: ApiUser }> {
  const stored = await AsyncStorage.getItem('auth_user');
  if (stored) {
    try {
      const user = JSON.parse(stored) as ApiUser;
      return { user };
    } catch {}
  }
  await AsyncStorage.setItem('auth_user', JSON.stringify(DEMO_USER));
  await AsyncStorage.setItem('auth_token', DEMO_TOKEN);
  return { user: DEMO_USER };
}

export async function updateMyProfile(params: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
}): Promise<{ user: ApiUser }> {
  const baseUser = (await getCurrentUserProfile()).user;
  const updated: ApiUser = {
    ...baseUser,
    name: params.name ?? baseUser.name,
    email: params.email ?? baseUser.email,
    phone: params.phone ?? baseUser.phone,
    address: params.address ?? baseUser.address,
    avatarUrl: params.avatarUrl ?? baseUser.avatarUrl ?? null,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem('auth_user', JSON.stringify(updated));
  return { user: updated };
}

export async function changeMyPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  // Modo demo: no cambiamos nada realmente
  return { message: 'Contraseña actualizada (demo, sin backend).' };
}

// --- Dashboard data ---

export type ApiClub = {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  imageUrl?: string | null;
  openUntil?: string | null;
  priceLevel: number;
  atmosphere?: string | null;
  reviews: number;
  lat: number;
  lng: number;
};

// Antros / clubs demo en Lima
const DEMO_CLUBS: ApiClub[] = [
  {
    id: 'club-eclipse',
    name: 'Club Eclipse Miraflores',
    rating: 4.7,
    tags: ['Miraflores', 'Reggaetón', 'Seguridad'],
    imageUrl: null,
    openUntil: '03:00',
    priceLevel: 3,
    atmosphere: 'Ambiente urbano con protocolo anti-acoso activo.',
    reviews: 124,
    lat: -12.1215,
    lng: -77.0301,
  },
  {
    id: 'club-neon',
    name: 'Neon Bar Barranco',
    rating: 4.5,
    tags: ['Barranco', 'Electrónica', 'Terraza'],
    imageUrl: null,
    openUntil: '04:00',
    priceLevel: 2,
    atmosphere: 'Bar lounge con pista pequeña y buena vista.',
    reviews: 89,
    lat: -12.143,
    lng: -77.022,
  },
  {
    id: 'club-cueva',
    name: 'La Cueva Lima',
    rating: 4.6,
    tags: ['Centro', 'Rock', 'Anti-acoso'],
    imageUrl: null,
    openUntil: '02:30',
    priceLevel: 2,
    atmosphere: 'Espacio underground con controles estrictos de seguridad.',
    reviews: 73,
    lat: -12.053,
    lng: -77.037,
  },
  {
    id: 'club-malecon',
    name: 'Malecón Night',
    rating: 4.4,
    tags: ['Miraflores', 'Vista al mar'],
    imageUrl: null,
    openUntil: '01:30',
    priceLevel: 3,
    atmosphere: 'Ambiente tranquilo para salir en grupo y conversar.',
    reviews: 51,
    lat: -12.126,
    lng: -77.033,
  },
  {
    id: 'club-safezone',
    name: 'SafeZone Experience',
    rating: 5.0,
    tags: ['Demo', 'Seguridad total'],
    imageUrl: null,
    openUntil: 'Siempre',
    priceLevel: 1,
    atmosphere: 'Club ficticio para mostrar cómo SafeZone puede ayudarte.',
    reviews: 999,
    lat: -12.09,
    lng: -77.03,
  },
];

export async function getClubs(): Promise<ApiClub[]> {
  return DEMO_CLUBS;
}

export async function createClub(params: {
  name: string;
  lat: number;
  lng: number;
  tags?: string[];
  imageUrl?: string | null;
  openUntil?: string | null;
  priceLevel?: number;
  atmosphere?: string | null;
}): Promise<ApiClub> {
  const created: ApiClub = {
    id: `club-${Date.now()}`,
    name: params.name,
    rating: 4.5,
    tags: params.tags ?? ['Nuevo'],
    imageUrl: params.imageUrl ?? null,
    openUntil: params.openUntil ?? null,
    priceLevel: params.priceLevel ?? 2,
    atmosphere: params.atmosphere ?? 'Club creado en modo demo.',
    reviews: 0,
    lat: params.lat,
    lng: params.lng,
  };
  DEMO_CLUBS.push(created);
  return created;
}

export type ApiCommunityGroup = {
  id: string;
  name: string;
  category: string;
  description: string;
  avatar?: string | null;
  membersCount: number;
  onlineCount: number;
};

const DEMO_GROUPS: ApiCommunityGroup[] = [
  {
    id: 'grupo-1',
    name: 'Noches Seguras Miraflores',
    category: 'Salidas y fiestas',
    description:
      'Grupo para coordinar salidas seguras por Miraflores, compartir experiencias y tips de seguridad.',
    avatar: '🌃',
    membersCount: 128,
    onlineCount: 18,
  },
  {
    id: 'grupo-2',
    name: 'Barranco Sin Acoso',
    category: 'Comunidad',
    description:
      'Personas que salen por Barranco y usan SafeZone para reportar y prevenir situaciones de riesgo.',
    avatar: '🎶',
    membersCount: 96,
    onlineCount: 12,
  },
  {
    id: 'grupo-3',
    name: 'Amigos SafeZone Lima',
    category: 'Historias SafeZone',
    description:
      'Historias reales de cómo SafeZone ayudó a volver a casa seguros después de la fiesta.',
    avatar: '🛟',
    membersCount: 210,
    onlineCount: 25,
  },
  {
    id: 'grupo-4',
    name: 'After Office Centro',
    category: 'After office',
    description:
      'Planea after office seguros cerca del centro de Lima y coordina puntos de encuentro.',
    avatar: '🍻',
    membersCount: 74,
    onlineCount: 9,
  },
  {
    id: 'grupo-5',
    name: 'Rutas Seguras Lima',
    category: 'Transporte',
    description:
      'Comparte rutas seguras, aplicaciones útiles y recomendaciones para volver a casa.',
    avatar: '🛣️',
    membersCount: 156,
    onlineCount: 14,
  },
];

export async function getCommunityGroups(): Promise<ApiCommunityGroup[]> {
  return DEMO_GROUPS;
}

export async function createCommunityGroup(params: {
  name: string;
  category: string;
  description: string;
  avatar?: string | null;
}): Promise<ApiCommunityGroup> {
  const created: ApiCommunityGroup = {
    id: `grupo-${Date.now()}`,
    name: params.name,
    category: params.category,
    description: params.description,
    avatar: params.avatar ?? null,
    membersCount: 1,
    onlineCount: 1,
  };
  DEMO_GROUPS.push(created);
  return created;
}

export type ApiEmergencyContact = {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  status?: 'ONLINE' | 'OFFLINE' | null;
  lastSeen?: string | null;
  lat?: number | null;
  lng?: number | null;
  favorite: boolean;
};

const DEMO_CONTACTS: ApiEmergencyContact[] = [
  {
    id: 'contacto-1',
    name: 'Ana Fiesta',
    phone: '+51 999111222',
    avatar: '🎉',
    status: 'ONLINE',
    lastSeen: null,
    lat: -12.1219,
    lng: -77.0298,
    favorite: true,
  },
  {
    id: 'contacto-2',
    name: 'Carlos Guardia',
    phone: '+51 988222333',
    avatar: '🛡️',
    status: 'OFFLINE',
    lastSeen: 'Visto por última vez hace 30 min cerca de Barranco',
    lat: -12.142,
    lng: -77.021,
    favorite: false,
  },
  {
    id: 'contacto-3',
    name: 'Lucía Taxi Seguro',
    phone: '+51 977333444',
    avatar: '🚕',
    status: 'ONLINE',
    lastSeen: null,
    lat: -12.127,
    lng: -77.035,
    favorite: true,
  },
  {
    id: 'contacto-4',
    name: 'Grupo Roomies',
    phone: '+51 966444555',
    avatar: '🏠',
    status: 'OFFLINE',
    lastSeen: 'Se conectó hace 1 h desde Lima Centro',
    lat: -12.055,
    lng: -77.04,
    favorite: false,
  },
  {
    id: 'contacto-5',
    name: 'SafeZone Bot',
    phone: '+51 955555555',
    avatar: '🤖',
    status: 'ONLINE',
    lastSeen: null,
    lat: -12.12,
    lng: -77.028,
    favorite: false,
  },
];

export async function getMyEmergencyContacts(): Promise<ApiEmergencyContact[]> {
  return DEMO_CONTACTS;
}

export async function sendSosAlert(params: {
  audioBase64: string;
  mimeType?: string;
  durationSeconds?: number;
  lat?: number;
  lng?: number;
  startedAt?: string;
}): Promise<{ message: string }> {
  // Modo demo: solo devolvemos un mensaje de éxito local
  return {
    message:
      'Alerta SOS registrada en modo demo. En la versión real, se enviaría a tus contactos y guardianes.',
  };
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  return {
    message:
      'Modo demo: se simula el envío de un correo de recuperación a tu bandeja de entrada.',
  };
}

export async function verifyResetCode(params: {
  email: string;
  token: string;
}): Promise<{ message: string }> {
  return { message: 'Código verificado correctamente (demo, sin backend).' };
}

export async function resetPasswordWithCode(params: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return {
    message:
      'Contraseña actualizada en modo demo. En producción se aplicaría en tu cuenta real.',
  };
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: ApiUser; token: string }> {
  // Modo demo: ignoramos credenciales y devolvemos siempre el usuario demo
  const stored = await AsyncStorage.getItem('auth_user');
  const user = stored ? (JSON.parse(stored) as ApiUser) : DEMO_USER;
  await AsyncStorage.multiSet([
    ['auth_token', DEMO_TOKEN],
    ['auth_user', JSON.stringify(user)],
  ]);
  return { user, token: DEMO_TOKEN };
}
