import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

/**
 * Hook para gestionar autenticación
 */
export const useAuth = () => {
  const navigate = useNavigate();

  const isAuthenticated = useCallback(() => {
    return !!storage.get('token');
  }, []);

  const getUser = useCallback(() => {
    return {
      userId: storage.get('userId'),
      userName: storage.get('userName'),
      userRole: storage.get('userRole'),
      token: storage.get('token'),
    };
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    navigate('/login');
  }, [navigate]);

  const setAuthUser = useCallback((userData) => {
    if (userData.token) {
      storage.set('token', userData.token);
    }
    if (userData.userId) {
      storage.set('userId', userData.userId);
    }
    if (userData.userName) {
      storage.set('userName', userData.userName);
    }
    if (userData.userRole) {
      storage.set('userRole', userData.userRole.toLowerCase());
    }
  }, []);

  return {
    isAuthenticated: isAuthenticated(),
    getUser,
    logout,
    setAuthUser,
  };
};

export default useAuth;
