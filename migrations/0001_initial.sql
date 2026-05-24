CREATE TABLE transactions (
  id              TEXT PRIMARY KEY,
  amount          REAL NOT NULL,
  category        TEXT NOT NULL,
  type            TEXT NOT NULL CHECK(type IN ('income','expense')),
  note            TEXT,
  date            TEXT NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'Cash',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tx_date     ON transactions(date);
CREATE INDEX idx_tx_type     ON transactions(type);
CREATE INDEX idx_tx_category ON transactions(category);

CREATE TABLE budgets (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  month        INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  UNIQUE(category, month, year)
);

-- Seed sample data
INSERT INTO transactions VALUES
  ('tx1','3200','Salary','income','Monthly salary','2026-05-01','Bank Transfer',datetime('now')),
  ('tx2','450','Food','expense','Groceries','2026-05-02','Cash',datetime('now')),
  ('tx3','120','Transport','expense','Fuel','2026-05-03','Cash',datetime('now')),
  ('tx4','800','Bills','expense','Electricity & Internet','2026-05-05','Bank Transfer',datetime('now')),
  ('tx5','200','Entertainment','expense','Movies & dining','2026-05-08','Card',datetime('now')),
  ('tx6','500','Business','income','Freelance project','2026-05-10','Bank Transfer',datetime('now')),
  ('tx7','350','Shopping','expense','Clothes','2026-05-12','Card',datetime('now')),
  ('tx8','90','Health','expense','Pharmacy','2026-05-14','Cash',datetime('now')),
  ('tx9','180','Food','expense','Restaurant','2026-05-16','Card',datetime('now')),
  ('tx10','75','Transport','expense','Taxi rides','2026-05-18','Cash',datetime('now')),
  ('tx11','60','Food','expense','Coffee & snacks','2026-05-20','Cash',datetime('now')),
  ('tx12','240','Shopping','expense','Home goods','2026-05-21','Card',datetime('now')),
  ('tx13','95','Entertainment','expense','Streaming + games','2026-05-22','Card',datetime('now')),
  ('tx14','150','Food','expense','Weekly groceries','2026-05-23','Cash',datetime('now')),
  ('tx15','50','Transport','expense','Bus passes','2026-05-24','Cash',datetime('now'));

INSERT INTO budgets VALUES
  ('b1','Food',600,5,2026),
  ('b2','Transport',200,5,2026),
  ('b3','Shopping',400,5,2026),
  ('b4','Bills',900,5,2026),
  ('b5','Entertainment',300,5,2026),
  ('b6','Health',150,5,2026);
