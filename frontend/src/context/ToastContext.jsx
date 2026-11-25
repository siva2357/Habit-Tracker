import React, { createContext, useContext, useState, useCallback } from 'react';
import Toaster from '../components/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Flexible addToast supporting:
   * 1. addToast("Message text", "success", "Optional Title", duration)
   * 2. addToast({ message: "Text", type: "success", title: "Done", duration: 4000 })
   */
  const addToast = useCallback((firstArg, secondArg, thirdArg, fourthArg) => {
    let type = 'info';
    let message = '';
    let title = '';
    let duration = 3500;

    if (typeof firstArg === 'string') {
      message = firstArg;
      if (typeof secondArg === 'string') {
        type = secondArg;
        if (typeof thirdArg === 'string') {
          title = thirdArg;
        }
        if (typeof fourthArg === 'number') {
          duration = fourthArg;
        }
      } else if (typeof secondArg === 'object' && secondArg !== null) {
        type = secondArg.type || 'info';
        title = secondArg.title || '';
        duration = secondArg.duration !== undefined ? secondArg.duration : 3500;
      }
    } else if (typeof firstArg === 'object' && firstArg !== null) {
      type = firstArg.type || 'info';
      message = firstArg.message || firstArg.text || '';
      title = firstArg.title || '';
      duration = firstArg.duration !== undefined ? firstArg.duration : 3500;
    }

    // Default title based on type if omitted
    if (!title) {
      switch (type) {
        case 'success':
          title = 'Action Successful';
          break;
        case 'error':
          title = 'Action Failed';
          break;
        case 'warning':
          title = 'Attention Required';
          break;
        case 'info':
        default:
          title = 'Notification';
          break;
      }
    }

    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, customTitle) => addToast(msg, 'success', customTitle),
    error: (msg, customTitle) => addToast(msg, 'error', customTitle),
    warning: (msg, customTitle) => addToast(msg, 'warning', customTitle),
    info: (msg, customTitle) => addToast(msg, 'info', customTitle)
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, dismissToast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
