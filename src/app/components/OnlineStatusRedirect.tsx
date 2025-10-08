'use client'
import { useEffect, useState } from 'react';

export default function OnlineStatusRedirect({children}:any) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 213px)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#111', fontSize: '32px', fontWeight: 'bold' }}>인터넷 연결이 끊겼어요</h1>
        <p style={{ fontSize: '16px', color: '#767676' }}>잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  return <>{children}</>;
}
