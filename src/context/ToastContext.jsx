import { createContext, useCallback } from 'react';
import { AuraToast } from '../utils/swal';

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  
  const addToast = useCallback((message, type = 'info') => {
    AuraToast.fire({
      icon: type,
      title: message
    });
  }, []);

  const success = useCallback((message) => 
    addToast(message, 'success'), 
  [addToast]);

  const error = useCallback((message) => 
    addToast(message, 'error'), 
  [addToast]);

  const info = useCallback((message) => 
    addToast(message, 'info'), 
  [addToast]);

  const warning = useCallback((message) => 
    addToast(message, 'warning'), 
  [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts: [], // Mantenemos el array vacÃ­o por compatibilidad si algÃºn componente lo lee
        addToast,
        removeToast: () => {}, // No hace nada ahora
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
