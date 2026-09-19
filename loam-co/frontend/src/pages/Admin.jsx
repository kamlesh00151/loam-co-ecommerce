import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { api } from "../lib/api";

const COLORS = ["#1f2e1a", "#6b7f5e", "#c8763e", "#a85f30", "#33452b", "#d7d0b6"];

const emptyForm = { name: "", category: "", price: "", stock: "", description: "", care_level: "", light: "" };

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(() => {
    api.getSummary().then(setSummary).catch(() => {});
    api.getRevenueTimeline().then(setTimeline).catch(() => {});
    api.getRevenueByCategory().then(setByCategory).catch(() => {});
    api.getTopProducts().then(setTopProducts).catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadProducts();
  }, [loadAnalytics, loadProducts]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category: p.category, price: p.price, stock: p.stock,
      description: p.description || "", care_level: p.care_level || "", light: p.light || "",
    });
    setTab("products");
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock || 0, 10) };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      resetForm();
      loadProducts();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.deleteProduct(id);
    loadProducts();
    loadAnalytics();
  };

  return (
    <main className="container" style={{ padding: "40px 32px 80px" }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Admin dashboard</h1>
      <p style={{ marginBottom: 28 }}>Manage the catalog and keep an eye on how the shop is performing.</p>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 32 }}>
        {[["overview", "Overview"], ["products", "Products"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "10px 18px", border: "none", background: "none",
            borderBottom: tab === key ? "2px solid var(--clay)" : "2px solid transparent",
            color: tab === key ? "var(--moss)" : "var(--ink-soft)",
            fontWeight: 500, fontSize: 14.5,
          }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 40 }}>
            {summary && [
              ["Products", summary.totalProducts],
              ["Units in stock", summary.totalStock],
              ["Orders (90d)", summary.totalOrders],
              ["Revenue (90d)", `₹${Math.round(summary.totalRevenue).toLocaleString("en-IN")}`],
              ["Low stock alerts", summary.lowStock],
            ].map(([label, value]) => (
              <div key={label} style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 18, background: "var(--white)" }}>
                <p style={{ fontSize: 12.5, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 24, fontFamily: "var(--serif)", color: "var(--moss)", margin: "6px 0 0" }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 24 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 22, background: "var(--white)" }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Revenue, last 30 days</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={timeline}>
                  <CartesianGrid stroke="#e4ddc4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#c8763e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 22, background: "var(--white)" }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Revenue by category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byCategory} dataKey="revenue" nameKey="category" innerRadius={45} outerRadius={80}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 22, background: "var(--white)" }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Top-selling products (by units)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke="#e4ddc4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="units" fill="#6b7f5e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 32 }}>
          <form onSubmit={submit} style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 22, background: "var(--white)", height: "fit-content" }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editingId ? "Edit product" : "Add a product"}</h3>
            {error && <p style={{ color: "var(--clay-dark)", fontSize: 13 }}>{error}</p>}
            {[
              ["name", "Name"], ["category", "Category"], ["price", "Price (₹)"], ["stock", "Stock"],
              ["light", "Light needs"], ["care_level", "Care level"],
            ].map(([key, label]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12.5, marginBottom: 4 }}>{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  type={key === "price" || key === "stock" ? "number" : "text"}
                  required={key === "name" || key === "category" || key === "price"}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 3, fontSize: 13.5 }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, marginBottom: 4 }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 3, fontSize: 13.5, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ background: "var(--moss)", color: "var(--white)", border: "none", borderRadius: 3, padding: "9px 18px", fontSize: 13.5 }}>
                {editingId ? "Save changes" : "Add product"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ background: "none", border: "1px solid var(--line)", borderRadius: 3, padding: "9px 18px", fontSize: 13.5 }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div style={{ border: "1px solid var(--line)", borderRadius: 4, background: "var(--white)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "var(--parchment-deep)", textAlign: "left" }}>
                  {["Name", "Category", "Price", "Stock", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px 14px" }}>{p.name}</td>
                    <td style={{ padding: "10px 14px" }}>{p.category}</td>
                    <td style={{ padding: "10px 14px" }}>₹{p.price}</td>
                    <td style={{ padding: "10px 14px", color: p.stock < 15 ? "var(--clay-dark)" : "inherit" }}>{p.stock}</td>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(p)} style={{ background: "none", border: "none", color: "var(--clay-dark)", fontSize: 13, marginRight: 12 }}>Edit</button>
                      <button onClick={() => remove(p.id)} style={{ background: "none", border: "none", color: "#a33", fontSize: 13 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
