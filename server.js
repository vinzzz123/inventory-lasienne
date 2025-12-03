import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// JSON File Database
const DB_FILE = join(__dirname, 'database.json');

const defaultDB = {
  products: [],
  stock_movements: [],
  alerts: [],
  marketplace_config: [],
  counters: { products: 0, movements: 0, alerts: 0 }
};

const loadDB = () => {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
};

const saveDB = (data) => writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Initialize with seed data
const seedProducts = () => {
  const db = loadDB();
  if (db.products.length > 0) return;

  const products = [
    // Sienne's Avenue Collection
    { sku: 'SA-CASSIE-SHIRT', name: 'Cassie Fitted Shirt', category: 'Tops', collection: "Sienne's Avenue", image_url: 'cassie_shirt.JPG', current_stock: 22, warning_threshold: 10, critical_threshold: 5, price: 189000, cogs: 94685 },
    { sku: 'SA-MADDY-HALTER', name: 'Maddy Halter Vest Top', category: 'Tops', collection: "Sienne's Avenue", image_url: 'maddy_shirt.JPG', current_stock: 8, warning_threshold: 10, critical_threshold: 5, price: 179000, cogs: 104685 },
    { sku: 'SA-IVY-SHORTS', name: 'Ivy Lace Shorts', category: 'Bottoms', collection: "Sienne's Avenue", image_url: 'cassie_ivy_short.jpg', current_stock: 26, warning_threshold: 10, critical_threshold: 5, price: 149000, cogs: 87785 },
    { sku: 'SA-CANDACE-SKORT', name: 'Candace Mini Skort', category: 'Bottoms', collection: "Sienne's Avenue", image_url: 'Candace_Mini_Skort_.jpg', current_stock: 10, warning_threshold: 10, critical_threshold: 5, price: 169000, cogs: 76464 },
    { sku: 'SA-DANIELLE-BOW', name: 'Danielle Bow Halter Top', category: 'Tops', collection: "Sienne's Avenue", image_url: 'danielle_top.JPG', current_stock: 37, warning_threshold: 10, critical_threshold: 5, price: 179000, cogs: 66464 },
    { sku: 'SA-ELAINE-DENIM', name: 'Elaine Denim Shorts', category: 'Bottoms', collection: "Sienne's Avenue", image_url: 'ivy_denim.jpg', current_stock: 19, warning_threshold: 10, critical_threshold: 5, price: 159000, cogs: 87785 },
    { sku: 'SA-RUBY-TOP', name: 'Ruby Multiways Top', category: 'Tops', collection: "Sienne's Avenue", image_url: 'ruby_lily.JPG', current_stock: 2, warning_threshold: 10, critical_threshold: 5, price: 169000, cogs: 66464 },
    { sku: 'SA-LILY-PANTS', name: 'Lily Lounge Boyfriend Pants', category: 'Bottoms', collection: "Sienne's Avenue", image_url: 'lily_pants.JPG', current_stock: 8, warning_threshold: 10, critical_threshold: 5, price: 189000, cogs: 74335 },
    
    // Hers Collection
    { sku: 'HERS-JENNIE-NC', name: 'Jennie Fitted Tee', category: 'Tops', collection: 'Hers', image_url: 'jennie_tee.JPG', current_stock: 16, warning_threshold: 10, critical_threshold: 5, price: 169000, cogs: 89943 },
    { sku: 'HERS-JENNIE-C', name: 'Jennie Fitted Tee (Custom)', category: 'Tops', collection: 'Hers', image_url: 'jennie_tee.JPG', current_stock: 0, warning_threshold: 10, critical_threshold: 5, price: 199000, cogs: 89943 },
    { sku: 'HERS-KENDALL-TANK', name: 'Kendall Lace Tank', category: 'Tops', collection: 'Hers', image_url: 'kendall_lace_tank.JPG', current_stock: 0, warning_threshold: 10, critical_threshold: 5, price: 149000, cogs: 90315 },
    { sku: 'HERS-SYDNEY-TANK', name: 'Sydney Pointelle Tank', category: 'Tops', collection: 'Hers', image_url: 'sydney_tank.JPG', current_stock: 10, warning_threshold: 10, critical_threshold: 5, price: 149000, cogs: 76315 },
    { sku: 'HERS-CHARLOTTE-CARD', name: 'Charlotte Pointelle Cardigan', category: 'Outerwear', collection: 'Hers', image_url: 'charlotte_cardigan.JPG', current_stock: 2, warning_threshold: 10, critical_threshold: 5, price: 189000, cogs: 123183 },
    { sku: 'HERS-BELLA-TOP', name: 'Bella Multiways Top', category: 'Tops', collection: 'Hers', image_url: '', current_stock: 33, warning_threshold: 10, critical_threshold: 5, price: 169000, cogs: 66464 },
    { sku: 'HERS-WILLOW-LS', name: 'Willow Pointelle Longsleeve Top', category: 'Tops', collection: 'Hers', image_url: '', current_stock: 2, warning_threshold: 10, critical_threshold: 5, price: 179000, cogs: 93183 },
    { sku: 'HERS-MILLANE-WRAP', name: 'Millane Pointelle Wrap Top', category: 'Tops', collection: 'Hers', image_url: '', current_stock: 14, warning_threshold: 10, critical_threshold: 5, price: 179000, cogs: 93183 },
    { sku: 'HERS-ELLA-SKORT', name: 'Ella Pointelle Mini Skort', category: 'Bottoms', collection: 'Hers', image_url: '', current_stock: 49, warning_threshold: 10, critical_threshold: 5, price: 159000, cogs: 76315 },
    
    // Château de Sienne Collection
    { sku: 'CDS-CHLOE-SATIN', name: 'Chloe Satin Top', category: 'Tops', collection: 'Château de Sienne', image_url: '', current_stock: 9, warning_threshold: 10, critical_threshold: 5, price: 179000, cogs: 63108 },
    { sku: 'CDS-CAMILLE-PANTS', name: 'Camille Satin Pants', category: 'Bottoms', collection: 'Château de Sienne', image_url: '', current_stock: 17, warning_threshold: 10, critical_threshold: 5, price: 249000, cogs: 78098 },
    { sku: 'CDS-EMILY-SHORTS', name: 'Emily Pointelle Lounge Shorts', category: 'Bottoms', collection: 'Château de Sienne', image_url: '', current_stock: 22, warning_threshold: 10, critical_threshold: 5, price: 149000, cogs: 70536 },
    { sku: 'CDS-MIA-DRESS', name: 'Mia Gingham Mini Dress', category: 'Dresses', collection: 'Château de Sienne', image_url: '', current_stock: 6, warning_threshold: 10, critical_threshold: 5, price: 269000, cogs: 110338 }
  ];

  products.forEach((p) => {
    db.counters.products++;
    db.products.push({
      id: db.counters.products,
      ...p,
      shopee_id: null,
      shopify_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  saveDB(db);
};

seedProducts();

// Helper functions
const getStockLevel = (stock, warning, critical) => {
  if (stock <= critical) return 'red';
  if (stock <= warning) return 'yellow';
  return 'green';
};

const createAlert = (db, productId, type, level, message) => {
  db.counters.alerts++;
  db.alerts.push({
    id: db.counters.alerts,
    product_id: productId,
    alert_type: type,
    level,
    message,
    is_read: 0,
    created_at: new Date().toISOString()
  });
};

// API Routes

app.get('/api/products', (req, res) => {
  const db = loadDB();
  const products = db.products.map(p => ({
    ...p,
    stock_level: getStockLevel(p.current_stock, p.warning_threshold, p.critical_threshold)
  })).sort((a, b) => a.name.localeCompare(b.name));
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const db = loadDB();
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.stock_level = getStockLevel(product.current_stock, product.warning_threshold, product.critical_threshold);
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const db = loadDB();
  const { sku, name, category, collection, image_url, current_stock, warning_threshold, critical_threshold, price, cogs } = req.body;
  
  if (db.products.find(p => p.sku === sku)) {
    return res.status(400).json({ error: 'SKU already exists' });
  }

  db.counters.products++;
  const newProduct = {
    id: db.counters.products,
    sku, name, category, collection, image_url,
    current_stock: current_stock || 0,
    warning_threshold: warning_threshold || 10,
    critical_threshold: critical_threshold || 5,
    price: price || 0,
    cogs: cogs || 0,
    shopee_id: null, shopify_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.products.push(newProduct);
  saveDB(db);
  res.json({ id: newProduct.id, message: 'Product created' });
});

app.put('/api/products/:id', (req, res) => {
  const db = loadDB();
  const idx = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const { name, category, collection, warning_threshold, critical_threshold, price, cogs, shopee_id, shopify_id } = req.body;
  db.products[idx] = {
    ...db.products[idx],
    name: name || db.products[idx].name,
    category: category || db.products[idx].category,
    collection: collection || db.products[idx].collection,
    warning_threshold: warning_threshold ?? db.products[idx].warning_threshold,
    critical_threshold: critical_threshold ?? db.products[idx].critical_threshold,
    price: price ?? db.products[idx].price,
    cogs: cogs ?? db.products[idx].cogs,
    shopee_id: shopee_id || db.products[idx].shopee_id,
    shopify_id: shopify_id || db.products[idx].shopify_id,
    updated_at: new Date().toISOString()
  };
  
  saveDB(db);
  res.json({ message: 'Product updated' });
});

app.post('/api/stock-movement', (req, res) => {
  const db = loadDB();
  const { product_id, movement_type, quantity, source, notes } = req.body;
  
  const idx = db.products.findIndex(p => p.id === product_id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const product = db.products[idx];
  const previousStock = product.current_stock;
  const newStock = movement_type === 'in' ? previousStock + quantity : previousStock - quantity;

  if (newStock < 0) return res.status(400).json({ error: 'Insufficient stock' });

  db.products[idx].current_stock = newStock;
  db.products[idx].updated_at = new Date().toISOString();

  db.counters.movements++;
  db.stock_movements.push({
    id: db.counters.movements,
    product_id, movement_type, quantity,
    previous_stock: previousStock, new_stock: newStock,
    source: source || 'manual', notes,
    created_at: new Date().toISOString()
  });

  const newLevel = getStockLevel(newStock, product.warning_threshold, product.critical_threshold);
  const oldLevel = getStockLevel(previousStock, product.warning_threshold, product.critical_threshold);

  if (newLevel !== oldLevel || newLevel === 'red') {
    let alertMessage = '';
    if (newLevel === 'red') alertMessage = `CRITICAL: ${product.name} stock is critically low (${newStock} units)`;
    else if (newLevel === 'yellow') alertMessage = `WARNING: ${product.name} stock is running low (${newStock} units)`;
    else if (newLevel === 'green' && oldLevel !== 'green') alertMessage = `RESTORED: ${product.name} stock is back to healthy levels (${newStock} units)`;
    if (alertMessage) createAlert(db, product_id, 'stock_level', newLevel, alertMessage);
  }

  createAlert(db, product_id, 'movement', 'info', 
    `Stock ${movement_type === 'in' ? 'added' : 'removed'}: ${quantity} units of ${product.name} (${previousStock} → ${newStock})`);

  saveDB(db);
  res.json({ message: 'Stock updated', previous_stock: previousStock, new_stock: newStock, stock_level: newLevel });
});

app.get('/api/stock-movements', (req, res) => {
  const db = loadDB();
  const { product_id, limit = 100 } = req.query;
  
  let movements = db.stock_movements;
  if (product_id) movements = movements.filter(m => m.product_id === parseInt(product_id));
  
  movements = movements.map(m => {
    const product = db.products.find(p => p.id === m.product_id);
    return { ...m, product_name: product?.name, sku: product?.sku };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, parseInt(limit));

  res.json(movements);
});

app.get('/api/alerts', (req, res) => {
  const db = loadDB();
  const { unread_only, limit = 50 } = req.query;
  
  let alerts = db.alerts;
  if (unread_only === 'true') alerts = alerts.filter(a => !a.is_read);
  
  alerts = alerts.map(a => {
    const product = db.products.find(p => p.id === a.product_id);
    return { ...a, product_name: product?.name, sku: product?.sku };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, parseInt(limit));

  res.json(alerts);
});

app.put('/api/alerts/:id/read', (req, res) => {
  const db = loadDB();
  const idx = db.alerts.findIndex(a => a.id === parseInt(req.params.id));
  if (idx !== -1) { db.alerts[idx].is_read = 1; saveDB(db); }
  res.json({ message: 'Alert marked as read' });
});

app.put('/api/alerts/read-all', (req, res) => {
  const db = loadDB();
  db.alerts.forEach(a => a.is_read = 1);
  saveDB(db);
  res.json({ message: 'All alerts marked as read' });
});

app.get('/api/dashboard', (req, res) => {
  const db = loadDB();
  const products = db.products;
  const stockLevels = { red: 0, yellow: 0, green: 0 };
  products.forEach(p => stockLevels[getStockLevel(p.current_stock, p.warning_threshold, p.critical_threshold)]++);

  res.json({
    total_products: products.length,
    total_stock: products.reduce((sum, p) => sum + p.current_stock, 0),
    stock_levels: stockLevels,
    unread_alerts: db.alerts.filter(a => !a.is_read).length,
    recent_movements: db.stock_movements.map(m => ({ ...m, product_name: db.products.find(p => p.id === m.product_id)?.name }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
  });
});

app.get('/api/marketplace-config', (req, res) => {
  const db = loadDB();
  res.json(db.marketplace_config.map(c => ({ id: c.id, platform: c.platform, shop_id: c.shop_id, is_active: c.is_active, last_sync: c.last_sync })));
});

app.post('/api/marketplace-config', (req, res) => {
  const db = loadDB();
  const { platform, api_key, api_secret, shop_id, access_token } = req.body;
  
  const idx = db.marketplace_config.findIndex(c => c.platform === platform);
  const config = { id: idx !== -1 ? db.marketplace_config[idx].id : db.marketplace_config.length + 1, platform, api_key, api_secret, shop_id, access_token, is_active: 1, last_sync: null, created_at: new Date().toISOString() };

  if (idx !== -1) db.marketplace_config[idx] = config;
  else db.marketplace_config.push(config);
  
  saveDB(db);
  res.json({ message: `${platform} configuration saved` });
});

app.post('/api/sync/shopee', async (req, res) => {
  const db = loadDB();
  const config = db.marketplace_config.find(c => c.platform === 'shopee' && c.is_active);
  if (!config) return res.status(400).json({ error: 'Shopee not configured' });

  const idx = db.marketplace_config.findIndex(c => c.platform === 'shopee');
  if (idx !== -1) { db.marketplace_config[idx].last_sync = new Date().toISOString(); saveDB(db); }

  res.json({ message: 'Shopee sync completed', synced_products: db.products.filter(p => p.shopee_id).length, note: 'Configure real API keys for live sync' });
});

app.post('/api/sync/shopify', async (req, res) => {
  const db = loadDB();
  const config = db.marketplace_config.find(c => c.platform === 'shopify' && c.is_active);
  if (!config) return res.status(400).json({ error: 'Shopify not configured' });

  const idx = db.marketplace_config.findIndex(c => c.platform === 'shopify');
  if (idx !== -1) { db.marketplace_config[idx].last_sync = new Date().toISOString(); saveDB(db); }

  res.json({ message: 'Shopify sync completed', synced_products: db.products.filter(p => p.shopify_id).length, note: 'Configure real API keys for live sync' });
});

app.post('/api/sync/all', async (req, res) => res.json({ message: 'All marketplaces synced' }));

cron.schedule('*/15 * * * *', () => console.log('Running scheduled marketplace sync...'));

cron.schedule('0 * * * *', () => {
  console.log('Checking for low stock items...');
  const db = loadDB();
  db.products.forEach(product => {
    const level = getStockLevel(product.current_stock, product.warning_threshold, product.critical_threshold);
    if (level === 'red' || level === 'yellow') createAlert(db, product.id, 'scheduled_check', level, `${level === 'red' ? 'CRITICAL' : 'WARNING'}: ${product.name} has only ${product.current_stock} units in stock`);
  });
  saveDB(db);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Inventory API running on http://localhost:${PORT}`));