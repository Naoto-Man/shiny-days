'use client';

import { useEffect, useState } from 'react';
import { Btn, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { getDefaultMessagesForPeriod, PERIOD_LABELS, PERIOD_ORDER } from '@/lib/praise';
import {
  addPraiseMessage,
  deletePraiseMessage,
  fetchPraiseMessages,
  fetchPraiseSettings,
  savePraiseSettings,
} from '@/lib/praiseMessages';

export default function PraiseMessageEditor({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [useDefaultPraise, setUseDefaultPraise] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newTexts, setNewTexts] = useState({ morning: '', afternoon: '', evening: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const supabase = createClient();
    const [data, settings] = await Promise.all([
      fetchPraiseMessages(supabase),
      fetchPraiseSettings(supabase),
    ]);
    setMessages(data);
    setUseDefaultPraise(settings.use_default_praise);
    setLoading(false);
  }

  async function handleToggleDefaults(checked) {
    setUseDefaultPraise(checked);
    setSaving(true);
    setError('');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('ログインが必要です');
      setUseDefaultPraise(!checked);
      setSaving(false);
      return;
    }
    const { error: saveError } = await savePraiseSettings(supabase, user.id, checked);
    if (saveError) {
      setError(saveError.message);
      setUseDefaultPraise(!checked);
    }
    setSaving(false);
  }

  async function handleAdd(period) {
    const text = newTexts[period].trim();
    if (!text) return;
    setSaving(true);
    setError('');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('ログインが必要です');
      setSaving(false);
      return;
    }
    const { error: insertError } = await addPraiseMessage(supabase, user.id, period, text);
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setNewTexts((prev) => ({ ...prev, [period]: '' }));
    await loadAll();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('このメッセージを削除しますか？')) return;
    setSaving(true);
    setError('');
    const supabase = createClient();
    const { error: deleteError } = await deletePraiseMessage(supabase, id);
    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }
    await loadAll();
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-t-2xl bg-white px-5 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">メッセージの編集</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#888]">
          時間帯ごとにメッセージを追加できます。初期メッセージのオン／オフも選べます。
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-[#888]">読み込み中…</p>
        ) : (
          <>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[#e8ebf2] bg-[#fafbfc] p-3.5">
              <input
                type="checkbox"
                checked={useDefaultPraise}
                onChange={(e) => handleToggleDefaults(e.target.checked)}
                disabled={saving}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#4f6ef7]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#333]">
                  初期メッセージもログイン時に選ばれる
                </p>
                <p className="mt-0.5 text-xs text-[#888]">
                  オフにすると、自分で追加したメッセージだけが表示されます
                </p>
              </div>
            </label>

            <div className="mt-4 space-y-5">
              {PERIOD_ORDER.map((period) => {
                const periodMessages = messages.filter((m) => m.period === period);
                const defaultMessages = getDefaultMessagesForPeriod(period);
                return (
                  <div key={period}>
                    <h3 className="mb-2 text-[13px] font-semibold text-[#555]">
                      {PERIOD_LABELS[period]}
                    </h3>
                    <ul className="mb-2 rounded-lg border border-[#e8ebf2] bg-[#fafbfc]">
                      {defaultMessages.map((msg, i) => (
                        <li
                          key={`default-${period}-${i}`}
                          className={`flex items-start gap-2 px-3 py-2.5 ${
                            i > 0 ? 'border-t border-[#eef1f8]' : ''
                          } ${!useDefaultPraise ? 'opacity-50' : ''}`}
                        >
                          <span className="mt-0.5 shrink-0 rounded bg-[#eef1ff] px-1.5 py-0.5 text-[10px] font-bold text-[#4f6ef7]">
                            初期
                          </span>
                          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[#333]">
                            {msg}
                          </p>
                        </li>
                      ))}
                      {periodMessages.map((m, i) => (
                        <li
                          key={m.id}
                          className={`flex items-start justify-between gap-2 px-3 py-2.5 border-t border-[#eef1f8]`}
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded bg-[#fff9e6] px-1.5 py-0.5 text-[10px] font-bold text-[#7a6200]">
                              自分
                            </span>
                            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[#333]">
                              {m.message}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            disabled={saving}
                            className="shrink-0 text-xs font-semibold text-red-600"
                          >
                            削除
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Input
                        value={newTexts[period]}
                        onChange={(e) =>
                          setNewTexts((prev) => ({ ...prev, [period]: e.target.value }))
                        }
                        placeholder="新しいメッセージ"
                        className="!mb-0 flex-1"
                      />
                      <Btn
                        type="button"
                        variant="secondary"
                        className="!w-auto shrink-0 whitespace-nowrap !px-3 !py-2 !text-[13px]"
                        onClick={() => handleAdd(period)}
                        disabled={saving || !newTexts[period].trim()}
                      >
                        追加
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Btn className="mt-4" onClick={onClose}>
          閉じる
        </Btn>
      </div>
    </div>
  );
}
