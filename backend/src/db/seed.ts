import client from './client';

const seedCategories = async () => {
  const existing = await client.execute({
    sql: 'SELECT id FROM categories WHERE user_id IS NULL LIMIT 1',
    args: [],
  });

  if (existing.rows.length > 0) {
    console.log('System categories already seeded');
    return;
  }

  const categories = [
    { name: 'Подписки', kind: 'subscription' },
    { name: 'Коммуналка', kind: 'utility' },
    { name: 'Продукты', kind: 'groceries' },
    { name: 'Аренда', kind: 'rent' },
    { name: 'Прочее', kind: 'other' },
  ];

  for (const cat of categories) {
    await client.execute({
      sql: 'INSERT INTO categories (user_id, name, kind) VALUES (NULL, ?, ?)',
      args: [cat.name, cat.kind],
    });
  }

  console.log('System categories seeded');
};

export default seedCategories;
