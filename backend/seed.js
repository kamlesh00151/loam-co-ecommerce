import db from "./db.js";


const products = [
  {
    name: "Fiddle Leaf Fig",
    category: "Floor Plants",
    price: 2499,
    stock: 14,
    description: "A statement plant with broad, glossy leaves. Loves bright, indirect light.",
    care_level: "Moderate",
    light: "Bright indirect",
  },
  {
    name: "Snake Plant 'Laurentii'",
    category: "Low Maintenance",
    price: 899,
    stock: 40,
    description: "Nearly indestructible and air-purifying. Thrives on neglect.",
    care_level: "Easy",
    light: "Low to bright",
  },
  {
    name: "Monstera Deliciosa",
    category: "Floor Plants",
    price: 1799,
    stock: 22,
    description: "Iconic split leaves that get more dramatic as the plant matures.",
    care_level: "Easy",
    light: "Bright indirect",
  },
  {
    name: "String of Pearls",
    category: "Hanging Plants",
    price: 649,
    stock: 30,
    description: "Cascading beaded vines, perfect for a shelf or hanging basket.",
    care_level: "Moderate",
    light: "Bright indirect",
  },
  {
    name: "ZZ Plant",
    category: "Low Maintenance",
    price: 999,
    stock: 35,
    description: "Waxy, dark green leaves that tolerate low light and irregular watering.",
    care_level: "Easy",
    light: "Low to moderate",
  },
  {
    name: "Terracotta Pot, 8in",
    category: "Planters",
    price: 449,
    stock: 60,
    description: "Hand-thrown unglazed terracotta with a drainage hole and saucer.",
    care_level: null,
    light: null,
  },
  {
    name: "Ceramic Planter, Sage",
    category: "Planters",
    price: 799,
    stock: 45,
    description: "Matte-glazed stoneware planter in a muted sage tone.",
    care_level: null,
    light: null,
  },
  {
    name: "Copper Mister",
    category: "Tools",
    price: 599,
    stock: 50,
    description: "A fine brass mist sprayer for humidity-loving plants.",
    care_level: null,
    light: null,
  },
  {
    name: "Pruning Snips",
    category: "Tools",
    price: 399,
    stock: 55,
    description: "Precision steel snips for deadheading and light pruning.",
    care_level: null,
    light: null,
  },
  {
    name: "Organic Potting Mix, 5L",
    category: "Soil & Feed",
    price: 349,
    stock: 80,
    description: "A well-draining, peat-free mix for most houseplants.",
    care_level: null,
    light: null,
  },
  {
    name: "Pothos 'Marble Queen'",
    category: "Hanging Plants",
    price: 549,
    stock: 38,
    description: "Variegated trailing vines that are famously forgiving.",
    care_level: "Easy",
    light: "Low to bright",
  },
  {
    name: "Calathea Orbifolia",
    category: "Floor Plants",
    price: 1499,
    stock: 12,
    description: "Striking silver-striped leaves. Prefers steady humidity.",
    care_level: "Fussy",
    light: "Bright indirect",
  },
];

const productCount = db
  .prepare("SELECT COUNT(*) AS count FROM products")
  .get().count;

if (productCount > 0) {
  console.log(`Database already contains ${productCount} products. Skipping seed.`);
} else {
  const insert = db.prepare(`
    INSERT INTO products
    (name, category, price, stock, description, care_level, light, image_seed)
    VALUES
    (@name, @category, @price, @stock, @description, @care_level, @light, @image_seed)
  `);

  const seed = db.transaction(() => {
    for (const p of products) {
      insert.run({
        ...p,
        image_seed: p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      });
    }

    const productIds = db
      .prepare("SELECT id, price FROM products")
      .all();

    const insertOrder = db.prepare(`
      INSERT INTO orders
      (product_id, quantity, revenue, order_date)
      VALUES (?, ?, ?, ?)
    `);

    const today = new Date();

    for (let d = 89; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);

      const isoDate = date.toISOString().slice(0, 10);

      const ordersToday =
        1 + Math.floor(Math.random() * 6);

      for (let i = 0; i < ordersToday; i++) {
        const p =
          productIds[
            Math.floor(Math.random() * productIds.length)
          ];

        const qty =
          1 + Math.floor(Math.random() * 3);

        insertOrder.run(
          p.id,
          qty,
          +(p.price * qty).toFixed(2),
          isoDate
        );
      }
    }
  });

  seed();

  console.log(
    `Seeded ${products.length} products and synthetic order history.`
  );
}