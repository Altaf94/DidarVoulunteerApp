import { useState } from 'react';
import { AlertType, AlertState } from '../types';

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false,
  });

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlert({
      type,
      title,
      message,
      isVisible: true,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  // Convenience methods
  const showError = (title: string, message: string) =>
    showAlert('error', title, message);
  const showSuccess = (title: string, message: string) =>
    showAlert('success', title, message);
  const showWarning = (title: string, message: string) =>
    showAlert('warning', title, message);
  const showInfo = (title: string, message: string) =>
    showAlert('info', title, message);

  return {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};
