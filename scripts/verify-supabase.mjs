const SUPABASE_URL = "https://isaucqsdbndfdjjrahbs.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYXVjcXNkYm5kZmRqanJhaGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0Njk4NTQsImV4cCI6MjEwNDA0NTg1NH0.Zoq2sWMjVhGIbTy2TtqEJnGH4FwmpcvcHdw62_g40_Y";

async function verify() {
  const tables = ['tenants', 'categories', 'products', 'tables', 'orders', 'customers', 'reservations', 'cash_shifts'];
  console.log("🔍 Verificando tablas en Supabase Cloud...");

  let okCount = 0;
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Range: '0-0'
        }
      });
      if (res.ok) {
        console.log(`✅ Tabla "${table}": ACTIVA Y VINCULADA`);
        okCount++;
      } else {
        const err = await res.json();
        console.log(`❌ Tabla "${table}": NO EXISTE AÚN (${err.code || res.status})`);
      }
    } catch (e) {
      console.log(`❌ Error al conectar a "${table}":`, e.message);
    }
  }

  if (okCount === tables.length) {
    console.log("\n🎉 ¡TODAS LAS TABLAS ESTÁN APROVISIONADAS Y ACTIVAS EN SUPABASE!");
  } else {
    console.log(`\n⚠️ Se detectaron ${okCount}/${tables.length} tablas activas.`);
  }
}

verify();
