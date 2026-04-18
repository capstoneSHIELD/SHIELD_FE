import { Card } from '@/components/ui';

export function AdminProfilePage() {
  return (
    <div className="space-y-4">
      <Card padding="md">
        <h2 className="text-lg font-semibold text-gray-900">관리자 프로필</h2>
        <p className="mt-2 text-sm text-gray-500">
          프로필 관리 페이지입니다.
        </p>
      </Card>
    </div>
  );
}
