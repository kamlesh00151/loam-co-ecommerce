import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  padding: "8px 4px",
  fontSize: 15,
  fontWeight: 500,
  color: isActive ? "var(--moss)" : "var(--ink-soft)",
  borderBottom: isActive ? "2px solid var(--clay)" : "2px solid transparent",
  textDecoration: "none",
});

export default function Navbar() {
  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--parchment)", position: "sticky", top: 0, zIndex: 10 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, color: "var(--moss)" }}>
            Loam &amp; Co.
          </span>
        </NavLink>
        <nav style={{ display: "flex", gap: 28 }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/shop" style={linkStyle}>Shop</NavLink>
          <NavLink to="/admin" style={linkStyle}>Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
