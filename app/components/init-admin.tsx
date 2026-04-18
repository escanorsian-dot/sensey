'use client';

import { useEffect } from 'react';

export default function InitAdmin() {
  useEffect(() => {
    fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'qwertyu', password: 'qwertyu' })
    }).catch(console.error);
  }, []);

  return null;
}