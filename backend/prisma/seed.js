import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fruits = [
  'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Watermelon',
  'Mango', 'Pineapple', 'Kiwi', 'Peach', 'Pear', 'Cherry',
  'Blueberry', 'Raspberry', 'Blackberry', 'Lemon', 'Lime', 'Avocado',
  'Papaya', 'Coconut', 'Pomegranate', 'Fig', 'Date', 'Plum'
];

const vegetables = [
  'Tomato', 'Potato', 'Onion', 'Carrot', 'Cucumber', 'Lettuce',
  'Bell Pepper', 'Broccoli', 'Cauliflower', 'Spinach', 'Cabbage',
  'Garlic', 'Ginger', 'Celery', 'Corn', 'Peas', 'Green Beans',
  'Eggplant', 'Zucchini', 'Mushroom', 'Radish', 'Beetroot', 'Turnip',
  'Pumpkin', 'Sweet Potato', 'Asparagus', 'Artichoke', 'Okra'
];

async function main() {
  console.log('Seeding database...');

  // Create fruits
  for (const fruit of fruits) {
    await prisma.product.upsert({
      where: { name: fruit },
      update: {},
      create: {
        name: fruit,
        category: 'fruit',
      },
    });
  }

  // Create vegetables
  for (const vegetable of vegetables) {
    await prisma.product.upsert({
      where: { name: vegetable },
      update: {},
      create: {
        name: vegetable,
        category: 'vegetable',
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

