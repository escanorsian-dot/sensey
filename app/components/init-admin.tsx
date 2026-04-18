'use client';

import { useEffect, useRef } from 'react';

export default function InitAdmin() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const init = async () => {
      try {
        await fetch('/api/init-admin', {
          method: 'POST',
        });
      } catch (err) {
        console.error('[INIT] Admin initialization failed:', err);
      }
    };

    init();
  }, []);

  return null;
}