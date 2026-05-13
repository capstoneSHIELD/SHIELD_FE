import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui';
import { getDomainMeta } from '@/lib/domainIcons';

interface ClassifyBadgeProps {
  primaryField: string[];
  tags: string[];
  onEdit?: () => void;
}

export function ClassifyBadge({ primaryField, tags, onEdit }: ClassifyBadgeProps) {
  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-card p-3',
        'flex flex-col gap-2',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
          분류 결과
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="분류 결과 수정"
            className={cn(
              'h-6 w-6 rounded-md flex items-center justify-center',
              'text-blue-500 hover:text-blue-700 hover:bg-blue-100',
              'transition-colors duration-150',
            )}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Primary fields */}
      {primaryField.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {primaryField.map((field) => {
            const meta = getDomainMeta(field);
            return (
              <Badge key={field} variant="primary" size="sm">
                <span className="inline-flex items-center gap-1">
                  <meta.Icon size={12} strokeWidth={2} aria-hidden="true" />
                  {meta.label}
                </span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Tags (소분류·키워드 — 아이콘 없이 라벨만) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
