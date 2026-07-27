import { useState, useEffect } from 'react';
import { expensesApi, categoriesApi } from '../api/client';
import type { Expense, Category, PaginatedResponse } from '../types';

const formatMinor = (minor: number) => (minor / 100).toLocaleString('ru-RU');
const toMinor = (major: number) => Math.round(major * 100);

const inputClass = "w-full px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white placeholder-[#585b70] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200";

const Expenses = () => {
  const [data, setData] = useState<PaginatedResponse<Expense>>({ items: [], page: 1, limit: 20, total: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryKind, setNewCategoryKind] = useState('other');
  const [form, setForm] = useState({
    categoryId: '', amount: '', spentAt: new Date().toISOString().split('T')[0],
    description: '', isRecurring: false, recurrence: 'monthly' as 'monthly' | 'yearly',
  });

  const loadExpenses = async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (from) params.from = from;
      if (to) params.to = to;
      if (categoryId) params.categoryId = Number(categoryId);
      const res = await expensesApi.getAll(params);
      setData(res.data);
    } catch { setError('Ошибка загрузки расходов'); } finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { const res = await categoriesApi.getAll(); setCategories(res.data); } catch (err) { console.error('Error loading categories:', err); }
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadExpenses(); }, [page, from, to, categoryId]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await categoriesApi.create({ name: newCategoryName, kind: newCategoryKind });
      setCategories([...categories, res.data]);
      setNewCategoryName('');
      setShowCategoryForm(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка создания категории'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить расход?')) return;
    try {
      await expensesApi.delete(id);
      setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id), total: prev.total - 1 }));
    } catch { alert('Ошибка удаления'); }
  };

  const openEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      categoryId: expense.categoryId.toString(), amount: (expense.amountMinor / 100).toString(),
      spentAt: expense.spentAt, description: expense.description || '',
      isRecurring: expense.isRecurring, recurrence: expense.recurrence || 'monthly',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { alert('Выберите категорию'); return; }
    const payload = {
      categoryId: Number(form.categoryId),
      amountMinor: toMinor(parseFloat(form.amount)),
      spentAt: form.spentAt, description: form.description || undefined,
      isRecurring: form.isRecurring, recurrence: form.isRecurring ? form.recurrence : null,
    };
    try {
      if (editingId !== null) {
        const res = await expensesApi.update(editingId, payload);
        setData((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === editingId ? res.data : i)) }));
      } else {
        const res = await expensesApi.create(payload as any);
        setData((prev) => ({ ...prev, items: [res.data, ...prev.items], total: prev.total + 1 }));
      }
      setShowForm(false); setEditingId(null);
      setForm({ categoryId: '', amount: '', spentAt: new Date().toISOString().split('T')[0], description: '', isRecurring: false, recurrence: 'monthly' });
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка сохранения'); }
  };

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Расходы</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="px-4 py-2 rounded-xl bg-surface border border-white/5 text-[#a6adc8] text-sm font-medium hover:text-white hover:bg-surface-light transition-all duration-200 cursor-pointer"
          >
            {showCategoryForm ? 'Отмена' : '+ Категория'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            {showForm ? 'Отмена' : '+ Расход'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200" />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200">
          <option value="">Все категории</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      {showCategoryForm && (
        <form onSubmit={handleAddCategory} className="bg-surface rounded-2xl border border-white/5 p-6 mb-6 animate-scale-in">
          <h3 className="text-sm font-medium text-[#bac2de] mb-3">Новая категория</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-[#6c7086] mb-1">Название</label>
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#6c7086] mb-1">Тип</label>
              <select value={newCategoryKind} onChange={(e) => setNewCategoryKind(e.target.value)}
                className="px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200">
                <option value="subscription">Подписки</option>
                <option value="utility">Коммуналка</option>
                <option value="groceries">Продукты</option>
                <option value="rent">Аренда</option>
                <option value="other">Прочее</option>
              </select>
            </div>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-[#06b6d4] text-white text-sm font-medium hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Создать
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-white/5 p-6 mb-6 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Категория</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className={inputClass}>
                <option value="">Выберите...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Сумма (UZS)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Дата</label>
              <input type="date" value={form.spentAt} onChange={(e) => setForm({ ...form, spentAt: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Описание</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Необязательно" className={inputClass} />
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

      {categories.length === 0 && !loading && (
        <div className="text-center py-8 text-[#6c7086]">
          Нет категорий.{' '}
          <button onClick={() => setShowCategoryForm(true)} className="text-primary-light hover:text-primary transition-colors duration-200 cursor-pointer">Создать категорию</button>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Сумма</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Описание</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086] uppercase tracking-wider">Повт.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#6c7086] uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.items.map((expense, idx) => {
              const category = categories.find((c) => c.id === expense.categoryId);
              return (
                <tr key={expense.id}
                  className="hover:bg-white/[0.02] transition-colors duration-150"
                  style={{ animation: `fade-in 0.3s ease-out ${idx * 30}ms both` }}>
                  <td className="px-4 py-3 text-sm text-[#bac2de]">{expense.spentAt}</td>
                  <td className="px-4 py-3 text-sm text-white">
                    {category ? (
                      <span className="inline-flex items-center gap-1.5">
                        {category.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />}
                        {category.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-danger font-medium">{formatMinor(expense.amountMinor)} {expense.currency}</td>
                  <td className="px-4 py-3 text-sm text-[#a6adc8]">{expense.description || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {expense.isRecurring && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light text-xs">
                        {expense.recurrence === 'monthly' ? 'ежемесячно' : 'ежегодно'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(expense)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#a6adc8] hover:text-white transition-all duration-200 cursor-pointer">✏️</button>
                    <button onClick={() => handleDelete(expense.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-[#a6adc8] hover:text-danger transition-all duration-200 cursor-pointer">🗑</button>
                  </td>
                </tr>
              );
            })}
            {data.items.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#6c7086]">Нет расходов</td></tr>
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

export default Expenses;
