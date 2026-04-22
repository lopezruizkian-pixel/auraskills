import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'aura-skill-secret-salt-2024';

/**
 * Utilidad para manejar almacenamiento seguro en sessionStorage
 */
export const storage = {
  /**
   * Guarda un dato encriptado
   */
  set(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  /**
   * Obtiene y desencripta un dato
   */
  get(key) {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  /**
   * Elimina un dato
   */
  remove(key) {
    sessionStorage.removeItem(key);
  },

  /**
   * Limpia todo el almacenamiento de la sesión
   */
  clear() {
    sessionStorage.clear();
  }
};

export default storage;
