import '@testing-library/jest-dom/vitest'

// Node 22 exposes an experimental global `localStorage` (via --localstorage-file)
// that shadows jsdom's and throws "setItem is not a function" without a valid
// file path. Install a simple in-memory Storage so app code that touches
// localStorage (LocaleProvider, useProgress, usePersona, accountData) works in tests.
const store = new Map<string, string>()
const memoryStorage: Storage = {
  get length() {
    return store.size
  },
  clear: () => store.clear(),
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  removeItem: (key: string) => {
    store.delete(key)
  },
  setItem: (key: string, value: string) => {
    store.set(key, String(value))
  },
}
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
})
