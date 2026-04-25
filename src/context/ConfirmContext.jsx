import React, { createContext, useState, useContext } from 'react';
import AuraConfirmModal from '../components/AuraConfirmModal';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'danger',
    onConfirm: () => {},
  });

  const askConfirmation = ({ title, message, confirmText, cancelText, type, onConfirm }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ askConfirmation }}>
      {children}
      <AuraConfirmModal 
        {...modalConfig} 
        onClose={closeModal}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
  }
  return context;
};
