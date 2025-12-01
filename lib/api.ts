import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://4.201.139.84:3001/api';

if (!API_BASE_URL) {
  // Fallback de seguridad, aunque en la práctica siempre tendremos algo
  // eslint-disable-next-line no-console
  console.warn('API_BASE_URL no definido. Configura EXPO_PUBLIC_API_URL.');
}

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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, '');
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${urlPath}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = await AsyncStorage.getItem('auth_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let json: ApiResponseSuccess<unknown> | ApiResponseError | null = null;
  try {
    json = (await response.json()) as any;
  } catch {
    // ignorar parse error, se manejará abajo
  }

  if (!response.ok) {
    const message =
      (json as ApiResponseError | null)?.message ||
      `Error de red (${response.status})`;
    throw new Error(message);
  }

  return (json as ApiResponseSuccess<T>).data;
}

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
  const data = await request<{ user: ApiUser; token: string }>(
    '/users/register',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
  );

  await AsyncStorage.multiSet([
    ['auth_token', data.token],
    ['auth_user', JSON.stringify(data.user)],
  ]);

  return data;
}

export async function deleteMyAccount(): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/me', {
    method: 'DELETE',
  });
  await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  return data;
}

export async function resetMyData(): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/reset-data', {
    method: 'POST',
  });
  return data;
}

export async function verifyMyPassword(params: {
  currentPassword: string;
}): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/verify-password', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data;
}

export async function getCurrentUserProfile(): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>('/users/me');
}

export async function updateMyProfile(params: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
}): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function changeMyPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data;
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

export async function getClubs(): Promise<ApiClub[]> {
  return request<ApiClub[]>('/clubs');
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
  return request<ApiClub>('/clubs', {
    method: 'POST',
    body: JSON.stringify(params),
  });
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

export async function getCommunityGroups(): Promise<ApiCommunityGroup[]> {
  return request<ApiCommunityGroup[]>('/community/groups');
}

export async function createCommunityGroup(params: {
  name: string;
  category: string;
  description: string;
  avatar?: string | null;
}): Promise<ApiCommunityGroup> {
  return request<ApiCommunityGroup>('/community/groups', {
    method: 'POST',
    body: JSON.stringify(params),
  });
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

export async function getMyEmergencyContacts(): Promise<ApiEmergencyContact[]> {
  return request<ApiEmergencyContact[]>('/users/contacts');
}

export async function sendSosAlert(params: {
  audioBase64: string;
  mimeType?: string;
  durationSeconds?: number;
  lat?: number;
  lng?: number;
  startedAt?: string;
}): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/sos-alert', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return data;
}

export async function verifyResetCode(params: {
  email: string;
  token: string;
}): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/verify-reset-code', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data;
}

export async function resetPasswordWithCode(params: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const data = await request<{ message: string }>('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data;
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: ApiUser; token: string }> {
  const data = await request<{ user: ApiUser; token: string }>(
    '/users/login',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
  );

  await AsyncStorage.multiSet([
    ['auth_token', data.token],
    ['auth_user', JSON.stringify(data.user)],
  ]);

  return data;
}
