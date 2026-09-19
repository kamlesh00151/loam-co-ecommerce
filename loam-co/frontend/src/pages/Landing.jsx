import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PlantMark from "../components/PlantMark";

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getProducts().then((rows) => setFeatured(rows.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <main>
      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center", padding: "84px 32px" }}>
          <div>
            <h1 style={{ fontSize: 52, lineHeight: 1.08, maxWidth: 520 }}>
              Plants that stay alive past the first month.
            </h1>
            <p style={{ marginTop: 20, fontSize: 17, maxWidth: 440 }}>
              We grow, pack and ship houseplants with a care card written for your exact light and
              a first six weeks of check-in emails — so the plant you fall for in the photo is the
              one still thriving on your shelf in spring.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 14 }}>
              <Link to="/shop" style={{
                background: "var(--moss)", color: "var(--white)", padding: "13px 26px",
                borderRadius: 3, textDecoration: "none", fontWeight: 500, fontSize: 15,
              }}>
                Shop the collection
              </Link>
              <a href="#care" style={{
                border: "1px solid var(--moss)", color: "var(--moss)", padding: "13px 26px",
                borderRadius: 3, textDecoration: "none", fontWeight: 500, fontSize: 15,
              }}>
                How we grow
              </a>
            </div>
          </div>
          <div style={{
            background: "var(--moss)", borderRadius: 4, aspectRatio: "4/3",
            display: "grid", placeItems: "center", gap: 18,
            gridTemplateColumns: "repeat(3, 1fr)", padding: 28,
          }}>
            {["fiddle-leaf-fig", "monstera-deliciosa", "string-of-pearls", "zz-plant", "pothos-marble-queen", "snake-plant-laurentii"].map((seed) => (
              <div key={seed} style={{ display: "grid", placeItems: "center" }}>
                <PlantMark seed={seed} size={56} tone="clay" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container" style={{ padding: "64px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
          <h2 style={{ fontSize: 28 }}>New this season</h2>
          <Link to="/shop" style={{ fontSize: 14, color: "var(--clay-dark)", textDecoration: "none" }}>
            View all products
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {featured.map((p) => (
            <div key={p.id} style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 20, background: "var(--white)" }}>
              <div style={{ display: "grid", placeItems: "center", height: 88, background: "var(--parchment-deep)", borderRadius: 3, marginBottom: 14 }}>
                <PlantMark seed={p.image_seed} size={48} />
              </div>
              <h3 style={{ fontSize: 16 }}>{p.name}</h3>
              <p style={{ fontSize: 13, margin: "4px 0 0" }}>{p.category}</p>
              <p style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500, marginTop: 10 }}>₹{p.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand / care section */}
      <section id="care" style={{ background: "var(--moss)", color: "var(--white)" }}>
        <div className="container" style={{ padding: "72px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
          {[
            { title: "Grown, not warehoused", body: "Every plant spends its early months in our partner nursery in Nashik before it ever sees a delivery box." },
            { title: "A care card per plant", body: "Light, water and repotting notes written for that specific species — not a generic houseplant pamphlet." },
            { title: "Six weeks of follow-up", body: "We check in by email at week one, three and six, and swap anything that doesn't take root." },
          ].map((f) => (
            <div key={f.title}>
              <h3 style={{ color: "var(--white)", fontSize: 19, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "#cfd6c6", fontSize: 14.5 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
