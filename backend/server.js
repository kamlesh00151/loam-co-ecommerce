import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./db.js";
import "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// If a built frontend exists at backend/public (copied from frontend/dist),
// serve it. This lets the whole app deploy as one service with one URL.
const publicDir = path.join(__dirname, "public");
const hasFrontendBuild = fs.existsSync(path.join(publicDir, "index.html"));
if (hasFrontendBuild) {
  app.use(express.static(publicDir));
}

// ---------- Health ----------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---------- Products ----------

// List products (supports ?category= & ?search=)
app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];
  if (category && category !== "All") {
    query += " AND category = ?";
    params.push(category);
  }
  if (search) {
    query += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  query += " ORDER BY created_at DESC";
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Get distinct categories
app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all();
  res.json(rows.map((r) => r.category));
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// Create product
app.post("/api/products", (req, res) => {
  const { name, category, price, stock, description, care_level, light } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: "name, category and price are required" });
  }
  const image_seed = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const info = db
    .prepare(
      `INSERT INTO products (name, category, price, stock, description, care_level, light, image_seed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, category, price, stock ?? 0, description ?? "", care_level ?? null, light ?? null, image_seed);
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(product);
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const merged = { ...existing, ...req.body };
  db.prepare(
    `UPDATE products SET name=?, category=?, price=?, stock=?, description=?, care_level=?, light=? WHERE id=?`
  ).run(
    merged.name,
    merged.category,
    merged.price,
    merged.stock,
    merged.description,
    merged.care_level,
    merged.light,
    req.params.id
  );
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(product);
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Product not found" });
  res.status(204).send();
});

// ---------- Analytics (for admin dashboard) ----------

// Summary cards
app.get("/api/analytics/summary", (req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
  const totalStock = db.prepare("SELECT COALESCE(SUM(stock),0) AS s FROM products").get().s;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(revenue),0) AS r FROM orders").get().r;
  const totalOrders = db.prepare("SELECT COUNT(*) AS c FROM orders").get().c;
  const lowStock = db.prepare("SELECT COUNT(*) AS c FROM products WHERE stock < 15").get().c;
  res.json({ totalProducts, totalStock, totalRevenue, totalOrders, lowStock });
});

// Revenue over time (last 30 days)
app.get("/api/analytics/revenue-timeline", (req, res) => {
  const rows = db
    .prepare(
      `SELECT order_date AS date, SUM(revenue) AS revenue
       FROM orders
       WHERE order_date >= date('now', '-30 days')
       GROUP BY order_date ORDER BY order_date`
    )
    .all();
  res.json(rows);
});

// Revenue by category
app.get("/api/analytics/revenue-by-category", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.category AS category, SUM(o.revenue) AS revenue
       FROM orders o JOIN products p ON p.id = o.product_id
       GROUP BY p.category ORDER BY revenue DESC`
    )
    .all();
  res.json(rows);
});

// Top selling products
app.get("/api/analytics/top-products", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.name AS name, SUM(o.quantity) AS units, SUM(o.revenue) AS revenue
       FROM orders o JOIN products p ON p.id = o.product_id
       GROUP BY p.id ORDER BY units DESC LIMIT 5`
    )
    .all();
  res.json(rows);
});

// Stock levels for all products
app.get("/api/analytics/stock-levels", (req, res) => {
  const rows = db.prepare("SELECT name, stock, category FROM products ORDER BY stock ASC").all();
  res.json(rows);
});

// SPA fallback: any non-API route serves the React app so client-side
// routes like /shop and /admin work on a direct visit or page refresh.
if (hasFrontendBuild) {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Loam & Co. server listening on http://localhost:${PORT}`);
});
