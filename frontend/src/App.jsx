import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Products from "./pages/Products";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/shop" element={<Products />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <footer style={{ borderTop: "1px solid var(--line)", marginTop: "auto" }}>
        <div className="container" style={{ padding: "24px 32px", fontSize: 13, color: "var(--ink-soft)", display: "flex", justifyContent: "space-between" }}>
          <span>Loam &amp; Co.</span>
          <span>A student project built with React &amp; Node.js</span>
        </div>
      </footer>
    </>
  );
}
