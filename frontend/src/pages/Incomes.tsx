import { useState, useEffect } from 'react';
import { incomesApi, incomeSourcesApi } from '../api/client';
import type { Income, IncomeSource, PaginatedResponse } from '../types';

const formatMinor = (minor: number) => (minor / 100).toLocaleString('ru-RU');
const toMinor = (major: number) => Math.round(major * 100);

const inputClass = "w-full px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white placeholder-[#585b70] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200";

const Incomes = () => {
  const [data, setData] = useState<PaginatedResponse<Income>>({ items: [], page: 1, limit: 20, total: 0 });
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    sourceId: '', amount: '', receivedAt: new Date().toISOString().split('T')[0],
    note: '', isRecurring: false, recurrence: 'monthly' as 'monthly' | 'yearly',
  });

  const loadIncomes = async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (from) params.from = from;
      if (to) params.to = to;
      if (sourceId) params.sourceId = Number(sourceId);
      const res = await incomesApi.getAll(params);
      setData(res.data);
    } catch { setError('Ошибка загрузки доходов'); } finally { setLoading(false); }
  };

  const loadSources = async () => {
    try { const res = await incomeSourcesApi.getAll(); setSources(res.data); } catch {}
  };

  useEffect(() => { loadSources(); }, []);
  useEffect(() => { loadIncomes(); }, [page, from, to, sourceId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить доход?')) return;
    try {
      await incomesApi.delete(id);
      setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id), total: prev.total - 1 }));
    } catch { alert('Ошибка удаления'); }
  };

  const openEdit = (income: Income) => {
    setEditingId(income.id);
    setForm({
      sourceId: income.sourceId?.toString() || '', amount: (income.amountMinor / 100).toString(),
      receivedAt: income.receivedAt, note: income.note || '',
      isRecurring: income.isRecurring, recurrence: income.recurrence || 'monthly',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sourceId: form.sourceId ? Number(form.sourceId) : null,
      amountMinor: toMinor(parseFloat(form.amount)),
      receivedAt: form.receivedAt, note: form.note || undefined,
      isRecurring: form.isRecurring, recurrence: form.isRecurring ? form.recurrence : null,
    };
    try {
      if (editingId !== null) {
        const res = await incomesApi.update(editingId, payload);
        setData((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === editingId ? res.data : i)) }));
      } else {
        const res = await incomesApi.create(payload as any);
        setData((prev) => ({ ...prev, items: [res.data, ...prev.items], total: prev.total + 1 }));
      }
      setShowForm(false); setEditingId(null);
      setForm({ sourceId: '', amount: '', receivedAt: new Date().toISOString().split('T')[0], note: '', isRecurring: false, recurrence: 'monthly' });
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка сохранения'); }
  };

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Доходы</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          {showForm ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        <select value={sourceId} onChange={(e) => { setSourceId(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200">
          <option value="">Все источники</option>
          {sources.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-white/5 p-6 mb-6 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Источник</label>
              <select value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.target.value })} className={inputClass}>
                <option value="">Без источника</option>
                {sources.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Сумма (UZS)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Дата</label>
              <input type="date" value={form.receivedAt} onChange={(e) => setForm({ ...form, receivedAt: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Заметка</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Необязательно" className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm text-[#bac2de] cursor-pointer">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-surface-light text-primary focus:ring-primary/50" />
              Повторяющийся
            </label>
            {form.isRecurring && (
              <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value as 'monthly' | 'yearly' })}
                className="px-3 py-1.5 bg-surface-light rounded-lg border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200">
                <option value="monthly">Ежемесячно</option>
                <option value="yearly">Ежегодно</option>
              </select>
            )}
          </div>
          <div className="mt-4">
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              {editingId ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-4 animate-scale-in">{error}</div>}
      {loading && <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Источник</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Сумма</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Заметка</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Повт.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#6c7086] uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.items.map((income, idx) => (
              <tr key={income.id}
                className="hover:bg-white/[0.02] transition-colors duration-150"
                style={{ animation: `fade-in 0.3s ease-out ${idx * 30}ms both` }}>
                <td className="px-4 py-3 text-sm text-[#bac2de]">{income.receivedAt}</td>
                <td className="px-4 py-3 text-sm text-white">{sources.find((s) => s.id === income.sourceId)?.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-success font-medium">{formatMinor(income.amountMinor)} {income.currency}</td>
                <td className="px-4 py-3 text-sm text-[#a6adc8]">{income.note || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  {income.isRecurring && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light text-xs">
                      {income.recurrence === 'monthly' ? 'ежемесячно' : 'ежегодно'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(income)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#a6adc8] hover:text-white transition-all duration-200 cursor-pointer">✏️</button>
                  <button onClick={() => handleDelete(income.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-[#a6adc8] hover:text-danger transition-all duration-200 cursor-pointer">🗑</button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#6c7086]">Нет доходов</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl bg-surface border border-white/5 text-sm text-[#a6adc8] hover:text-white hover:bg-surface-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
            Назад
          </button>
          <span className="px-4 py-2 text-sm text-[#6c7086]">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl bg-surface border border-white/5 text-sm text-[#a6adc8] hover:text-white hover:bg-surface-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default Incomes;
