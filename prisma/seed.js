const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();

  await prisma.wallet.createMany({
    data: [
      { id: 1, name: "BCA Tabungan", currency: "IDR" },
      { id: 2, name: "Cash", currency: "IDR" },
    ],
  });

  await prisma.transaction.createMany({
    data: [
      { amount: 5000000, type: "income", category: "salary", date: new Date("2025-01-05"), walletId: 1 },
      { amount: 45000, type: "expense", category: "food", date: new Date("2025-01-06"), walletId: 1 },
      { amount: 25000, type: "expense", category: "transport", date: new Date("2025-01-07"), walletId: 1 },
      { amount: 80000, type: "expense", category: "food", date: new Date("2025-01-10"), walletId: 1 },
      { amount: 500000, type: "income", category: "freelance", date: new Date("2025-01-15"), walletId: 1 },
      { amount: 200000, type: "income", category: "salary", date: new Date("2025-01-05"), walletId: 2 },
      { amount: 30000, type: "expense", category: "food", date: new Date("2025-01-08"), walletId: 2 },
    ],
  });

  console.log("Seed done");
}

main()
  .catch(() => process.exit(1))
  .finally(() => prisma.$disconnect());
