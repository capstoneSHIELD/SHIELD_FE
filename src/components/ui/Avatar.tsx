import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AvatarProps {
  /** 프로필 이미지 URL. null/undefined 면 fallback 표시. */
  url?: string | null;
  /** Fallback 이니셜 생성용 이름. */
  name?: string | null;
  /** 정사각 픽셀 크기. 32 / 48 / 96 등. */
  size?: number;
  /** ARIA 라벨 (기본: 이름). */
  alt?: string;
  className?: string;
}

/**
 * 8가지 SHIELD 톤 색 — 이름 해시로 결정해 안정적인 동일 매핑.
 * 톤은 brand(#1f8cf9) 근방 navy/blue 계열로 한정.
 */
const FALLBACK_PALETTE = [
  '#1a6de0',
  '#1f8cf9',
  '#0c447c',
  '#3b6bb5',
  '#5a82c4',
  '#2563eb',
  '#1e40af',
  '#1d4ed8',
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function bgFromName(name: string): string {
  return FALLBACK_PALETTE[hashName(name) % FALLBACK_PALETTE.length]!;
}

export function Avatar({ url, name, size = 48, alt, className }: AvatarProps) {
  // url 이 바뀌면 imgFailed 초기화 (이전 이미지의 404 가 새 url 에 영향 주지 않게)
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgFailed(false);
  }, [url]);

  const showImage = !!url && !imgFailed;
  const initial = (name ?? '').trim().charAt(0).toUpperCase();
  const fontSize = Math.max(12, Math.round(size * 0.4));

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={alt ?? name ?? '프로필'}
    >
      {showImage ? (
        <img
          src={url!}
          alt={alt ?? name ?? '프로필'}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : initial ? (
        <div
          className="flex h-full w-full items-center justify-center font-medium text-white"
          style={{ background: bgFromName(name ?? '?'), fontSize }}
          aria-hidden="true"
        >
          {initial}
        </div>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gray-100"
          aria-hidden="true"
        >
          <User
            size={Math.round(size * 0.5)}
            className="text-gray-400"
            strokeWidth={1.75}
          />
        </div>
      )}
    </div>
  );
}
