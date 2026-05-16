"use client";

import React, { memo, useMemo, useState } from "react";

const valoresIniciales = {
  precioCompra: "",
  itp: "",
  notariaRegistroGestoria: "",
  tasacion: "",
  comisionBroker: "",
  comisionApertura: "",
  otrosGastosHipoteca: "",
  comisionAPI: "",
  comisionInmobiliaria: "",
  reforma: "",
  mueblesEquipamiento: "",
  otrosCostesIniciales: "",
  alquilerMensual: "",
  ibi: "",
  comunidad: "",
  seguroHogar: "",
  seguroVida: "",
  seguroImpago: "",
  mantenimiento: "",
  reparacionesExtra: "",
  gestionAlquilerPct: "",
  vacanciaPct: "",
  hipoteca: "",
  tipoInteres: "",
  plazoAnos: "",
  tipoMarginalIRPF: "",
  reduccionAlquilerPct: "",
  gastosNoDeducibles: "",
  aplicarAmortizacion: "no",
  valorConstruccion: "",
  porcentajeAmortizacion: "3",
  rentabilidadAlternativa: "7",
  anosInversion: "10",
  revalorizacionAnual: "2",
  gastosVentaPct: "5",
  impuestoGananciaPct: "21",
};

type Datos = typeof valoresIniciales;
type CampoClave = keyof Datos;
type CampoClaveNumerico = Exclude<CampoClave, "aplicarAmortizacion">;

function numero(valor: string | number | null | undefined): number {
  if (valor === "" || valor === null || valor === undefined) return 0;
  const n = Number(String(valor).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function euros(valor: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(valor) ? valor : 0);
}

function porcentaje(valor: number): string {
  return `${(Number.isFinite(valor) ? valor : 0).toFixed(2)}%`;
}

function limitar(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

function puntosPorRango(valor: number, minimo: number, objetivo: number): number {
  if (!Number.isFinite(valor) || valor <= minimo) return 0;
  if (valor >= objetivo) return 100;
  return ((valor - minimo) / (objetivo - minimo)) * 100;
}

type TarjetaProps = { children: React.ReactNode; className?: string };
const Tarjeta = memo(function Tarjeta({ children, className = "" }: TarjetaProps) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
});

type CampoProps = {
  label: string;
  campo: CampoClaveNumerico;
  value: string;
  onChange: (campo: CampoClave, value: string) => void;
  suffix?: string;
  placeholder?: string;
};

const Campo = memo(function Campo({ label, campo, value, onChange, suffix = "€", placeholder = "0" }: CampoProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(campo, e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-14 text-slate-900 shadow-sm outline-none focus:border-slate-500"
        />
        <span className="absolute right-3 top-2.5 text-sm text-slate-400">{suffix}</span>
      </div>
    </div>
  );
});

type MetricaProps = { titulo: string; valor: string; ayuda: string; destacado?: boolean };
const Metrica = memo(function Metrica({ titulo, valor, ayuda, destacado = false }: MetricaProps) {
  return (
    <Tarjeta className={destacado ? "border-slate-400" : ""}>
      <div className="p-4">
        <p className="text-sm text-slate-500">{titulo}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>
        <p className="mt-2 text-xs text-slate-400">{ayuda}</p>
      </div>
    </Tarjeta>
  );
});

type BarraDato = { label: string; valor: number; ayuda?: string };
const GraficoBarras = memo(function GraficoBarras({ titulo, descripcion, datos }: { titulo: string; descripcion: string; datos: BarraDato[] }) {
  const maximo = Math.max(...datos.map((d) => Math.abs(d.valor)), 1);

  return (
    <Tarjeta>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
        <div className="mt-4 space-y-4">
          {datos.map((dato) => {
            const ancho = limitar((Math.abs(dato.valor) / maximo) * 100, 3, 100);
            const negativo = dato.valor < 0;
            return (
              <div key={dato.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{dato.label}</span>
                  <span className={negativo ? "font-semibold text-red-700" : "font-semibold text-slate-900"}>{euros(dato.valor)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className={`h-3 rounded-full ${negativo ? "bg-red-400" : "bg-slate-700"}`} style={{ width: `${ancho}%` }} />
                </div>
                {dato.ayuda ? <p className="mt-1 text-xs text-slate-500">{dato.ayuda}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Tarjeta>
  );
});

const SelectorAmortizacion = memo(function SelectorAmortizacion({ value, onChange }: { value: string; onChange: (campo: CampoClave, value: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-600">Aplicar amortización fiscal</label>
      <select
        value={value}
        onChange={(e) => onChange("aplicarAmortizacion", e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-slate-500"
      >
        <option value="no">No aplicar</option>
        <option value="si">Sí, aplicar</option>
      </select>
    </div>
  );
});

function calcular(datos: Datos) {
  const precioCompra = numero(datos.precioCompra);
  const itp = numero(datos.itp);
  const notaria = numero(datos.notariaRegistroGestoria);
  const gastosHipoteca = numero(datos.tasacion) + numero(datos.comisionBroker) + numero(datos.comisionApertura) + numero(datos.otrosGastosHipoteca);
  const comisiones = numero(datos.comisionAPI) + numero(datos.comisionInmobiliaria);
  const puestaMarcha = numero(datos.reforma) + numero(datos.mueblesEquipamiento) + numero(datos.otrosCostesIniciales);
  const costeCompra = precioCompra + itp + notaria + gastosHipoteca + comisiones;
  const costeTotal = costeCompra + puestaMarcha;
  const hipoteca = numero(datos.hipoteca);
  const capitalPropio = Math.max(costeTotal - hipoteca, 0);

  const alquilerMensual = numero(datos.alquilerMensual);
  const ingresosBrutosAnuales = alquilerMensual * 12;
  const vacancia = ingresosBrutosAnuales * (numero(datos.vacanciaPct) / 100);
  const gestion = ingresosBrutosAnuales * (numero(datos.gestionAlquilerPct) / 100);

  const gastosOperativosAnuales =
    numero(datos.ibi) +
    numero(datos.comunidad) +
    numero(datos.seguroHogar) +
    numero(datos.seguroVida) +
    numero(datos.seguroImpago) +
    numero(datos.mantenimiento) +
    numero(datos.reparacionesExtra) +
    vacancia +
    gestion;

  const noiAnual = ingresosBrutosAnuales - gastosOperativosAnuales;
  const interesMensual = numero(datos.tipoInteres) / 100 / 12;
  const pagos = Math.max(numero(datos.plazoAnos) * 12, 1);
  const cuotaHipoteca = hipoteca > 0 && numero(datos.plazoAnos) > 0 ? (interesMensual > 0 ? (hipoteca * interesMensual) / (1 - Math.pow(1 + interesMensual, -pagos)) : hipoteca / pagos) : 0;
  const cuotaAnual = cuotaHipoteca * 12;

  const cashflowAnualPreIRPF = noiAnual - cuotaAnual;
  const cashflowMensualPreIRPF = cashflowAnualPreIRPF / 12;

  const interesesPrimerAno = hipoteca * (numero(datos.tipoInteres) / 100);
  const amortizacionFiscalAnual = datos.aplicarAmortizacion === "si" ? numero(datos.valorConstruccion) * (numero(datos.porcentajeAmortizacion) / 100) : 0;
  const gastosDeduciblesEstimados = Math.max(gastosOperativosAnuales + interesesPrimerAno + amortizacionFiscalAnual - numero(datos.gastosNoDeducibles), 0);
  const rendimientoFiscalPrevio = ingresosBrutosAnuales - gastosDeduciblesEstimados;
  const baseReducida = rendimientoFiscalPrevio > 0 ? rendimientoFiscalPrevio * (1 - numero(datos.reduccionAlquilerPct) / 100) : rendimientoFiscalPrevio;
  const impuestoIRPF = Math.max(baseReducida, 0) * (numero(datos.tipoMarginalIRPF) / 100);
  const cashflowAnualPostIRPF = cashflowAnualPreIRPF - impuestoIRPF;
  const cashflowMensualPostIRPF = cashflowAnualPostIRPF / 12;

  const rentabilidadBruta = costeTotal > 0 ? (ingresosBrutosAnuales / costeTotal) * 100 : 0;
  const rentabilidadNeta = costeTotal > 0 ? (noiAnual / costeTotal) * 100 : 0;
  const roePreIRPF = capitalPropio > 0 ? (cashflowAnualPreIRPF / capitalPropio) * 100 : 0;
  const roePostIRPF = capitalPropio > 0 ? (cashflowAnualPostIRPF / capitalPropio) * 100 : 0;
  const roce = capitalPropio > 0 ? (noiAnual / capitalPropio) * 100 : 0;
  const ltvCompra = precioCompra > 0 ? (hipoteca / precioCompra) * 100 : 0;
  const ltvCosteTotal = costeTotal > 0 ? (hipoteca / costeTotal) * 100 : 0;
  const ratioCuotaAlquiler = alquilerMensual > 0 ? (cuotaHipoteca / alquilerMensual) * 100 : 0;
  const margenSeguridadMensual = alquilerMensual - cuotaHipoteca - gastosOperativosAnuales / 12;
  const alquilerMinimoBreakEven = cuotaHipoteca + gastosOperativosAnuales / 12;

  const anos = numero(datos.anosInversion);
  const valorFuturoAlternativa = capitalPropio * Math.pow(1 + numero(datos.rentabilidadAlternativa) / 100, anos);
  const cashflowTotal = cashflowAnualPostIRPF * anos;
  const valorFuturoVenta = precioCompra * Math.pow(1 + numero(datos.revalorizacionAnual) / 100, anos);
  const gastosVenta = valorFuturoVenta * (numero(datos.gastosVentaPct) / 100);
  const impuestoVenta = Math.max(valorFuturoVenta - precioCompra, 0) * (numero(datos.impuestoGananciaPct) / 100);
  const beneficioNetoVenta = valorFuturoVenta - gastosVenta - impuestoVenta;
  const valorTotalInmueble = beneficioNetoVenta + cashflowTotal;
  const diferenciaVsAlternativa = valorTotalInmueble - valorFuturoAlternativa;

  return {
    precioCompra,
    itp,
    notaria,
    gastosHipoteca,
    comisiones,
    puestaMarcha,
    costeCompra,
    costeTotal,
    capitalPropio,
    ingresosBrutosAnuales,
    vacancia,
    gastosOperativosAnuales,
    noiAnual,
    cuotaHipoteca,
    cuotaAnual,
    cashflowAnualPreIRPF,
    cashflowMensualPreIRPF,
    interesesPrimerAno,
    amortizacionFiscalAnual,
    gastosDeduciblesEstimados,
    rendimientoFiscalPrevio,
    baseReducida,
    impuestoIRPF,
    cashflowAnualPostIRPF,
    cashflowMensualPostIRPF,
    rentabilidadBruta,
    rentabilidadNeta,
    roePreIRPF,
    roePostIRPF,
    roce,
    ltvCompra,
    ltvCosteTotal,
    ratioCuotaAlquiler,
    margenSeguridadMensual,
    alquilerMinimoBreakEven,
    valorFuturoAlternativa,
    cashflowTotal,
    valorFuturoVenta,
    gastosVenta,
    impuestoVenta,
    beneficioNetoVenta,
    valorTotalInmueble,
    diferenciaVsAlternativa,
  };
}

export default function CalculadoraRentabilidadInmobiliaria() {
  const [datos, setDatos] = useState<Datos>(valoresIniciales);
  const [modoAvanzado, setModoAvanzado] = useState(false);

  function actualizar(campo: CampoClave, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function limpiarCalculadora() {
    setDatos(valoresIniciales);
  }

  const r = useMemo(() => calcular(datos), [datos]);

  const scoreRapido = useMemo(() => {
    const scoreCashflow = puntosPorRango(r.cashflowMensualPreIRPF, 0, 250);
    const scoreRentabilidadNeta = puntosPorRango(r.rentabilidadNeta, 3, 7);
    const scoreRoe = puntosPorRango(r.roePreIRPF, 0, 12);
    const scoreCuotaAlquiler = r.ratioCuotaAlquiler <= 0 ? 0 : r.ratioCuotaAlquiler <= 40 ? 100 : r.ratioCuotaAlquiler <= 55 ? 70 : r.ratioCuotaAlquiler <= 70 ? 40 : 10;
    const scoreMargen = puntosPorRango(r.margenSeguridadMensual, 0, 250);
    const total = Math.round(scoreCashflow * 0.3 + scoreRentabilidadNeta * 0.25 + scoreRoe * 0.25 + scoreCuotaAlquiler * 0.1 + scoreMargen * 0.1);
    const decision = total >= 75 ? "Comprar / reservar si la visita confirma" : total >= 55 ? "Negociar o analizar mejor" : "No comprar con estos números";
    const color = total >= 75 ? "text-emerald-700" : total >= 55 ? "text-amber-700" : "text-red-700";
    const fondo = total >= 75 ? "bg-emerald-50 border-emerald-200" : total >= 55 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
    const explicacion = total >= 75 ? "La operación parece atractiva antes de impuestos. Si la visita y la documentación confirman los datos, tendría sentido avanzar." : total >= 55 ? "La operación no está clara. Puede tener sentido, pero deberías negociar precio, revisar gastos o confirmar alquiler real." : "La operación parece débil. Salvo rebaja clara o mejora del alquiler, lo prudente sería descartarla.";
    return { total, decision, color, fondo, explicacion };
  }, [r]);

  const score = useMemo(() => {
    const scoreCashflow = puntosPorRango(r.cashflowMensualPostIRPF, 0, 250);
    const scoreRentabilidadNeta = puntosPorRango(r.rentabilidadNeta, 3, 7);
    const scoreRoe = puntosPorRango(r.roePostIRPF, 0, 12);
    const scoreLtv = r.ltvCompra <= 0 ? 0 : r.ltvCompra <= 75 ? 100 : r.ltvCompra <= 90 ? 60 : 25;
    const scoreCuotaAlquiler = r.ratioCuotaAlquiler <= 0 ? 0 : r.ratioCuotaAlquiler <= 40 ? 100 : r.ratioCuotaAlquiler <= 55 ? 70 : r.ratioCuotaAlquiler <= 70 ? 40 : 10;
    const scoreMargen = puntosPorRango(r.margenSeguridadMensual, 0, 250);
    const total = Math.round(scoreCashflow * 0.25 + scoreRentabilidadNeta * 0.2 + scoreRoe * 0.2 + scoreLtv * 0.1 + scoreCuotaAlquiler * 0.15 + scoreMargen * 0.1);
    const decision = total >= 75 ? "Comprar / avanzar a due diligence" : total >= 55 ? "Analizar más / negociar" : "Descartar o renegociar fuerte";
    const color = total >= 75 ? "text-emerald-700" : total >= 55 ? "text-amber-700" : "text-red-700";
    const fondo = total >= 75 ? "bg-emerald-50 border-emerald-200" : total >= 55 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
    return { total, evPct: limitar(total - 50, -50, 50), decision, color, fondo, scoreCashflow, scoreRentabilidadNeta, scoreRoe, scoreLtv, scoreCuotaAlquiler, scoreMargen };
  }, [r]);

  const escenarios = useMemo(() => {
    function calcularEscenario(alquilerFactor: number, vacanciaExtra: number, tipoExtra: number) {
      const copia: Datos = { ...datos };
      copia.alquilerMensual = String(numero(datos.alquilerMensual) * alquilerFactor);
      copia.vacanciaPct = String(Math.max(numero(datos.vacanciaPct) + vacanciaExtra, 0));
      copia.tipoInteres = String(Math.max(numero(datos.tipoInteres) + tipoExtra, 0));
      const res = calcular(copia);
      return { alquiler: numero(copia.alquilerMensual), vacanciaPct: numero(copia.vacanciaPct), tipoInteres: numero(copia.tipoInteres), cashflow: res.cashflowMensualPostIRPF };
    }
    return {
      pesimista: calcularEscenario(0.9, 5, 1),
      base: calcularEscenario(1, 0, 0),
      optimista: calcularEscenario(1.1, -Math.min(numero(datos.vacanciaPct), 5), 0),
    };
  }, [datos]);

  const interpretacion = useMemo(() => {
    const fortalezas: string[] = [];
    const alertas: string[] = [];
    const acciones: string[] = [];
    if (score.scoreCashflow >= 70) fortalezas.push("Buen cash-flow mensual después de impuestos.");
    if (score.scoreRentabilidadNeta >= 70) fortalezas.push("La rentabilidad neta operativa es atractiva.");
    if (score.scoreRoe >= 70) fortalezas.push("Tu dinero propio trabaja con buena rentabilidad.");
    if (score.scoreCashflow < 40) { alertas.push("El cash-flow mensual es bajo o negativo."); acciones.push("Negocia precio, mejora financiación o sube alquiler objetivo."); }
    if (score.scoreRentabilidadNeta < 40) { alertas.push("La rentabilidad neta operativa es débil."); acciones.push("Revisa si el coste total del proyecto es demasiado alto."); }
    if (score.scoreRoe < 40) { alertas.push("El retorno sobre tu dinero propio no compensa bien."); acciones.push("Reduce capital inmovilizado o busca mayor rentabilidad."); }
    return {
      resumen: score.total >= 75 ? "La inversión parece sólida, pendiente de due diligence." : score.total >= 55 ? "La inversión puede tener sentido, pero necesita análisis o negociación." : "La inversión no parece suficientemente atractiva con los datos actuales.",
      fortalezas: fortalezas.length ? fortalezas : ["Todavía no hay fortalezas claras con los datos introducidos."],
      alertas: alertas.length ? alertas : ["No aparecen alertas graves en las métricas principales."],
      acciones: acciones.length ? Array.from(new Set(acciones)) : ["Haz due diligence legal, técnica, fiscal y de mercado antes de comprar."],
    };
  }, [score]);

  const datosGraficoCostes = [
    { label: "Compra", valor: r.precioCompra },
    { label: "Impuestos", valor: r.itp },
    { label: "Notaría/registro", valor: r.notaria },
    { label: "Hipoteca/broker", valor: r.gastosHipoteca },
    { label: "Comisiones", valor: r.comisiones },
    { label: "Reforma/muebles", valor: r.puestaMarcha },
  ].filter((d) => d.valor > 0);

  const anosRecuperacion = r.cashflowAnualPreIRPF > 0 ? r.capitalPropio / r.cashflowAnualPreIRPF : 0;
  const porcentajeRecuperacion = anosRecuperacion > 0 ? limitar((1 / anosRecuperacion) * 100, 0, 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏠 Calculadora de rentabilidad inmobiliaria</h1>
            <p className="mt-2 text-slate-600">Empieza con un análisis rápido antes de impuestos. Activa el modo avanzado para fiscalidad, escenarios, coste de oportunidad, venta y gráficos.</p>
            <div className="mt-4 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button onClick={() => setModoAvanzado(false)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${!modoAvanzado ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Análisis rápido</button>
              <button onClick={() => setModoAvanzado(true)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${modoAvanzado ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Análisis avanzado</button>
            </div>
          </div>
          <button onClick={limpiarCalculadora} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100">Limpiar calculadora</button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            {!modoAvanzado ? (
              <>
                <Tarjeta className="border-slate-300">
                  <div className="space-y-5 p-5">
                    <div>
                      <h2 className="text-xl font-semibold">1️⃣ Compra y financiación</h2>
                      <p className="mt-1 text-sm text-slate-600">Datos imprescindibles para saber cuánto cuesta entrar y cuánto pesa la deuda.</p>
                    </div>
                    <Campo label="Precio de compra" campo="precioCompra" value={datos.precioCompra} onChange={actualizar} />
                    <Campo label="ITP / impuestos de compra" campo="itp" value={datos.itp} onChange={actualizar} />
                    <Campo label="Notaría, registro y gestoría" campo="notariaRegistroGestoria" value={datos.notariaRegistroGestoria} onChange={actualizar} />
                    <Campo label="Comisión inmobiliaria / API" campo="comisionAPI" value={datos.comisionAPI} onChange={actualizar} />
                    <Campo label="Importe de hipoteca" campo="hipoteca" value={datos.hipoteca} onChange={actualizar} />
                    <Campo label="Tipo de interés anual" campo="tipoInteres" value={datos.tipoInteres} onChange={actualizar} suffix="%" />
                    <Campo label="Plazo" campo="plazoAnos" value={datos.plazoAnos} onChange={actualizar} suffix="años" />
                  </div>
                </Tarjeta>

                <Tarjeta>
                  <div className="space-y-5 p-5">
                    <div>
                      <h2 className="text-xl font-semibold">2️⃣ Puesta en marcha</h2>
                      <p className="mt-1 text-sm text-slate-600">Incluye lo necesario para poder alquilar el inmueble.</p>
                    </div>
                    <Campo label="Reforma" campo="reforma" value={datos.reforma} onChange={actualizar} />
                    <Campo label="Muebles / equipamiento" campo="mueblesEquipamiento" value={datos.mueblesEquipamiento} onChange={actualizar} />
                    <Campo label="Otros costes iniciales" campo="otrosCostesIniciales" value={datos.otrosCostesIniciales} onChange={actualizar} />
                  </div>
                </Tarjeta>

                <Tarjeta>
                  <div className="space-y-5 p-5">
                    <div>
                      <h2 className="text-xl font-semibold">3️⃣ Ingresos y gastos</h2>
                      <p className="mt-1 text-sm text-slate-600">Aquí está la clave: cuánto entra, cuánto sale y cuánto queda realmente cada mes.</p>
                    </div>
                    <Campo label="Alquiler mensual esperado" campo="alquilerMensual" value={datos.alquilerMensual} onChange={actualizar} />
                    <Campo label="Gastos anuales estimados" campo="mantenimiento" value={datos.mantenimiento} onChange={actualizar} />
                    <p className="-mt-3 text-xs text-slate-500">Incluye IBI, comunidad, seguros, mantenimiento y pequeños imprevistos.</p>
                    <Campo label="Vacancia estimada" campo="vacanciaPct" value={datos.vacanciaPct} onChange={actualizar} suffix="%" />
                    <p className="-mt-3 text-xs text-slate-500">Muy importante: evita sobreestimar la rentabilidad asumiendo que siempre estará alquilado.</p>
                  </div>
                </Tarjeta>
              </>
            ) : (
              <>
                <Tarjeta>
                  <div className="space-y-5 p-5">
                    <h2 className="text-xl font-semibold">1️⃣ Compra y financiación</h2>
                    <Campo label="Precio de compra" campo="precioCompra" value={datos.precioCompra} onChange={actualizar} />
                    <Campo label="ITP / impuestos de compra" campo="itp" value={datos.itp} onChange={actualizar} />
                    <Campo label="Notaría, registro y gestoría" campo="notariaRegistroGestoria" value={datos.notariaRegistroGestoria} onChange={actualizar} />
                    <Campo label="Tasación" campo="tasacion" value={datos.tasacion} onChange={actualizar} />
                    <Campo label="Comisión Broker Hipotecario" campo="comisionBroker" value={datos.comisionBroker} onChange={actualizar} />
                    <Campo label="Comisión apertura hipoteca" campo="comisionApertura" value={datos.comisionApertura} onChange={actualizar} />
                    <Campo label="Otros gastos hipoteca" campo="otrosGastosHipoteca" value={datos.otrosGastosHipoteca} onChange={actualizar} />
                    <Campo label="Comisión API" campo="comisionAPI" value={datos.comisionAPI} onChange={actualizar} />
                    <Campo label="Comisión inmobiliaria" campo="comisionInmobiliaria" value={datos.comisionInmobiliaria} onChange={actualizar} />
                    <div className="border-t pt-4 space-y-4">
                      <Campo label="Importe de hipoteca" campo="hipoteca" value={datos.hipoteca} onChange={actualizar} />
                      <Campo label="Tipo de interés anual" campo="tipoInteres" value={datos.tipoInteres} onChange={actualizar} suffix="%" />
                      <Campo label="Plazo" campo="plazoAnos" value={datos.plazoAnos} onChange={actualizar} suffix="años" />
                    </div>
                  </div>
                </Tarjeta>

                <Tarjeta>
                  <div className="space-y-5 p-5">
                    <h2 className="text-xl font-semibold">2️⃣ Puesta en marcha</h2>
                    <Campo label="Reforma" campo="reforma" value={datos.reforma} onChange={actualizar} />
                    <Campo label="Muebles / equipamiento" campo="mueblesEquipamiento" value={datos.mueblesEquipamiento} onChange={actualizar} />
                    <Campo label="Otros costes iniciales" campo="otrosCostesIniciales" value={datos.otrosCostesIniciales} onChange={actualizar} />
                  </div>
                </Tarjeta>

                <Tarjeta>
                  <div className="space-y-5 p-5">
                    <h2 className="text-xl font-semibold">3️⃣ Ingresos y gastos</h2>
                    <Campo label="Alquiler mensual" campo="alquilerMensual" value={datos.alquilerMensual} onChange={actualizar} />
                    <Campo label="IBI anual" campo="ibi" value={datos.ibi} onChange={actualizar} />
                    <Campo label="Comunidad anual" campo="comunidad" value={datos.comunidad} onChange={actualizar} />
                    <Campo label="Seguro hogar anual" campo="seguroHogar" value={datos.seguroHogar} onChange={actualizar} />
                    <Campo label="Seguro vida anual" campo="seguroVida" value={datos.seguroVida} onChange={actualizar} />
                    <Campo label="Seguro / garantía impago anual" campo="seguroImpago" value={datos.seguroImpago} onChange={actualizar} />
                    <Campo label="Mantenimiento anual" campo="mantenimiento" value={datos.mantenimiento} onChange={actualizar} />
                    <Campo label="Reparaciones extra anual" campo="reparacionesExtra" value={datos.reparacionesExtra} onChange={actualizar} />
                    <Campo label="Gestión del alquiler" campo="gestionAlquilerPct" value={datos.gestionAlquilerPct} onChange={actualizar} suffix="%" />
                    <Campo label="Vacancia estimada" campo="vacanciaPct" value={datos.vacanciaPct} onChange={actualizar} suffix="%" />
                  </div>
                </Tarjeta>
              </>
            )}

            {modoAvanzado && (
              <Tarjeta>
                <div className="space-y-5 p-5">
                  <h2 className="text-xl font-semibold">4️⃣ Fiscalidad estimada</h2>
                  <Campo label="Tipo marginal IRPF" campo="tipoMarginalIRPF" value={datos.tipoMarginalIRPF} onChange={actualizar} suffix="%" />
                  <Campo label="Reducción aplicable alquiler" campo="reduccionAlquilerPct" value={datos.reduccionAlquilerPct} onChange={actualizar} suffix="%" />
                  <Campo label="Gastos no deducibles estimados" campo="gastosNoDeducibles" value={datos.gastosNoDeducibles} onChange={actualizar} />
                  <SelectorAmortizacion value={datos.aplicarAmortizacion} onChange={actualizar} />
                  <Campo label="Valor de construcción" campo="valorConstruccion" value={datos.valorConstruccion} onChange={actualizar} />
                  <Campo label="Porcentaje amortización" campo="porcentajeAmortizacion" value={datos.porcentajeAmortizacion} onChange={actualizar} suffix="%" />
                  <p className="text-xs text-slate-500">Estimación simplificada. Revísalo con asesor fiscal.</p>
                </div>
              </Tarjeta>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {!modoAvanzado && (
              <>
                <Tarjeta className={scoreRapido.fondo}>
                  <div className="p-5 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">Decisión rápida antes de impuestos</h2>
                      <p className="mt-1 text-sm text-slate-600">Pensado para usar en una visita: te da una decisión objetiva con los datos mínimos importantes.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-600">Score rápido</p>
                        <p className={`mt-1 text-4xl font-bold ${scoreRapido.color}`}>{scoreRapido.total}/100</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600">Resultado objetivo</p>
                        <p className={`mt-1 text-2xl font-bold ${scoreRapido.color}`}>{scoreRapido.decision}</p>
                        <p className="mt-2 text-sm text-slate-700">{scoreRapido.explicacion}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <Metrica titulo="Rentabilidad bruta" valor={porcentaje(r.rentabilidadBruta)} ayuda="Ingresos anuales / coste total" destacado />
                      <Metrica titulo="Cash-flow mensual" valor={euros(r.cashflowMensualPreIRPF)} ayuda="Dinero que queda al mes antes de IRPF" destacado />
                      <Metrica titulo="Rentabilidad neta" valor={porcentaje(r.rentabilidadNeta)} ayuda="NOI anual / coste total" destacado />
                      <Metrica titulo="ROE pre-IRPF" valor={porcentaje(r.roePreIRPF)} ayuda="Cash-flow anual / capital propio" destacado />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Metrica titulo="Capital propio" valor={euros(r.capitalPropio)} ayuda="Dinero aproximado que necesitas aportar" />
                      <Metrica titulo="Cuota hipotecaria" valor={euros(r.cuotaHipoteca)} ayuda="Cuota mensual estimada" />
                      <Metrica titulo="Margen seguridad" valor={euros(r.margenSeguridadMensual)} ayuda="Alquiler - cuota - gastos medios" />
                    </div>
                  </div>
                </Tarjeta>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <GraficoBarras titulo="¿Dónde se va tu dinero?" descripcion="Visualiza rápidamente qué parte del dinero necesitas para comprar, reformar y poner el inmueble en alquiler." datos={datosGraficoCostes.length ? datosGraficoCostes : [{ label: "Sin datos", valor: 0 }]} />
                  <Tarjeta>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">Recuperación de la inversión</h3>
                      <p className="mt-1 text-sm text-slate-600">Estimación simple de cuántos años tardarías en recuperar tu dinero con el cash-flow anual antes de impuestos.</p>
                      <div className="mt-5 space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Progreso estimado anual</span>
                            <span className="font-semibold text-slate-900">{anosRecuperacion > 0 ? `${anosRecuperacion.toFixed(1)} años` : "No recuperable"}</span>
                          </div>
                          <div className="h-4 rounded-full bg-slate-200">
                            <div className={`h-4 rounded-full ${anosRecuperacion <= 10 ? "bg-emerald-500" : anosRecuperacion <= 15 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${porcentajeRecuperacion}%` }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                          <p><strong>Capital propio:</strong> {euros(r.capitalPropio)}</p>
                          <p><strong>Cash-flow anual:</strong> {euros(r.cashflowAnualPreIRPF)}</p>
                        </div>
                        <p className="text-xs text-slate-500">Cuantos menos años necesites para recuperar tu inversión, más eficiente suele ser la operación.</p>
                      </div>
                    </div>
                  </Tarjeta>
                </div>
              </>
            )}

            {modoAvanzado && (
              <>
                <Tarjeta className={score.fondo}>
                  <div className="p-5">
                    <p className="text-sm text-slate-600"><strong>¿Qué significa este score?</strong> Es una nota de 0 a 100 que resume si la inversión es buena o mala teniendo en cuenta rentabilidad, riesgo y seguridad.</p>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div><p className="text-sm text-slate-600">Score inversión</p><p className={`text-4xl font-bold ${score.color}`}>{score.total}/100</p></div>
                      <div><p className="text-sm text-slate-600">EV estimado</p><p className={`text-4xl font-bold ${score.color}`}>{score.evPct >= 0 ? "+" : ""}{score.evPct}%</p></div>
                      <div className="md:col-span-2"><p className="text-sm text-slate-600">Decisión sugerida</p><p className={`text-2xl font-bold ${score.color}`}>{score.decision}</p></div>
                    </div>
                  </div>
                </Tarjeta>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Coste de compra" valor={euros(r.costeCompra)} ayuda="Precio + impuestos + notaría + gastos + comisiones" />
                  <Metrica titulo="Puesta en marcha" valor={euros(r.puestaMarcha)} ayuda="Reforma + muebles + otros costes" />
                  <Metrica titulo="Coste total" valor={euros(r.costeTotal)} ayuda="Capital necesario total" destacado />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Capital propio" valor={euros(r.capitalPropio)} ayuda="Coste total menos hipoteca" destacado />
                  <Metrica titulo="Cuota hipotecaria" valor={euros(r.cuotaHipoteca)} ayuda="Cuota mensual estimada" />
                  <Metrica titulo="LTV compra" valor={porcentaje(r.ltvCompra)} ayuda="Hipoteca / precio de compra" />
                </div>

                <Tarjeta className="border-sky-200 bg-sky-50">
                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-sky-900">Resultados PRE-IRPF</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Metrica titulo="Cash-flow mensual pre-IRPF" valor={euros(r.cashflowMensualPreIRPF)} ayuda="NOI mensual menos hipoteca" destacado />
                      <Metrica titulo="Rentabilidad neta operativa" valor={porcentaje(r.rentabilidadNeta)} ayuda="NOI anual / coste total" destacado />
                      <Metrica titulo="ROE pre-IRPF" valor={porcentaje(r.roePreIRPF)} ayuda="Cash-flow anual / capital propio" destacado />
                    </div>
                  </div>
                </Tarjeta>

                <Tarjeta className="border-emerald-200 bg-emerald-50">
                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-emerald-900">Resultados POST-IRPF</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Metrica titulo="Cash-flow mensual post-IRPF" valor={euros(r.cashflowMensualPostIRPF)} ayuda="Después de impuestos estimados" destacado />
                      <Metrica titulo="ROE post-IRPF" valor={porcentaje(r.roePostIRPF)} ayuda="Cash-flow anual post-IRPF / capital propio" destacado />
                      <Metrica titulo="IRPF estimado anual" valor={euros(r.impuestoIRPF)} ayuda="Estimación fiscal simplificada" />
                    </div>
                  </div>
                </Tarjeta>

                <Tarjeta className={score.fondo}>
                  <div className="p-5">
                    <h2 className="mb-3 text-xl font-semibold">Interpretación automática del score</h2>
                    <p className="mb-4 text-sm text-slate-700">{interpretacion.resumen}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div><h3 className="font-semibold text-emerald-800">Fortalezas</h3><ul className="mt-2 space-y-1 text-sm">{interpretacion.fortalezas.map((x) => <li key={x}>✅ {x}</li>)}</ul></div>
                      <div><h3 className="font-semibold text-red-800">Alertas</h3><ul className="mt-2 space-y-1 text-sm">{interpretacion.alertas.map((x) => <li key={x}>⚠️ {x}</li>)}</ul></div>
                      <div><h3 className="font-semibold text-slate-800">Qué haría ahora</h3><ul className="mt-2 space-y-1 text-sm">{interpretacion.acciones.map((x) => <li key={x}>➡️ {x}</li>)}</ul></div>
                    </div>
                  </div>
                </Tarjeta>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <GraficoBarras titulo="Composición del coste total" descripcion="Dónde se concentra el dinero inicial necesario." datos={datosGraficoCostes.length ? datosGraficoCostes : [{ label: "Sin datos", valor: 0 }]} />
                  <GraficoBarras titulo="Pre-IRPF vs Post-IRPF" descripcion="Impacto fiscal estimado en el cash-flow mensual." datos={[{ label: "Pre-IRPF", valor: r.cashflowMensualPreIRPF }, { label: "Post-IRPF", valor: r.cashflowMensualPostIRPF }]} />
                </div>

                <Tarjeta>
                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold">Coste de oportunidad</h2>
                    <p className="text-sm text-slate-600">Compara esta inversión con otras alternativas, por ejemplo bolsa.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Campo label="Rentabilidad alternativa anual" campo="rentabilidadAlternativa" value={datos.rentabilidadAlternativa} onChange={actualizar} suffix="%" />
                      <Campo label="Horizonte de inversión" campo="anosInversion" value={datos.anosInversion} onChange={actualizar} suffix="años" />
                      <Campo label="Revalorización anual inmueble" campo="revalorizacionAnual" value={datos.revalorizacionAnual} onChange={actualizar} suffix="%" />
                      <Campo label="Gastos de venta" campo="gastosVentaPct" value={datos.gastosVentaPct} onChange={actualizar} suffix="%" />
                      <Campo label="Impuesto ganancia venta" campo="impuestoGananciaPct" value={datos.impuestoGananciaPct} onChange={actualizar} suffix="%" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Metrica titulo="Alternativa" valor={euros(r.valorFuturoAlternativa)} ayuda="Capital propio a rentabilidad alternativa" />
                      <Metrica titulo="Inmueble" valor={euros(r.valorTotalInmueble)} ayuda="Venta neta + cash-flow acumulado" />
                      <Metrica titulo="Diferencia" valor={euros(r.diferenciaVsAlternativa)} ayuda="Inmueble - alternativa" destacado />
                    </div>
                  </div>
                </Tarjeta>

                <GraficoBarras titulo="Inmueble vs inversión alternativa" descripcion="Comparación visual del valor futuro estimado." datos={[{ label: "Alternativa", valor: r.valorFuturoAlternativa }, { label: "Inmueble", valor: r.valorTotalInmueble }]} />

                <Tarjeta>
                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold">Escenario de salida / venta</h2>
                    <p className="text-sm text-slate-600">Estima cuánto ganarías cuando vendas el inmueble en el futuro.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Metrica titulo="Valor futuro inmueble" valor={euros(r.valorFuturoVenta)} ayuda="Precio capitalizado por revalorización" />
                      <Metrica titulo="Gastos venta" valor={euros(r.gastosVenta)} ayuda="Gastos estimados" />
                      <Metrica titulo="Impuesto venta" valor={euros(r.impuestoVenta)} ayuda="Sobre ganancia bruta" />
                    </div>
                  </div>
                </Tarjeta>

                <GraficoBarras
                  titulo="Cash-flow mensual por escenario"
                  descripcion="Dinero que quedaría al mes en escenarios pesimista, base y optimista."
                  datos={[
                    { label: "Pesimista", valor: escenarios.pesimista.cashflow, ayuda: "Alquiler -10%, vacancia +5%, tipo +1%" },
                    { label: "Base", valor: escenarios.base.cashflow, ayuda: "Condiciones actuales" },
                    { label: "Optimista", valor: escenarios.optimista.cashflow, ayuda: "Alquiler +10%, menor vacancia" },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
