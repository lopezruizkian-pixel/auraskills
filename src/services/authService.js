import { httpClient } from './httpClient';
import { validateEmail, validatePassword } from './validation';
import { storage } from './storage';

export const loginUser = async (correo, password) => {
  if (!validateEmail(correo)) throw new Error('Email inválido');
  if (!password || password.length === 0) throw new Error('La contraseña es requerida');

  const data = await httpClient.post('/auth/login', { correo, password });
  return data;
};

export const registerUser = async (userData) => {
  const { nombre, usuario, correo, password, rol, habilidades } = userData;

  if (!nombre || nombre.trim().length === 0) throw new Error('El nombre es requerido');
  if (!usuario || usuario.trim().length === 0) throw new Error('El usuario es requerido');
  if (!validateEmail(correo)) throw new Error('Email inválido');

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) throw new Error(passwordValidation.error);

  const data = await httpClient.post('/auth/register', {
    nombre: nombre.trim(),
    usuario: usuario.trim(),
    correo,
    password,
    rol,
    habilidades,
  });

  return data;
};

export const validateToken = async () => {
  try {
    return await httpClient.get('/auth/profile');
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await httpClient.post('/auth/logout');
  } catch (err) {
    console.error('Error al notificar logout al servidor:', err);
  } finally {
    // Limpieza profunda de almacenamiento local y de sesión
    storage.clear();
    
    // Limpiar dinámicamente cualquier rastro de sesiones de salas en localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('room_start_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
