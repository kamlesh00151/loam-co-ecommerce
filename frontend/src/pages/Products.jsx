import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PlantMark from "../components/PlantMark";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "All") params.category = category;
    if (search) params.search = search;
    api.getProducts(params).then((rows) => {
      setProducts(rows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, search]);

  return (
    <main className="container" style={{ padding: "48px 32px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 34 }}>Shop</h1>
        <p style={{ marginTop: 8, maxWidth: 520 }}>Plants, planters and the small tools that keep them going.</p>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 3,
            fontSize: 14, minWidth: 240, background: "var(--white)",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 13, border: "1px solid var(--line)",
                background: category === c ? "var(--moss)" : "var(--white)",
                color: category === c ? "var(--white)" : "var(--ink-soft)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p>No products match that search.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 22 }}>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                textAlign: "left", border: "1px solid var(--line)", borderRadius: 4,
                background: "var(--white)", padding: 18,
              }}
            >
              <div style={{ display: "grid", placeItems: "center", height: 96, background: "var(--parchment-deep)", borderRadius: 3, marginBottom: 14 }}>
                <PlantMark seed={p.image_seed} size={50} />
              </div>
              <h3 style={{ fontSize: 15.5 }}>{p.name}</h3>
              <p style={{ fontSize: 12.5, margin: "4px 0 0" }}>{p.category}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontWeight: 500 }}>₹{p.price}</span>
                <span style={{ fontSize: 12, color: p.stock < 15 ? "var(--clay-dark)" : "var(--sage)" }}>
                  {p.stock < 15 ? "Low stock" : "In stock"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(34,39,30,0.55)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--white)", borderRadius: 6, maxWidth: 480, width: "100%", padding: 32 }}>
            <div style={{ display: "grid", placeItems: "center", height: 140, background: "var(--parchment-deep)", borderRadius: 4, marginBottom: 20 }}>
              <PlantMark seed={selected.image_seed} size={80} />
            </div>
            <h2 style={{ fontSize: 24 }}>{selected.name}</h2>
            <p style={{ fontSize: 13, margin: "4px 0 12px" }}>{selected.category}</p>
            <p>{selected.description}</p>
            {selected.care_level && (
              <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 13.5 }}>
                <span><strong>Care:</strong> {selected.care_level}</span>
                <span><strong>Light:</strong> {selected.light}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
              <span style={{ fontSize: 22, fontFamily: "var(--serif)", color: "var(--moss)" }}>₹{selected.price}</span>
              <button onClick={() => setSelected(null)} style={{
                background: "var(--moss)", color: "var(--white)", border: "none", borderRadius: 3,
                padding: "10px 20px", fontSize: 14,
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
