/**
 * authStorage — lightweight auth persistence using AsyncStorage.
 * Stores a simple user session object so the app can skip login on relaunch.
 * No real JWT/OAuth here — swap this layer for a real auth provider later.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@tsg_user_session';

/** Save a user session after successful login / sign-up */
export async function saveSession(user) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/** Load an existing session — returns null if none found */
export async function loadSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Clear session on logout */
export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
