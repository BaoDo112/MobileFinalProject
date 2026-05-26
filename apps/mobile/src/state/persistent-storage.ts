import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const inMemoryStorage = new Map<string, string>();

function readWebStorage(key: string) {
  if (globalThis.localStorage !== undefined) {
    return globalThis.localStorage.getItem(key);
  }

  return inMemoryStorage.get(key) ?? null;
}

function writeWebStorage(key: string, value: string) {
  if (globalThis.localStorage !== undefined) {
    globalThis.localStorage.setItem(key, value);
    return;
  }

  inMemoryStorage.set(key, value);
}

function deleteWebStorage(key: string) {
  if (globalThis.localStorage !== undefined) {
    globalThis.localStorage.removeItem(key);
    return;
  }

  inMemoryStorage.delete(key);
}

export const persistentStorage = {
  async getItem(key: string) {
    if (Platform.OS === "web") {
      return readWebStorage(key);
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      writeWebStorage(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string) {
    if (Platform.OS === "web") {
      deleteWebStorage(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};