let SQLApp = { db: null, ready: false };
function escapeHTML(str){
  return String(str ?? '').replace(/[&<>"']/g, s => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]
  ));
}
(async function init(){
  const SQL = await initSqlJs({
    locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
  }); 
  let db;
  try {
    const res = await fetch('Data/alamedas.sqlite');
    if (!res.ok) throw new Error('DB no encontrada');
    const buf = await res.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buf));
  } catch {
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



