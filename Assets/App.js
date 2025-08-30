let SQLApp = { db: null, ready: false };

function escapeHTML(str){
  return String(str ?? '').replace(/[&<>"']/g, s => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]
  ));
}

(async function init(){
  // Inicializar sql.js (WASM) desde CDN
  const SQL = await initSqlJs({
    locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
  });

  // Intentar cargar la base de datos binaria
  let db;
  try {
    const res = await fetch('Data/alamedas.bin');
    if (!res.ok) throw new Error('DB no encontrada');
    const buf = await res.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buf));
  } catch {
    // Fallback en memoria para que la página no truene si aún no suben la DB
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS Noticias(Fecha TEXT, Noticia TEXT);`);
  }

  SQLApp.db = db;
  SQLApp.query = (sql, params=[]) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };

  SQLApp.ready = true;
  window.dispatchEvent(new Event('db-ready'));
})();


