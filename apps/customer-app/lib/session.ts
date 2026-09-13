import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const TOKEN = 'auth_token'
const USER = 'auth_user'

async function write(key: string, value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function read(key: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key)
  }
  return SecureStore.getItemAsync(key)
}

async function remove(key: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export const sessionStore = {
  write,
  read,
  remove,
  TOKEN,
  USER,
}
