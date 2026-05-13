import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

/**
 * 개인정보 처리방침 페이지 (정적 컨텐츠).
 *
 * 의뢰서 전체공개 정책, 변호사에게 개인정보 제공 등 SHIELD 특화 항목을 강조한다.
 */

const PRIVACY_SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 개인정보의 수집 항목',
    body: '회사는 다음의 개인정보를 수집합니다.\n\n● 회원가입 시\n  - 일반 사용자: 이메일, 이름, 프로필 이미지, OAuth 식별자 (Google·Naver·Kakao 중 사용자가 선택한 제공자)\n  - 변호사 회원: 위 항목 + 변호사 자격증 번호, 전문 분야, 경력, 자기소개, 자격 검증 서류\n\n● 서비스 이용 시\n  - 상담 입력 내용 (자연어 텍스트)\n  - 의뢰서 내용 (AI 자동 구조화 결과 및 사용자 수정 사항)\n  - 변호사 의뢰서 전달·응답 이력',
  },
  {
    title: '2. 개인정보의 이용 목적',
    body: '회사는 수집한 개인정보를 다음 목적으로 이용합니다.\n  ① 회원 식별 및 인증 (OAuth 기반 로그인)\n  ② AI 분석 및 의뢰서 자동 생성\n  ③ 변호사 매칭 및 의뢰서 전달\n  ④ 변호사 회원의 자격 검증\n  ⑤ 부정 이용 방지 및 보안 (예: 로그인 5회 실패 시 계정 잠금)\n  ⑥ 서비스 운영 통계 및 품질 개선',
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    body: '회원이 회원 탈퇴를 요청하거나 수집·이용 목적이 달성된 경우, 수집된 개인정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
  },
  {
    title: '4. 개인정보의 제3자 제공 (의뢰서 전달)',
    body: '① 회사는 회원이 의뢰서를 확정하고 변호사에게 전달하는 경우, 의뢰서 내용과 의뢰인 개인정보를 회원이 선택한 변호사에게 제공합니다.\n② 의뢰서는 전체공개 정책에 따라 전달되며, 회원은 의뢰서 확정 시 본인의 이름·이메일·연락처·사건 내용이 변호사에게 공개됨을 명시적으로 동의해야 합니다.\n③ 회원이 명시적으로 동의하지 않은 경우, 회사는 회원의 개인정보를 제3자에게 제공하지 않습니다.',
  },
  {
    title: '5. 개인정보의 처리 위탁',
    body: '회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁할 수 있습니다.\n  - AI 분석: Cohere (분류·요약·키워드 추출)\n  - 데이터 저장: Supabase (PostgreSQL 매니지드 서비스)\n  - 인프라: Amazon Web Services (AWS EC2)\n  - 푸시 알림: Firebase Cloud Messaging (Google)\n위탁받은 자가 위탁받은 업무 범위를 초과하여 개인정보를 처리하지 않도록 관리·감독합니다.',
  },
  {
    title: '6. 정보주체의 권리',
    body: '회원은 언제든지 다음 권리를 행사할 수 있습니다.\n  ① 개인정보 열람 요청\n  ② 개인정보 수정 요청\n  ③ 개인정보 삭제 요청 (회원 탈퇴)\n  ④ 처리 정지 요청\n권리 행사는 서비스 내 프로필 메뉴 또는 회사 연락처를 통해 가능합니다.',
  },
  {
    title: '7. 개인정보의 안전성 확보 조치',
    body: '회사는 개인정보 보호를 위해 다음 조치를 시행합니다.\n  - JWT 기반 인증 (Access Token 30분, Refresh Token 14일) + Redis 블랙리스트로 즉시 폐기 지원\n  - OAuth 2.0 인가 코드 흐름 (자체 비밀번호 미보관)\n  - Refresh Token HttpOnly·Secure 쿠키 전달\n  - OAuth state 파라미터로 CSRF 방어\n  - 데이터 전송 구간 HTTPS 암호화',
  },
  {
    title: '8. 개인정보 처리방침의 변경',
    body: '본 방침은 법령·정책·서비스 변경에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.',
  },
];

const EFFECTIVE_DATE = '2026년 5월 13일';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1">
      <Header title="개인정보 처리방침" showBack onBack={() => navigate(-1)} />

      <main className="flex-1 px-5 py-6 pb-10 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-6">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-6">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          본 방침은 시행일부터 적용됩니다.
        </p>
      </main>
    </div>
  );
}
