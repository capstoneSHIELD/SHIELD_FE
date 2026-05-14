import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getRoleHome } from '@/lib/authFlow';
import { loginWithKakao } from '@/lib/kakao';
import { loginWithNaver } from '@/lib/naver';
import { loginWithGoogle } from '@/lib/google';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/authApi';
import type { UserRole } from '@/types';

function KakaoIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3.5C6.753 3.5 2.5 6.84 2.5 10.96c0 2.6 1.706 4.888 4.286 6.225l-1.01 3.69a.44.44 0 0 0 .666.49l4.38-2.907c.39.05.78.082 1.178.082 5.247 0 9.5-3.34 9.5-7.46S17.247 3.5 12 3.5Z"
        fill="#000000"
      />
    </svg>
  );
}

function GoogleIcon({ size = 25 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

interface SocialButtonProps {
  className?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function SocialButton({ className, icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex h-14 w-full items-center justify-center rounded-[14px]',
        'text-base font-semibold leading-6 transition duration-150',
        'shadow-[0px_2px_4px_0px_rgba(35,37,41,0.06)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
        'active:scale-[0.99]',
        className,
      )}
    >
      <span className="absolute left-[58px] flex h-6 w-6 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const DEV_ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: 'USER', label: '의뢰인', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { role: 'LAWYER', label: '변호사', color: 'bg-violet-500 hover:bg-violet-600' },
  { role: 'ADMIN', label: '관리자', color: 'bg-rose-500 hover:bg-rose-600' },
];

export function LoginPage() {
  const { isAuthenticated, role, login } = useAuthStore();
  const [devOpen, setDevOpen] = useState(false);
  const [devLoading, setDevLoading] = useState<UserRole | null>(null);

  async function handleDevLogin(devRole: UserRole) {
    setDevLoading(devRole);
    try {
      const { data } = await authApi.devLogin({
        email: `dev-${devRole.toLowerCase()}@shield.dev`,
        name: `Dev ${devRole}`,
        role: devRole,
      });
      const { accessToken } = data.data;
      await login(accessToken);
    } catch (err) {
      console.error('Dev login failed:', err);
    } finally {
      setDevLoading(null);
    }
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-1 flex-col overflow-hidden bg-white">
      <div className="relative flex min-h-dvh flex-1 flex-col px-[25px]">
        <div className="absolute -top-20 right-[-80px] h-64 w-64 rounded-full bg-[#1E90FF]" />

        <section className="relative z-10 flex flex-col items-center pt-[180px] text-center">
          <p className="mb-[20px] text-[9px] font-bold leading-7 tracking-normal text-black">
            더 스마트한 법률 파트너
          </p>
          <img
            src="/logo.png"
            alt="SHIELD"
            className="h-[71px] w-[71px] rounded-[13px] object-contain"
          />
          <h1 className="mt-[18px] font-['Russo_One'] text-[35px] font-normal leading-[26px] tracking-normal text-[#1E90FF]">
            SHIELD
          </h1>
          <p className="mt-[8px] text-sm font-medium leading-6 tracking-normal text-[#696969]">
            AI 법률 정보 구조화 플랫폼
          </p>
        </section>

        <section className="relative z-10 mt-auto pb-[67px]">
          <div className="flex flex-col gap-3">
            <SocialButton
              label="카카오로 시작하기"
              icon={<KakaoIcon />}
              onClick={loginWithKakao}
              className="bg-[#FFD700] text-black hover:brightness-95"
            />
            <SocialButton
              label="네이버로 시작하기"
              icon={<span className="text-[15px] font-black leading-none text-white">N</span>}
              onClick={loginWithNaver}
              className="bg-[#32CD32] text-white hover:brightness-95"
            />
            <SocialButton
              label="Google 계정으로 시작하기"
              icon={<GoogleIcon />}
              onClick={loginWithGoogle}
              className="border border-[#e0e2e6] bg-white text-black hover:bg-gray-50"
            />
          </div>

          <p className="mt-[30px] text-center text-[10px] leading-[18px] text-[#696969]">
            로그인 시 SHIELD의{' '}
            <a href="/terms" className="underline underline-offset-2">
              이용약관
            </a>{' '}
            및{' '}
            <a href="/privacy" className="underline underline-offset-2">
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주합니다.
          </p>

          {import.meta.env.DEV && (
            <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setDevOpen(!devOpen)}
                className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                <Terminal size={12} />
                <span>Dev Login</span>
                {devOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {devOpen && (
                <div className="mt-3 flex gap-2">
                  {DEV_ROLES.map(({ role: devRole, label, color }) => (
                    <button
                      key={devRole}
                      type="button"
                      disabled={devLoading !== null}
                      onClick={() => handleDevLogin(devRole)}
                      className={cn(
                        'flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all',
                        color,
                        devLoading === devRole && 'animate-pulse opacity-60',
                        devLoading !== null && devLoading !== devRole && 'opacity-40',
                      )}
                    >
                      {devLoading === devRole ? '...' : label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
