'use client';

import { Label } from '@/components/ui';
import { SCHEDULE_COLORS } from '@/components/scheduleColors';

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="mb-4">
      <Label>色（任意）</Label>
      <p className="-mt-1 mb-2 text-xs text-[#888]">未選択の場合は自動で色が割り当てられます</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`flex h-9 min-w-[52px] items-center justify-center rounded-lg border-2 px-2 text-[11px] font-semibold ${
            value == null
              ? 'border-[#4f6ef7] bg-[#eef1ff] text-[#4f6ef7]'
              : 'border-[#e8ebf2] bg-white text-[#888]'
          }`}
        >
          自動
        </button>
        {SCHEDULE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-9 w-9 rounded-lg border-2 ${
              value === c ? 'border-[#333] ring-2 ring-[#333]/20' : 'border-transparent'
            }`}
            style={{ background: c }}
            aria-label={`色を選択`}
          />
        ))}
      </div>
    </div>
  );
}
