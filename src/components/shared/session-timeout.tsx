'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export interface SessionTimeoutProps {
  timeoutMs?: number;
}

export const SessionTimeout: React.FC<SessionTimeoutProps> = ({
  timeoutMs = 30 * 60 * 1000,
}) => {
  const { handleLogout, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, timeoutMs, handleLogout]);

  return null;
};

export default SessionTimeout;
