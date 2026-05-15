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

import logoImg from '@/assets/figma/login/logo.png';
import kakaoIcon from '@/assets/figma/login/kakao-icon.svg';
import naverIcon from '@/assets/figma/login/naver-icon.svg';
import googleIcon from '@/assets/figma/login/google-icon.png';

interface SocialButtonProps {
  className?: string;
  icon: ReactNode;
  label: string;
  labelColor?: string;
  onClick: () => void;
}

function SocialButton({ className, icon, label, labelColor, onClick }: SocialButtonProps) {
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
      <span style={labelColor ? { color: labelColor } : undefined}>{label}</span>
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
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[390px] flex-1 flex-col overflow-hidden bg-white">
      {/* Background blur halo — figma 01 (top:-80, right:-80, size 256, blur 64px) */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/5 blur-3xl"
      />

      <div className="relative z-10 flex flex-1 flex-col px-[25px]">
        {/* Hero */}
        <section className="flex flex-col items-center pt-[140px] text-center">
          <p className="mb-5 text-[9px] font-bold leading-7 tracking-[-0.5px] text-[#16181d]">
            더 스마트한 법률 파트너
          </p>
          <img
            src={logoImg}
            alt="SHIELD"
            className="h-[71px] w-[71px] rounded-[13px] object-cover"
          />
          <h1 className="mt-[18px] font-['Russo_One'] text-[35px] leading-[26px] tracking-[-0.5px] text-[#3688f4]">
            SHIELD
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-text-soft">
            AI 법률 정보 구조화 플랫폼
          </p>
        </section>

        {/* Social buttons */}
        <section className="relative mt-auto pb-[67px]">
          <div className="flex flex-col gap-3">
            <SocialButton
              label="카카오로 시작하기"
              icon={<img src={kakaoIcon} alt="" className="block h-[15px] w-[17px]" />}
              onClick={loginWithKakao}
              className="bg-[#fee500] hover:brightness-95"
              labelColor="#191919"
            />
            <SocialButton
              label="네이버로 시작하기"
              icon={<img src={naverIcon} alt="" className="block h-[15px] w-[14px]" />}
              onClick={loginWithNaver}
              className="bg-[#03c75a] text-white hover:brightness-95"
            />
            <div className="relative">
      
              <SocialButton
                label="Google 계정으로 시작하기"
                icon={
                  <img src={googleIcon} alt="" className="block h-[25px] w-[25px] object-cover" />
                }
                onClick={loginWithGoogle}
                className="border border-[#e0e2e6] bg-white text-[#16181d] hover:bg-gray-50"
              />
            </div>
          </div>

          <p className="mt-[30px] text-center text-[10px] leading-[18px] text-text-soft">
            로그인 시 SHIELD의{' '}
            <a href="/terms" className="font-medium underline underline-offset-2">
              이용약관
            </a>{' '}
            및{' '}
            <a href="/privacy" className="font-medium underline underline-offset-2">
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
