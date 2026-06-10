// Andi Fauzan Hediantoro - 24110400010

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());

app.get("/wallets", async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(wallets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/wallets", async (req, res) => {
  try {
    const { name, currency } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name wajib diisi" });
    }
    const wallet = await prisma.wallet.create({
      data: { name, currency: currency || "IDR" },
    });
    res.status(201).json(wallet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/wallets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet tidak ditemukan" });
    }
    await prisma.transaction.deleteMany({ where: { walletId: id } });
    await prisma.wallet.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/wallets/:id/transactions", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet tidak ditemukan" });
    }
    const transactions = await prisma.transaction.findMany({
      where: { walletId: id },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/wallets/:id/transactions", async (req, res) => {
  try {
    const walletId = parseInt(req.params.id);
    const { amount, type, category, date, note } = req.body;

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet tidak ditemukan" });
    }

    if (amount === undefined || !type || !category || !date) {
      return res.status(400).json({ error: "amount, type, category, dan date wajib diisi" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ error: 'type harus "income" atau "expense"' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "amount harus lebih dari 0" });
    }

    const transaction = await prisma.transaction.create({
      data: { amount, type, category, date: new Date(date), note: note || null, walletId },
    });
    res.status(201).json(transaction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/transactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: { select: { name: true } } },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    await prisma.transaction.delete({ where: { id } });
    res.status(200).json({ deleted: transaction });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/wallets/:id/balance", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet tidak ditemukan" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: id },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    res.json({
      walletId: id,
      walletName: wallet.name,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/wallets/:id/summary", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet tidak ditemukan" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: id },
    });

    const grouped = {};
    transactions.forEach((t) => {
      if (!grouped[t.category]) {
        grouped[t.category] = { count: 0, totalAmount: 0, income: 0, expense: 0 };
      }
      grouped[t.category].count++;
      grouped[t.category].totalAmount += t.amount;
      if (t.type === "income") grouped[t.category].income++;
      else grouped[t.category].expense++;
    });

    const summary = Object.keys(grouped).map((cat) => ({
      category: cat,
      count: grouped[cat].count,
      totalAmount: grouped[cat].totalAmount,
      avgAmount: parseFloat((grouped[cat].totalAmount / grouped[cat].count).toFixed(2)),
      types: { income: grouped[cat].income, expense: grouped[cat].expense },
    }));

    res.json({ walletId: id, walletName: wallet.name, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
