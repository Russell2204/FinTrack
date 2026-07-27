import client from '../../db/client';
import { getMonthRange } from '../../utils/helpers';

export const getSummary = async (userId: number, month: string) => {
  const { from, to } = getMonthRange(month);

  const incomeResult = await client.execute({
    sql: 'SELECT COALESCE(SUM(amount_minor), 0) as total FROM incomes WHERE user_id = ? AND received_at >= ? AND received_at < ?',
    args: [userId, from, to],
  });
  const totalIncome = Number(incomeResult.rows[0]!['total']);

  const expenseResult = await client.execute({
    sql: 'SELECT COALESCE(SUM(amount_minor), 0) as total FROM expenses WHERE user_id = ? AND spent_at >= ? AND spent_at < ?',
    args: [userId, from, to],
  });
  const totalExpense = Number(expenseResult.rows[0]!['total']);

  return {
    month,
    currency: 'UZS',
    totalIncomeMinor: totalIncome,
    totalExpenseMinor: totalExpense,
    balanceMinor: totalIncome - totalExpense,
  };
};

export const getByCategory = async (userId: number, month: string) => {
  const { from, to } = getMonthRange(month);

  const result = await client.execute({
    sql: `
      SELECT e.category_id, c.name, c.kind, SUM(e.amount_minor) as total
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = ? AND e.spent_at >= ? AND e.spent_at < ?
      GROUP BY e.category_id, c.name, c.kind
      ORDER BY total DESC
    `,
    args: [userId, from, to],
  });

  return {
    month,
    items: result.rows.map((r: Record<string, unknown>) => ({
      categoryId: Number(r['category_id']),
      name: r['name'] as string,
      kind: r['kind'] as string,
      totalMinor: Number(r['total']),
    })),
  };
};

export const getBySource = async (userId: number, month: string) => {
  const { from, to } = getMonthRange(month);

  const result = await client.execute({
    sql: `
      SELECT i.source_id, s.name, SUM(i.amount_minor) as total
      FROM incomes i
      LEFT JOIN income_sources s ON s.id = i.source_id
      WHERE i.user_id = ? AND i.received_at >= ? AND i.received_at < ?
      GROUP BY i.source_id, s.name
      ORDER BY total DESC
    `,
    args: [userId, from, to],
  });

  return {
    month,
    items: result.rows.map((r: Record<string, unknown>) => ({
      sourceId: r['source_id'] != null ? Number(r['source_id']) : null,
      name: (r['name'] as string) || 'Без источника',
      totalMinor: Number(r['total']),
    })),
  };
};

export const getRecurring = async (userId: number) => {
  const result = await client.execute({
    sql: `
      SELECT e.category_id, c.name, e.amount_minor, e.recurrence
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = ? AND e.is_recurring = 1
    `,
    args: [userId],
  });

  const items = result.rows.map((r: Record<string, unknown>) => ({
    type: 'expense' as const,
    categoryId: Number(r['category_id']),
    name: r['name'] as string,
    amountMinor: Number(r['amount_minor']),
    recurrence: r['recurrence'] as string,
  }));

  const monthlyExpenseMinor = items.reduce((sum, item) => {
    if (item.recurrence === 'monthly') return sum + item.amountMinor;
    if (item.recurrence === 'yearly') return sum + Math.round(item.amountMinor / 12);
    return sum;
  }, 0);

  return { monthlyExpenseMinor, items };
};
