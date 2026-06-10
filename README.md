# UTS — Personal Finance API

REST API untuk aplikasi personal finance sederhana. Pengguna bisa punya beberapa wallet, dan tiap wallet bisa memiliki banyak transaksi.

## Cara Jalain

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
node index.js
```

Server jalan di `http://localhost:3000`

## Endpoint

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/wallets` | Ambil semua wallet |
| POST | `/wallets` | Buat wallet baru |
| DELETE | `/wallets/:id` | Hapus wallet beserta transaksinya |
| GET | `/wallets/:id/transactions` | Ambil transaksi per wallet |
| POST | `/wallets/:id/transactions` | Tambah transaksi |
| DELETE | `/transactions/:id` | Hapus transaksi |
| GET | `/wallets/:id/balance` | Hitung saldo |
| GET | `/wallets/:id/summary` | Ringkasan per kategori |

## Contoh Request

**Buat wallet:**

```bash
curl -X POST http://localhost:3000/wallets \
  -H "Content-Type: application/json" \
  -d '{"name":"GoPay","currency":"IDR"}'
```

**Tambah transaksi:**

```bash
curl -X POST http://localhost:3000/wallets/1/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":75000,"type":"expense","category":"food","date":"2025-01-20","note":"Makan siang"}'
```

**Lihat saldo:**

```bash
curl http://localhost:3000/wallets/1/balance
```

## Struktur File

```
├── index.js            ← Semua endpoint
├── prisma/
│   ├── schema.prisma   ← Schema database
│   └── seed.js         ← Data awal
├── .env                ← Config database
└── package.json
```
