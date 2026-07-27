import { useState, useEffect } from 'react';
import { incomeSourcesApi } from '../api/client';
import type { IncomeSource } from '../types';

const inputClass = "w-full px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white placeholder-[#585b70] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200";

const IncomeSources = () => {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'salary' | 'freelance' | 'other'>('salary');

  const loadSources = async () => {
    try { const res = await incomeSourcesApi.getAll(); setSources(res.data); } catch { setError('Ошибка загрузки источников'); } finally { setLoading(false); }
  };

  useEffect(() => { loadSources(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить источник?')) return;
    try { await incomeSourcesApi.delete(id); setSources(sources.filter((s) => s.id !== id)); } catch { alert('Ошибка при удалении'); }
  };

  const openEdit = (source: IncomeSource) => {
    setEditingId(source.id); setName(source.name); setType(source.type); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await incomeSourcesApi.update(editingId, { name, type });
        setSources(sources.map((s) => (s.id === editingId ? res.data : s)));
      } else {
        const res = await incomeSourcesApi.create({ name, type });
        setSources([...sources, res.data]);
      }
      setShowForm(false); setEditingId(null); setName(''); setType('salary');
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка сохранения'); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Источники дохода</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setName(''); setType('salary'); }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          {showForm ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-4 animate-scale-in">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-white/5 p-6 mb-6 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Название</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Например: Зарплата в IT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#bac2de] mb-1.5">Тип</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)}
                className="px-4 py-2.5 bg-surface-light rounded-xl border border-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 w-full">
                <option value="salary">Зарплата</option>
                <option value="freelance">Фриланс</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              {editingId ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sources.map((source, idx) => (
          <div
            key={source.id}
            className="bg-surface rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all duration-300 group"
            style={{ animation: `slide-up 0.3s ease-out ${idx * 50}ms both` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                {source.type === 'salary' ? '💼' : source.type === 'freelance' ? '💻' : '📌'}
              </div>
              <div>
                <div className="text-white font-medium">{source.name}</div>
                <div className="text-xs text-[#6c7086] mt-0.5">
                  {source.type === 'salary' ? 'Зарплата' : source.type === 'freelance' ? 'Фриланс' : 'Другое'}
                  {!source.isActive && <span className="ml-2 text-warning">(неактивен)</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={() => openEdit(source)}
                className="p-2 rounded-lg hover:bg-white/5 text-[#a6adc8] hover:text-white transition-all duration-200 cursor-pointer">
                ✏️
              </button>
              <button onClick={() => handleDelete(source.id)}
                className="p-2 rounded-lg hover:bg-danger/10 text-[#a6adc8] hover:text-danger transition-all duration-200 cursor-pointer">
                🗑
              </button>
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <div className="text-center py-16 text-[#6c7086] animate-fade-in">
            <div className="text-4xl mb-4">🏦</div>
            <p>Нет источников дохода</p>
            <p className="text-sm mt-1">Добавьте первый источник, чтобы начать</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeSources;
