import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

/**
 * 이용약관 페이지 (정적 컨텐츠).
 *
 * 본문은 컴포넌트 내 상수로 유지하여 추후 .md / CMS 분리 마이그레이션이 쉽도록 함.
 * 변호사법 면책·법률 자문 미제공 조항을 명시한다.
 */

const TERMS_SECTIONS: { title: string; body: string }[] = [
  {
    title: '제1조 (목적)',
    body: '본 약관은 팀 SHIELD(이하 "회사")가 제공하는 "AI 기반 법률 상담 구조화 및 변호사 탐색 지원 플랫폼" SHIELD(이하 "서비스")의 이용과 관련하여 회사와 회원의 권리, 의무, 책임 사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (정의)',
    body: '① "회원"이란 본 약관에 동의하고 회원가입을 완료한 일반 사용자 및 변호사 회원을 말합니다.\n② "의뢰서"란 회원이 입력한 상담 내용을 AI 가 자동으로 구조화하여 생성한 문서를 말합니다.\n③ "변호사 회원"이란 관리자의 자격 검증을 거쳐 시스템 내 탐색·전달 대상에 포함된 회원을 말합니다.',
  },
  {
    title: '제3조 (서비스의 성격 — 법률 자문 미제공)',
    body: '① 본 서비스는 일반 정보 제공 수준의 법률 정보 구조화 및 변호사 탐색 지원에 한정되며, 법률 자문을 제공하지 않습니다.\n② 본 서비스의 AI 분석 결과는 참고 정보일 뿐이며, 회원의 구체적 사건에 대한 법률 자문을 대체하지 않습니다.\n③ 회사는 특정 변호사를 추천하거나 회원과 변호사를 직접 연결하지 않으며, 알선 행위를 수행하지 않습니다.',
  },
  {
    title: '제4조 (서비스의 제공 및 변경)',
    body: '① 회사는 회원에게 다음과 같은 서비스를 제공합니다.\n  1. 자연어 기반 법률 상담 입력 및 AI 분석\n  2. 사건 요약·쟁점·키워드 자동 구조화\n  3. 의뢰서 자동 생성 및 변호사 탐색 지원\n  4. 변호사에 대한 의뢰서 전달 및 상태 추적\n② 회사는 운영상·기술상 필요한 경우 서비스의 전부 또는 일부를 변경할 수 있습니다.',
  },
  {
    title: '제5조 (회원의 의무)',
    body: '① 회원은 본 약관 및 관련 법령을 준수해야 합니다.\n② 회원은 타인의 개인정보를 도용하거나, 허위 정보를 입력해서는 안 됩니다.\n③ 변호사 회원은 자격 정보를 사실대로 등록해야 하며, 자격 변경 시 즉시 갱신해야 합니다.\n④ 회원은 서비스를 통해 얻은 정보를 상업적 목적으로 무단 활용해서는 안 됩니다.',
  },
  {
    title: '제6조 (계정의 일시 잠금)',
    body: '회원이 로그인 시 5회 연속 실패하는 경우, 계정 보안을 위해 회사는 해당 계정을 일시 잠금 처리할 수 있습니다.',
  },
  {
    title: '제7조 (의뢰서의 공개 및 전달)',
    body: '회원이 확정한 의뢰서는 전체공개 정책에 따라 회원이 선택한 변호사에게 전달됩니다. 회원은 의뢰서 확정 시 본인의 개인정보가 변호사에게 공개됨을 명시적으로 동의해야 합니다.',
  },
  {
    title: '제8조 (서비스의 중단)',
    body: '회사는 서비스 점검, 시스템 장애, 불가항력적 사유로 서비스 제공이 어려운 경우 사전 공지 후 서비스를 일시 중단할 수 있습니다.',
  },
  {
    title: '제9조 (책임의 제한)',
    body: '① 회사는 AI 분석 결과의 정확성·완전성을 보장하지 않으며, 회원이 AI 분석 결과를 신뢰하여 발생한 손해에 대해 책임지지 않습니다.\n② 회사는 변호사 회원과 일반 회원 간 분쟁에 대해 당사자가 아니며, 분쟁의 결과에 대해 책임지지 않습니다.\n③ 회사는 회원의 귀책사유로 발생한 손해에 대해 책임지지 않습니다.',
  },
  {
    title: '제10조 (준거법 및 분쟁 해결)',
    body: '본 약관은 대한민국 법률에 따라 해석되며, 회사와 회원 간 분쟁은 민사소송법상의 관할 법원에서 해결합니다.',
  },
];

const EFFECTIVE_DATE = '2026년 5월 13일';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1">
      <Header title="이용약관" showBack onBack={() => navigate(-1)} />

      <main className="flex-1 px-5 py-6 pb-10 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-6">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-6">
          {TERMS_SECTIONS.map((section) => (
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
          본 약관은 시행일부터 적용되며, 변경 시 사전 공지합니다.
        </p>
      </main>
    </div>
  );
}
