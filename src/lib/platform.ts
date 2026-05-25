import { Capacitor } from '@capacitor/core';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): 'web' | 'android' | 'ios' {
  const p = Capacitor.getPlatform();
  if (p === 'android') return 'android';
  if (p === 'ios') return 'ios';
  return 'web';
}