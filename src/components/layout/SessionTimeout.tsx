'use client';

import { useEffect } from 'react';
import { logoutAction } from '@/app/login/actions';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL_MS = 10 * 1000; // Check every 10 seconds
const THROTTLE_MS = 5 * 1000; // Throttle storage updates to once every 5 seconds
const STORAGE_KEY = 'al_rayyan_last_activity';

export default function SessionTimeout() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastWriteTime = Date.now();
    
    // Initialize/reset the activity time on load
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    const updateActivity = () => {
      const now = Date.now();
      if (now - lastWriteTime > THROTTLE_MS) {
        localStorage.setItem(STORAGE_KEY, now.toString());
        lastWriteTime = now;
      }
    };

    const interval = setInterval(async () => {
      const lastActivityStr = localStorage.getItem(STORAGE_KEY);
      if (!lastActivityStr) {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        return;
      }

      const lastActivity = parseInt(lastActivityStr, 10);
      const timeSinceLastActivity = Date.now() - lastActivity;

      if (timeSinceLastActivity >= TIMEOUT_MS) {
        clearInterval(interval);
        try {
          await logoutAction();
        } catch (error) {
          console.error('Failed to auto-logout:', error);
          window.location.href = '/login';
        }
      }
    }, CHECK_INTERVAL_MS);

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  return null;
}
