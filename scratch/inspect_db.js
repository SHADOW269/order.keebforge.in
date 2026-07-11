const path = require('path');
const fs = require('fs');

// Manual env parser
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const { createClient } = require(path.join(process.cwd(), 'node_modules/@supabase/supabase-js'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  // Get latest 3 orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, service_type')
    .limit(3);

  if (error) {
    console.error('Error fetching orders:', error);
    process.exit(1);
  }

  console.log('--- Orders ---');
  console.log(JSON.stringify(orders, null, 2));

  for (const order of orders) {
    console.log(`\n=== Details for Order ${order.order_number} (${order.id}) ===`);

    const { data: products } = await supabase
      .from('order_products')
      .select('type, name')
      .eq('order_id', order.id);
    console.log('Products:', products);

    const { data: services } = await supabase
      .from('order_services')
      .select('service_id, quantity')
      .eq('order_id', order.id);
    console.log('Services:', services);

    const { data: customWork } = await supabase
      .from('order_custom_work')
      .select('category, name, description, price, quantity')
      .eq('order_id', order.id);
    console.log('Custom Work:', customWork);
  }
}

inspect();
