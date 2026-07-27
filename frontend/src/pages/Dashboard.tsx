import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { summaryApi } from '../api/client';
import type { SummaryResponse, SummaryByCategoryItem, SummaryBySourceItem, RecurringResponse } from '../types';

const COLORS = ['#6366f1', '#22d3ee', '#22c55e', '#eab308', '#f97316', '#ec4899'];

const formatMinor = (minor: number) => (minor / 100).toLocaleString('ru-RU');

const Dashboard = () => {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [byCategory, setByCategory] = useState<SummaryByCategoryItem[]>([]);
  const [bySource, setBySource] = useState<SummaryBySourceItem[]>([]);
  const [recurring, setRecurring] = useState<RecurringResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (selectedMonth: string) => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, categoryRes, sourceRes, recurringRes] = await Promise.all([
        summaryApi.getSummary(selectedMonth),
        summaryApi.getByCategory(selectedMonth),
        summaryApi.getBySource(selectedMonth),
        summaryApi.getRecurring(),
      ]);
      setSummary(summaryRes.data);
      setByCategory(categoryRes.data.items);
      setBySource(sourceRes.data.items);
      setRecurring(recurringRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(month); }, [month]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 bg-surface rounded-xl border border-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-6 animate-scale-in">
          {error}
        </div>
      )}

      {!loading && summary && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl border border-white/5 p-6 hover:border-success/20 transition-all duration-300 group">
              <div className="text-sm text-[#a6adc8] mb-1">Доход</div>
              <div className="text-2xl font-bold text-success group-hover:scale-105 transition-transform duration-300">
                {formatMinor(summary.totalIncomeMinor)} <span className="text-sm font-normal text-[#6c7086]">{summary.currency}</span>
              </div>
            </div>
            <div className="bg-surface rounded-2xl border border-white/5 p-6 hover:border-danger/20 transition-all duration-300 group">
              <div className="text-sm text-[#a6adc8] mb-1">Расход</div>
              <div className="text-2xl font-bold text-danger group-hover:scale-105 transition-transform duration-300">
                {formatMinor(summary.totalExpenseMinor)} <span className="text-sm font-normal text-[#6c7086]">{summary.currency}</span>
              </div>
            </div>
            <div className="bg-surface rounded-2xl border border-white/5 p-6 hover:border-primary/20 transition-all duration-300 group">
              <div className="text-sm text-[#a6adc8] mb-1">Баланс</div>
              <div className={`text-2xl font-bold group-hover:scale-105 transition-transform duration-300 ${summary.balanceMinor >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatMinor(summary.balanceMinor)} <span className="text-sm font-normal text-[#6c7086]">{summary.currency}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Расходы по категориям</h3>
              {byCategory.length === 0 ? (
                <p className="text-[#6c7086] text-center py-10">Нет данных</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="totalMinor"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, payload }: any) => `${name}: ${formatMinor(Number(payload.totalMinor))}`}
                    >
                      {byCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#272738', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#cdd6f4' }}
                      formatter={(value) => formatMinor(Number(value))}
                    />
                    <Legend wrapperStyle={{ color: '#a6adc8' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-surface rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Доходы по источникам</h3>
              {bySource.length === 0 ? (
                <p className="text-[#6c7086] text-center py-10">Нет данных</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bySource.map((item) => ({ ...item, name: item.name || 'Без источника' }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#a6adc8', fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => formatMinor(value)} tick={{ fill: '#a6adc8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#272738', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#cdd6f4' }}
                      formatter={(value) => formatMinor(Number(value))}
                    />
                    <Legend wrapperStyle={{ color: '#a6adc8' }} />
                    <Bar dataKey="totalMinor" fill="#6366f1" name="Сумма" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {recurring && recurring.items.length > 0 && (
            <div className="bg-surface rounded-2xl border border-white/5 p-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-white mb-2">Постоянные расходы в месяц</h3>
              <p className="text-sm text-[#a6adc8] mb-4">
                Всего: <span className="text-accent font-semibold">{formatMinor(recurring.monthlyExpenseMinor)}</span>
              </p>
              <div className="space-y-2">
                {recurring.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3 bg-surface-light rounded-xl hover:bg-surface-lighter transition-colors duration-200"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-[#bac2de]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{formatMinor(item.amountMinor)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                        {item.recurrence === 'monthly' ? 'ежемесячно' : 'ежегодно'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
