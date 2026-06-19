// Controladores de reportes: validan query params y delegan en reporteService.
const reporteService = require("../services/reporteService");

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_UMBRAL = 10;
const DEFAULT_LIMITE = 5;
const MAX_LIMITE = 100;

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// Parsea "YYYY-MM-DD" a Date local; devuelve undefined si el valor es inválido (lo marca el caller).
function parseFecha(str) {
  if (!FECHA_RE.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  // Rechaza fechas imposibles (ej. 2026-02-31 que JS "corrige").
  if (fecha.getFullYear() !== y || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) {
    return null;
  }
  return fecha;
}

async function resumen(req, res, next) {
  try {
    let umbral = DEFAULT_UMBRAL;
    if (req.query.umbral !== undefined) {
      umbral = Number(req.query.umbral);
      if (!Number.isInteger(umbral) || umbral < 0) {
        return badRequest(res, "umbral debe ser un entero >= 0");
      }
    }
    res.json({ data: await reporteService.resumen({ umbral }) });
  } catch (err) {
    next(err);
  }
}

async function ventasPorDia(req, res, next) {
  try {
    const { desde: desdeStr, hasta: hastaStr } = req.query;

    let desde = null;
    let hasta = null;
    if (desdeStr !== undefined) {
      desde = parseFecha(desdeStr);
      if (!desde) return badRequest(res, "desde debe tener formato YYYY-MM-DD");
    }
    if (hastaStr !== undefined) {
      hasta = parseFecha(hastaStr);
      if (!hasta) return badRequest(res, "hasta debe tener formato YYYY-MM-DD");
    }
    if (desde && hasta && desde > hasta) {
      return badRequest(res, "desde no puede ser posterior a hasta");
    }

    res.json({ data: await reporteService.ventasPorDia({ desde, hasta }) });
  } catch (err) {
    next(err);
  }
}

async function topProductos(req, res, next) {
  try {
    let limite = DEFAULT_LIMITE;
    if (req.query.limite !== undefined) {
      limite = Number(req.query.limite);
      if (!Number.isInteger(limite) || limite < 1) {
        return badRequest(res, "limite debe ser un entero >= 1");
      }
      if (limite > MAX_LIMITE) limite = MAX_LIMITE;
    }
    res.json({ data: await reporteService.topProductos({ limite }) });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumen, ventasPorDia, topProductos };
