"use client";

import React, { useMemo, useState, memo } from "react";

const valoresIniciales = {
  // Compra
  precioCompra: "",
  itp: "",
  notariaRegistroGestoria: "",

  // Gastos hipotecarios separados
  tasacion: "",
  comisionBroker: "",
  comisionApertura: "",
  otrosGastosHipoteca: "",

  // Intermediación
  comisionAPI: "",
  comisionInmobiliaria: "",

  // Puesta en marcha
  reforma: "",
  mueblesEquipamiento: "",
  otrosCostesIniciales: "",

  // Ingresos
  alquilerMensual: "",

  // Gastos operativos
  ibi: "",
  comunidad: "",
  seguroHogar: "",
  seguroVida: "",
  seguroImpago: "",
  mantenimiento: "",
  reparacionesExtra: "",
  gestionAlquilerPct: "",
  vacanciaPct: "",

  // Financiación
  hipoteca: "",
  tipoInteres: "",
  plazoAnos: "",

  // Coste de oportunidad
  rentabilidadAlternativa: "7",
  anosInversion: "10",

  // Escenario de salida / venta
  revalorizacionAnual: "2",
  gastosVentaPct: "5",
  impuestoGananciaPct: "21",

  // Fiscalidad estimada
  tipoMarginalIRPF: "",
  reduccionAlquilerPct: "",
  gastosNoDeducibles: "",
  aplicarAmortizacion: "no",
  valorConstruccion: "",
  porcentajeAmortizacion: "3",
};

type CampoClave = keyof typeof valoresIniciales;
type CampoClaveNumerico = Exclude<CampoClave, "aplicarAmortizacion">;

function numero(valor: string | number | null | undefined): number {
  if (valor === "" || valor === null || valor === undefined) return 0;
  const limpio = String(valor).replace(",", ".");
  const n = Number(limpio);
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

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

function puntosPorRango(valor: number, minimo: number, objetivo: number): number {
  if (!Number.isFinite(valor)) return 0;
  if (valor <= minimo) return 0;
  if (valor >= objetivo) return 100;
  return ((valor - minimo) / (objetivo - minimo)) * 100;
}

type TarjetaProps = {
  children: React.ReactNode;
  className?: string;
};

const Tarjeta = memo(function Tarjeta({ children, className = "" }: TarjetaProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
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

type MetricaProps = {
  titulo: string;
  valor: string;
  ayuda: string;
  destacado?: boolean;
};

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

type BarraDato = {
  label: string;
  valor: number;
  ayuda?: string;
};

type GraficoBarrasProps = {
  titulo: string;
  descripcion: string;
  datos: BarraDato[];
  formato?: "eur" | "pct";
};

const GraficoBarras = memo(function GraficoBarras({ titulo, descripcion, datos, formato = "eur" }: GraficoBarrasProps) {
  const maximo = Math.max(...datos.map((d) => Math.abs(d.valor)), 1);

  function formatear(valor: number) {
    return formato === "pct" ? porcentaje(valor) : euros(valor);
  }

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
                  <span className={negativo ? "font-semibold text-red-700" : "font-semibold text-slate-900"}>{formatear(dato.valor)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className={`h-3 rounded-full ${negativo ? "bg-red-400" : "bg-slate-700"}`}
                    style={{ width: `${ancho}%` }}
                  />
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

type SelectorAmortizacionProps = {
  value: string;
  onChange: (campo: CampoClave, value: string) => void;
};

const SelectorAmortizacion = memo(function SelectorAmortizacion({ value, onChange }: SelectorAmortizacionProps) {
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

export default function CalculadoraRentabilidadInmobiliaria() {
  const [datos, setDatos] = useState(valoresIniciales);

  function actualizar(campo: CampoClave, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function limpiarCalculadora() {
    setDatos(valoresIniciales);
  }

  const resultados = useMemo(() => {
    const precioCompra = numero(datos.precioCompra);
    const itp = numero(datos.itp);
    const notariaRegistroGestoria = numero(datos.notariaRegistroGestoria);
    const tasacion = numero(datos.tasacion);
    const comisionBroker = numero(datos.comisionBroker);
    const comisionApertura = numero(datos.comisionApertura);
    const otrosGastosHipoteca = numero(datos.otrosGastosHipoteca);
    const comisionAPI = numero(datos.comisionAPI);
    const comisionInmobiliaria = numero(datos.comisionInmobiliaria);
    const reforma = numero(datos.reforma);
    const mueblesEquipamiento = numero(datos.mueblesEquipamiento);
    const otrosCostesIniciales = numero(datos.otrosCostesIniciales);
    const alquilerMensual = numero(datos.alquilerMensual);
    const ibi = numero(datos.ibi);
    const comunidad = numero(datos.comunidad);
    const seguroHogar = numero(datos.seguroHogar);
    const seguroVida = numero(datos.seguroVida);
    const seguroImpago = numero(datos.seguroImpago);
    const mantenimiento = numero(datos.mantenimiento);
    const reparacionesExtra = numero(datos.reparacionesExtra);
    const gestionAlquilerPct = numero(datos.gestionAlquilerPct);
    const vacanciaPct = numero(datos.vacanciaPct);
    const hipoteca = numero(datos.hipoteca);
    const tipoInteres = numero(datos.tipoInteres);
    const plazoAnos = numero(datos.plazoAnos);
    const tipoMarginalIRPF = numero(datos.tipoMarginalIRPF);
    const reduccionAlquilerPct = numero(datos.reduccionAlquilerPct);
    const gastosNoDeducibles = numero(datos.gastosNoDeducibles);
    const aplicarAmortizacion = datos.aplicarAmortizacion === "si";
    const valorConstruccion = numero(datos.valorConstruccion);
    const porcentajeAmortizacion = numero(datos.porcentajeAmortizacion);

    const costeCompra =
      precioCompra +
      itp +
      notariaRegistroGestoria +
      tasacion +
      comisionBroker +
      comisionApertura +
      otrosGastosHipoteca +
      comisionAPI +
      comisionInmobiliaria;

    const costePuestaMarcha = reforma + mueblesEquipamiento + otrosCostesIniciales;
    const costeTotal = costeCompra + costePuestaMarcha;
    const capitalPropio = Math.max(costeTotal - hipoteca, 0);

    const rentabilidadAlternativa = numero(datos.rentabilidadAlternativa);
    const anosInversion = numero(datos.anosInversion);
    const revalorizacionAnual = numero(datos.revalorizacionAnual);
    const gastosVentaPct = numero(datos.gastosVentaPct);
    const impuestoGananciaPct = numero(datos.impuestoGananciaPct);

    const ingresosBrutosAnuales = alquilerMensual * 12;
    const vacancia = ingresosBrutosAnuales * (vacanciaPct / 100);
    const gestionAlquiler = ingresosBrutosAnuales * (gestionAlquilerPct / 100);

    const gastosOperativosAnuales =
      ibi +
      comunidad +
      seguroHogar +
      seguroVida +
      seguroImpago +
      mantenimiento +
      reparacionesExtra +
      vacancia +
      gestionAlquiler;

    const noiAnual = ingresosBrutosAnuales - gastosOperativosAnuales;
    const interesMensual = tipoInteres / 100 / 12;
    const numPagos = Math.max(plazoAnos * 12, 1);

    let cuotaHipoteca = 0;
    if (hipoteca > 0 && plazoAnos > 0) {
      cuotaHipoteca =
        interesMensual > 0
          ? (hipoteca * interesMensual) / (1 - Math.pow(1 + interesMensual, -numPagos))
          : hipoteca / numPagos;
    }

    const cuotaAnual = cuotaHipoteca * 12;
    const cashflowAnualAntesImpuestos = noiAnual - cuotaAnual;
    const cashflowMensualAntesImpuestos = cashflowAnualAntesImpuestos / 12;

    const interesesPrimerAno = hipoteca > 0 ? hipoteca * (tipoInteres / 100) : 0;
    const amortizacionFiscalAnual = aplicarAmortizacion ? valorConstruccion * (porcentajeAmortizacion / 100) : 0;
    const gastosDeduciblesEstimados = Math.max(gastosOperativosAnuales + interesesPrimerAno + amortizacionFiscalAnual - gastosNoDeducibles, 0);
    const rendimientoNetoFiscalPrevio = ingresosBrutosAnuales - gastosDeduciblesEstimados;
    const baseReducida = rendimientoNetoFiscalPrevio > 0 ? rendimientoNetoFiscalPrevio * (1 - reduccionAlquilerPct / 100) : rendimientoNetoFiscalPrevio;
    const impuestoIRPFEstimado = Math.max(baseReducida, 0) * (tipoMarginalIRPF / 100);
    const cashflowAnualDespuesImpuestos = cashflowAnualAntesImpuestos - impuestoIRPFEstimado;
    const cashflowMensualDespuesImpuestos = cashflowAnualDespuesImpuestos / 12;

    const valorFuturoAlternativa = capitalPropio * Math.pow(1 + rentabilidadAlternativa / 100, anosInversion);
    const cashflowTotal = cashflowAnualDespuesImpuestos * anosInversion;

    const valorFuturoVenta = precioCompra * Math.pow(1 + revalorizacionAnual / 100, anosInversion);
    const gastosVenta = valorFuturoVenta * (gastosVentaPct / 100);
    const gananciaBrutaVenta = valorFuturoVenta - precioCompra;
    const impuestoVenta = Math.max(gananciaBrutaVenta, 0) * (impuestoGananciaPct / 100);
    const deudaPendienteSimplificada = 0;
    const beneficioNetoVenta = valorFuturoVenta - gastosVenta - impuestoVenta - deudaPendienteSimplificada;
    const valorTotalInmueble = beneficioNetoVenta + cashflowTotal;
    const diferenciaVsAlternativa = valorTotalInmueble - valorFuturoAlternativa;

    return {
      valorFuturoAlternativa,
      cashflowTotal,
      valorFuturoVenta,
      gastosVenta,
      gananciaBrutaVenta,
      impuestoVenta,
      beneficioNetoVenta,
      valorTotalInmueble,
      diferenciaVsAlternativa,
      costeCompra,
      costePuestaMarcha,
      costeTotal,
      capitalPropio,
      ingresosBrutosAnuales,
      vacancia,
      gestionAlquiler,
      gastosOperativosAnuales,
      noiAnual,
      cuotaHipoteca,
      cuotaAnual,
      cashflowMensualAntesImpuestos,
      cashflowAnualAntesImpuestos,
      interesesPrimerAno,
      amortizacionFiscalAnual,
      gastosDeduciblesEstimados,
      rendimientoNetoFiscalPrevio,
      baseReducida,
      impuestoIRPFEstimado,
      cashflowAnualDespuesImpuestos,
      cashflowMensualDespuesImpuestos,
      rentabilidadBruta: costeTotal > 0 ? (ingresosBrutosAnuales / costeTotal) * 100 : 0,
      rentabilidadNeta: costeTotal > 0 ? (noiAnual / costeTotal) * 100 : 0,
      roe: capitalPropio > 0 ? (cashflowAnualAntesImpuestos / capitalPropio) * 100 : 0,
      roeDespuesImpuestos: capitalPropio > 0 ? (cashflowAnualDespuesImpuestos / capitalPropio) * 100 : 0,
      cashOnCash: capitalPropio > 0 ? (cashflowAnualAntesImpuestos / capitalPropio) * 100 : 0,
      roce: capitalPropio > 0 ? (noiAnual / capitalPropio) * 100 : 0,
      ratioCuotaAlquiler: alquilerMensual > 0 ? (cuotaHipoteca / alquilerMensual) * 100 : 0,
      ltvCompra: precioCompra > 0 ? (hipoteca / precioCompra) * 100 : 0,
      ltvCosteTotal: costeTotal > 0 ? (hipoteca / costeTotal) * 100 : 0,
      gastosOperativosMensuales: gastosOperativosAnuales / 12,
      margenSeguridadMensual: alquilerMensual - cuotaHipoteca - gastosOperativosAnuales / 12,
      alquilerMinimoBreakEven: cuotaHipoteca + gastosOperativosAnuales / 12,
    };
  }, [datos]);

  const score = useMemo(() => {
    const scoreCashflow = puntosPorRango(resultados.cashflowMensualDespuesImpuestos, 0, 250);
    const scoreRentabilidadNeta = puntosPorRango(resultados.rentabilidadNeta, 3, 7);
    const scoreRoe = puntosPorRango(resultados.roeDespuesImpuestos, 0, 12);
    const scoreLtv = resultados.ltvCompra <= 0 ? 0 : resultados.ltvCompra <= 75 ? 100 : resultados.ltvCompra <= 90 ? 60 : 25;
    const scoreCuotaAlquiler = resultados.ratioCuotaAlquiler <= 0 ? 0 : resultados.ratioCuotaAlquiler <= 40 ? 100 : resultados.ratioCuotaAlquiler <= 55 ? 70 : resultados.ratioCuotaAlquiler <= 70 ? 40 : 10;
    const scoreMargen = puntosPorRango(resultados.margenSeguridadMensual, 0, 250);

    const total = Math.round(
      scoreCashflow * 0.25 +
        scoreRentabilidadNeta * 0.2 +
        scoreRoe * 0.2 +
        scoreLtv * 0.1 +
        scoreCuotaAlquiler * 0.15 +
        scoreMargen * 0.1
    );

    const evPct = limitar(Math.round(total - 50), -50, 50);

    const decision =
      total >= 75
        ? "Comprar / avanzar a due diligence"
        : total >= 55
        ? "Analizar más / negociar"
        : "Descartar o renegociar fuerte";

    const color = total >= 75 ? "text-emerald-700" : total >= 55 ? "text-amber-700" : "text-red-700";
    const fondo = total >= 75 ? "bg-emerald-50 border-emerald-200" : total >= 55 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

    return {
      total,
      evPct,
      decision,
      color,
      fondo,
      scoreCashflow: Math.round(scoreCashflow),
      scoreRentabilidadNeta: Math.round(scoreRentabilidadNeta),
      scoreRoe: Math.round(scoreRoe),
      scoreLtv: Math.round(scoreLtv),
      scoreCuotaAlquiler: Math.round(scoreCuotaAlquiler),
      scoreMargen: Math.round(scoreMargen),
    };
  }, [resultados]);

  const escenarios = useMemo(() => {
    function recalcular(alquilerFactor: number, vacanciaExtra: number, tipoExtra: number) {
      const alquiler = numero(datos.alquilerMensual) * alquilerFactor;
      const vacanciaPctEscenario = Math.max(numero(datos.vacanciaPct) + vacanciaExtra, 0);
      const tipo = Math.max(numero(datos.tipoInteres) + tipoExtra, 0);

      const ingresos = alquiler * 12;
      const vacancia = ingresos * (vacanciaPctEscenario / 100);
      const gestion = ingresos * (numero(datos.gestionAlquilerPct) / 100);

      const gastos =
        numero(datos.ibi) +
        numero(datos.comunidad) +
        numero(datos.seguroHogar) +
        numero(datos.seguroVida) +
        numero(datos.seguroImpago) +
        numero(datos.mantenimiento) +
        numero(datos.reparacionesExtra) +
        vacancia +
        gestion;

      const noi = ingresos - gastos;

      const interesMensual = tipo / 100 / 12;
      const n = Math.max(numero(datos.plazoAnos) * 12, 1);
      let cuota = 0;

      if (numero(datos.hipoteca) > 0 && numero(datos.plazoAnos) > 0) {
        cuota =
          interesMensual > 0
            ? (numero(datos.hipoteca) * interesMensual) / (1 - Math.pow(1 + interesMensual, -n))
            : numero(datos.hipoteca) / n;
      }

      const cashflowAnualPreIRPF = noi - cuota * 12;
      const interesesPrimerAnoEscenario = numero(datos.hipoteca) > 0 ? numero(datos.hipoteca) * (tipo / 100) : 0;
      const amortizacionFiscalAnualEscenario = datos.aplicarAmortizacion === "si" ? numero(datos.valorConstruccion) * (numero(datos.porcentajeAmortizacion) / 100) : 0;
      const gastosDeduciblesEstimadosEscenario = Math.max(
        gastos + interesesPrimerAnoEscenario + amortizacionFiscalAnualEscenario - numero(datos.gastosNoDeducibles),
        0
      );
      const rendimientoNetoFiscalPrevioEscenario = ingresos - gastosDeduciblesEstimadosEscenario;
      const baseReducidaEscenario =
        rendimientoNetoFiscalPrevioEscenario > 0
          ? rendimientoNetoFiscalPrevioEscenario * (1 - numero(datos.reduccionAlquilerPct) / 100)
          : rendimientoNetoFiscalPrevioEscenario;
      const impuestoIRPFEstimadoEscenario = Math.max(baseReducidaEscenario, 0) * (numero(datos.tipoMarginalIRPF) / 100);
      const cashflowAnualPostIRPF = cashflowAnualPreIRPF - impuestoIRPFEstimadoEscenario;
      const cashflowMensualPostIRPF = cashflowAnualPostIRPF / 12;

      return {
        alquiler,
        vacanciaPct: vacanciaPctEscenario,
        tipoInteres: tipo,
        noi,
        cashflowMensualPostIRPF,
      };
    }

    return {
      pesimista: recalcular(0.9, 5, 1),
      base: recalcular(1, 0, 0),
      optimista: recalcular(1.1, -Math.min(numero(datos.vacanciaPct), 5), 0),
    };
  }, [datos]);

  const estado =
    score.total >= 75
      ? {
          texto: "EV+ — Operación atractiva",
          icono: "✅",
          detalle: "La operación muestra buen equilibrio entre cash-flow, rentabilidad, apalancamiento y margen de seguridad. Siguiente paso: due diligence legal, técnica y de inquilino.",
        }
      : score.total >= 55
      ? {
          texto: "EV0 / EV+ suave — Analizar más",
          icono: "⚖️",
          detalle: "La operación puede tener sentido, pero necesita negociación, mejor financiación o confirmar que el riesgo operativo está bien cubierto.",
        }
      : {
          texto: "EV- — Descartar o renegociar",
          icono: "⚠️",
          detalle: "La operación no compensa suficientemente el capital, el riesgo o la alternativa de inversión. Revisa precio, alquiler, financiación y gastos.",
        };

  const interpretacionScore = useMemo(() => {
    const fortalezas: string[] = [];
    const alertas: string[] = [];
    const acciones: string[] = [];

    if (score.scoreCashflow >= 70) fortalezas.push("Buen cash-flow mensual después de impuestos.");
    if (score.scoreRentabilidadNeta >= 70) fortalezas.push("La rentabilidad neta operativa es atractiva.");
    if (score.scoreRoe >= 70) fortalezas.push("El dinero propio invertido trabaja con buena rentabilidad.");
    if (score.scoreLtv >= 70) fortalezas.push("El nivel de deuda parece razonable.");
    if (score.scoreCuotaAlquiler >= 70) fortalezas.push("La cuota hipotecaria no consume demasiado alquiler.");
    if (score.scoreMargen >= 70) fortalezas.push("Existe margen de seguridad ante imprevistos.");

    if (score.scoreCashflow < 40) {
      alertas.push("El cash-flow mensual es bajo o negativo.");
      acciones.push("Negocia precio, sube alquiler objetivo o mejora financiación.");
    }
    if (score.scoreRentabilidadNeta < 40) {
      alertas.push("La rentabilidad neta operativa es débil.");
      acciones.push("Revisa si el coste total del proyecto es demasiado alto.");
    }
    if (score.scoreRoe < 40) {
      alertas.push("El retorno sobre tu dinero propio no compensa bien.");
      acciones.push("Reduce capital inmovilizado o busca mayor rentabilidad.");
    }
    if (score.scoreLtv < 40) {
      alertas.push("El apalancamiento puede ser excesivo o mal equilibrado.");
      acciones.push("Comprueba que la deuda sea sostenible incluso con vacancia.");
    }
    if (score.scoreCuotaAlquiler < 40) {
      alertas.push("Demasiada parte del alquiler se va a pagar hipoteca.");
      acciones.push("Busca menor cuota, mayor entrada o mejor tipo de interés.");
    }
    if (score.scoreMargen < 40) {
      alertas.push("El colchón ante gastos, reparaciones o vacancia es bajo.");
      acciones.push("Exige mayor margen antes de comprar o crea una reserva de liquidez.");
    }

    const resumen =
      score.total >= 75
        ? "La inversión parece sólida, pero solo debería avanzar si la due diligence confirma que no hay riesgos ocultos."
        : score.total >= 55
        ? "La inversión no es claramente mala, pero necesita negociación o más comprobaciones antes de decidir."
        : "La inversión no parece suficientemente atractiva con los datos actuales; lo prudente sería renegociar o descartarla.";

    return {
      resumen,
      fortalezas: fortalezas.length ? fortalezas : ["Todavía no hay fortalezas claras con los datos introducidos."],
      alertas: alertas.length ? alertas : ["No aparecen alertas graves en las métricas principales."],
      acciones: acciones.length ? Array.from(new Set(acciones)).slice(0, 4) : ["Realiza due diligence legal, técnica, fiscal y de mercado antes de comprar."],
    };
  }, [score]);

  const datosGraficoEscenarios = useMemo(
    () => [
      { label: "Pesimista", valor: escenarios.pesimista.cashflowMensualPostIRPF, ayuda: "Alquiler -10%, vacancia +5%, tipo +1%" },
      { label: "Base", valor: escenarios.base.cashflowMensualPostIRPF, ayuda: "Condiciones actuales" },
      { label: "Optimista", valor: escenarios.optimista.cashflowMensualPostIRPF, ayuda: "Alquiler +10%, menor vacancia" },
    ],
    [escenarios]
  );

  const datosGraficoOportunidad = useMemo(
    () => [
      { label: "Inversión alternativa", valor: resultados.valorFuturoAlternativa, ayuda: "Capital propio invertido a la rentabilidad alternativa" },
      { label: "Inmueble", valor: resultados.valorTotalInmueble, ayuda: "Venta neta estimada + cash-flow acumulado" },
    ],
    [resultados]
  );

  const datosGraficoCostes = useMemo(
    () => [
      { label: "Compra", valor: numero(datos.precioCompra) },
      { label: "Impuestos", valor: numero(datos.itp) },
      { label: "Notaría/registro", valor: numero(datos.notariaRegistroGestoria) },
      { label: "Hipoteca/broker", valor: numero(datos.tasacion) + numero(datos.comisionBroker) + numero(datos.comisionApertura) + numero(datos.otrosGastosHipoteca) },
      { label: "Comisiones", valor: numero(datos.comisionAPI) + numero(datos.comisionInmobiliaria) },
      { label: "Reforma/muebles", valor: numero(datos.reforma) + numero(datos.mueblesEquipamiento) + numero(datos.otrosCostesIniciales) },
    ].filter((d) => d.valor > 0),
    [datos]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏠 Calculadora de rentabilidad inmobiliaria</h1>
            <p className="mt-2 text-slate-600">
              Introduce los datos de una vivienda en alquiler y calcula rentabilidad bruta, rentabilidad neta, ROE, ROCE, cash-flow, LTV y margen de seguridad.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Tarjeta className={score.fondo}>
              <div className="flex items-center gap-3 p-4">
                <div className="text-3xl">{estado.icono}</div>
                <div>
                  <p className="text-xl font-bold">{estado.texto}</p>
                  <p className="max-w-md text-sm text-slate-600">{estado.detalle}</p>
                </div>
              </div>
            </Tarjeta>
            <button
              onClick={limpiarCalculadora}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Limpiar calculadora
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">1️⃣ Compra y financiación</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Precio de compra" campo="precioCompra" value={datos.precioCompra} onChange={actualizar} />
                  <Campo label="ITP / impuestos de compra" campo="itp" value={datos.itp} onChange={actualizar} />
                  <Campo label="Notaría, registro y gestoría" campo="notariaRegistroGestoria" value={datos.notariaRegistroGestoria} onChange={actualizar} />
                  <Campo label="Tasación" campo="tasacion" value={datos.tasacion} onChange={actualizar} />
                  <Campo label="Comisión Broker Hipotecario" campo="comisionBroker" value={datos.comisionBroker} onChange={actualizar} />
                  <Campo label="Comisión apertura hipoteca" campo="comisionApertura" value={datos.comisionApertura} onChange={actualizar} />
                  <Campo label="Otros gastos hipoteca" campo="otrosGastosHipoteca" value={datos.otrosGastosHipoteca} onChange={actualizar} />
                  <Campo label="Comisión API" campo="comisionAPI" value={datos.comisionAPI} onChange={actualizar} />
                  <Campo label="Comisión inmobiliaria" campo="comisionInmobiliaria" value={datos.comisionInmobiliaria} onChange={actualizar} />
                </div>
                <div className="space-y-4 border-t pt-4">
                  <Campo label="Importe de hipoteca" campo="hipoteca" value={datos.hipoteca} onChange={actualizar} />
                  <Campo label="Tipo de interés anual" campo="tipoInteres" value={datos.tipoInteres} onChange={actualizar} suffix="%" />
                  <Campo label="Plazo" campo="plazoAnos" value={datos.plazoAnos} onChange={actualizar} suffix="años" />
                </div>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">2️⃣ Fiscalidad estimada</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Tipo marginal IRPF" campo="tipoMarginalIRPF" value={datos.tipoMarginalIRPF} onChange={actualizar} suffix="%" />
                  <Campo label="Reducción aplicable alquiler" campo="reduccionAlquilerPct" value={datos.reduccionAlquilerPct} onChange={actualizar} suffix="%" />
                  <Campo label="Gastos no deducibles estimados" campo="gastosNoDeducibles" value={datos.gastosNoDeducibles} onChange={actualizar} />
                  <SelectorAmortizacion value={datos.aplicarAmortizacion} onChange={actualizar} />
                  <Campo label="Valor de construcción" campo="valorConstruccion" value={datos.valorConstruccion} onChange={actualizar} />
                  <Campo label="Porcentaje amortización" campo="porcentajeAmortizacion" value={datos.porcentajeAmortizacion} onChange={actualizar} suffix="%" />
                </div>
                <p className="text-xs text-slate-500">
                  Estimación simplificada. Revisa con asesor fiscal la reducción aplicable, deducibilidad real, intereses exactos y base de amortización fiscal.
                </p>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">3️⃣ Puesta en marcha</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Reforma" campo="reforma" value={datos.reforma} onChange={actualizar} />
                  <Campo label="Muebles / equipamiento" campo="mueblesEquipamiento" value={datos.mueblesEquipamiento} onChange={actualizar} />
                  <Campo label="Otros costes iniciales" campo="otrosCostesIniciales" value={datos.otrosCostesIniciales} onChange={actualizar} />
                </div>
              </div>
            </Tarjeta>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Tarjeta className={score.fondo}>
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
                <div className="md:col-span-4 mb-2">
                  <p className="text-sm text-slate-600">
                    <strong>¿Qué significa este score?</strong> Es una nota de 0 a 100 que resume si la inversión es buena o mala teniendo en cuenta rentabilidad, riesgo y seguridad.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Score inversión</p>
                  <p className={`mt-1 text-4xl font-bold ${score.color}`}>{score.total}/100</p>
                  <p className="mt-1 text-xs text-slate-500">Modelo ponderado de calidad de operación</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">EV estimado</p>
                  <p className={`mt-1 text-4xl font-bold ${score.color}`}>{score.evPct >= 0 ? "+" : ""}{score.evPct}%</p>
                  <p className="mt-1 text-xs text-slate-500">Estimación orientativa de valor esperado relativo</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-600">Decisión sugerida</p>
                  <p className={`mt-1 text-2xl font-bold ${score.color}`}>{score.decision}</p>
                  <p className="mt-2 text-sm text-slate-600">No sustituye la due diligence: valida estado del inmueble, mercado de alquiler, solvencia del inquilino, comunidad, cargas, fiscalidad y liquidez.</p>
                </div>
              </div>
            </Tarjeta>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Coste de compra" valor={euros(resultados.costeCompra)} ayuda="Precio + impuestos + notaría + gastos + comisiones" />
              <Metrica titulo="Puesta en marcha" valor={euros(resultados.costePuestaMarcha)} ayuda="Reforma + muebles + otros costes iniciales" />
              <Metrica titulo="Coste total del proyecto" valor={euros(resultados.costeTotal)} ayuda="Importe total necesario para poner el inmueble en alquiler" destacado />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Capital propio necesario" valor={euros(resultados.capitalPropio)} ayuda="Coste total menos hipoteca" destacado />
              <Metrica titulo="Cuota hipotecaria mensual" valor={euros(resultados.cuotaHipoteca)} ayuda="Cuota estimada según importe, tipo y plazo" />
              <Metrica titulo="LTV sobre compra" valor={porcentaje(resultados.ltvCompra)} ayuda="Hipoteca / precio de compra" />
            </div>

            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">4️⃣ Ingresos, gastos y riesgo operativo</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Campo label="Alquiler mensual" campo="alquilerMensual" value={datos.alquilerMensual} onChange={actualizar} />
                  <Campo label="IBI anual" campo="ibi" value={datos.ibi} onChange={actualizar} />
                  <Campo label="Comunidad anual" campo="comunidad" value={datos.comunidad} onChange={actualizar} />
                  <Campo label="Seguro hogar anual" campo="seguroHogar" value={datos.seguroHogar} onChange={actualizar} />
                  <Campo label="Seguro vida anual" campo="seguroVida" value={datos.seguroVida} onChange={actualizar} />
                  <Campo label="Seguro / garantía de impago anual" campo="seguroImpago" value={datos.seguroImpago} onChange={actualizar} />
                  <Campo label="Mantenimiento anual" campo="mantenimiento" value={datos.mantenimiento} onChange={actualizar} />
                  <Campo label="Reparaciones extra anual" campo="reparacionesExtra" value={datos.reparacionesExtra} onChange={actualizar} />
                  <Campo label="Gestión del alquiler" campo="gestionAlquilerPct" value={datos.gestionAlquilerPct} onChange={actualizar} suffix="%" />
                  <Campo label="Vacancia estimada" campo="vacanciaPct" value={datos.vacanciaPct} onChange={actualizar} suffix="%" />
                </div>

                <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
                  <Metrica titulo="Ingresos brutos/año" valor={euros(resultados.ingresosBrutosAnuales)} ayuda="Alquiler mensual x 12" />
                  <Metrica titulo="Vacancia anual" valor={euros(resultados.vacancia)} ayuda="Pérdida estimada por vivienda vacía" />
                  <Metrica titulo="Gastos operativos/año" valor={euros(resultados.gastosOperativosAnuales)} ayuda="Sin incluir hipoteca" />
                  <Metrica titulo="NOI anual" valor={euros(resultados.noiAnual)} ayuda="Ingreso neto antes de hipoteca" destacado />
                </div>
              </div>
            </Tarjeta>

            <Tarjeta className="border-sky-200 bg-sky-50">
              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-sky-900">Resultados PRE-IRPF</h2>
                  <p className="text-sm text-sky-700">Métricas operativas antes de aplicar fiscalidad personal.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Cash-flow mensual pre-IRPF" valor={euros(resultados.cashflowMensualAntesImpuestos)} ayuda="NOI mensual menos cuota hipotecaria" destacado />
                  <Metrica titulo="Cash-flow anual pre-IRPF" valor={euros(resultados.cashflowAnualAntesImpuestos)} ayuda="NOI anual menos cuotas hipotecarias" />
                  <Metrica titulo="ROE pre-IRPF" valor={porcentaje(resultados.roe)} ayuda="Cash-flow anual pre-IRPF / capital propio" destacado />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Rentabilidad bruta" valor={porcentaje(resultados.rentabilidadBruta)} ayuda="Alquiler anual / coste total" />
                  <Metrica titulo="Rentabilidad neta operativa" valor={porcentaje(resultados.rentabilidadNeta)} ayuda="NOI anual / coste total" destacado />
                  <Metrica titulo="ROCE" valor={porcentaje(resultados.roce)} ayuda="NOI anual / capital propio invertido" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Cuota / alquiler" valor={porcentaje(resultados.ratioCuotaAlquiler)} ayuda="Cuanto menor, mayor margen de seguridad" />
                  <Metrica titulo="Margen mensual seguridad" valor={euros(resultados.margenSeguridadMensual)} ayuda="Alquiler - cuota - gastos operativos medios" />
                  <Metrica titulo="Break-even alquiler" valor={euros(resultados.alquilerMinimoBreakEven)} ayuda="Alquiler mínimo para cubrir cuota y gastos" />
                </div>
              </div>
            </Tarjeta>

            <Tarjeta className="border-emerald-200 bg-emerald-50">
              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">Resultados POST-IRPF</h2>
                  <p className="text-sm text-emerald-700">Métricas estimadas después de aplicar IRPF. Este es el bloque más útil para decidir.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Cash-flow mensual post-IRPF" valor={euros(resultados.cashflowMensualDespuesImpuestos)} ayuda="Cash-flow estimado después de impuestos" destacado />
                  <Metrica titulo="Cash-flow anual post-IRPF" valor={euros(resultados.cashflowAnualDespuesImpuestos)} ayuda="Cash-flow anual menos IRPF estimado" />
                  <Metrica titulo="ROE post-IRPF" valor={porcentaje(resultados.roeDespuesImpuestos)} ayuda="Cash-flow anual post-IRPF / capital propio" destacado />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="IRPF estimado anual" valor={euros(resultados.impuestoIRPFEstimado)} ayuda="Estimación sobre base fiscal reducida" />
                  <Metrica titulo="Base fiscal reducida" valor={euros(resultados.baseReducida)} ayuda="Base estimada tras reducción aplicable" />
                  <Metrica titulo="Gastos deducibles estimados" valor={euros(resultados.gastosDeduciblesEstimados)} ayuda="Gastos operativos + intereses + amortización - no deducibles" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Amortización fiscal anual" valor={euros(resultados.amortizacionFiscalAnual)} ayuda="Deducción fiscal estimada si se aplica" />
                  <Metrica titulo="Intereses estimados año 1" valor={euros(resultados.interesesPrimerAno)} ayuda="Estimación simplificada de intereses deducibles" />
                  <Metrica titulo="Rendimiento fiscal previo" valor={euros(resultados.rendimientoNetoFiscalPrevio)} ayuda="Ingresos - gastos deducibles antes de reducción" />
                </div>
              </div>
            </Tarjeta>

            <Tarjeta className={score.fondo}>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Interpretación automática del score</h2>
                <p className="mb-4 text-sm text-slate-700">{interpretacionScore.resumen}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="mb-2 font-semibold text-emerald-800">Fortalezas</h3>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {interpretacionScore.fortalezas.map((item) => (
                        <li key={item}>✅ {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-red-800">Alertas</h3>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {interpretacionScore.alertas.map((item) => (
                        <li key={item}>⚠️ {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-slate-800">Qué haría ahora</h3>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {interpretacionScore.acciones.map((item) => (
                        <li key={item}>➡️ {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Desglose del score</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Cada bloque suma puntos. Cuanto más alto, mejor está ese aspecto de la inversión.
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <p className="md:col-span-3 text-xs text-slate-500">
                    0-40 = mala inversión | 40-70 = dudosa | 70-100 = buena inversión
                  </p>
                  <p><strong>Cash-flow:</strong> (dinero que te queda cada mes)  {score.scoreCashflow}/100</p>
                  <p><strong>Rentabilidad neta:</strong> (lo que rinde el inmueble sin hipoteca)  {score.scoreRentabilidadNeta}/100</p>
                  <p><strong>ROE:</strong> (rentabilidad de tu dinero invertido)  {score.scoreRoe}/100</p>
                  <p><strong>LTV:</strong> (nivel de endeudamiento)  {score.scoreLtv}/100</p>
                  <p><strong>Cuota/alquiler:</strong> (qué parte del alquiler se va a la hipoteca)  {score.scoreCuotaAlquiler}/100</p>
                  <p><strong>Margen seguridad:</strong> (colchón ante problemas)  {score.scoreMargen}/100</p>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Lectura rápida</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Este resumen te dice en pocas líneas si la inversión tiene sentido o no.
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>
                    <strong>Cash-flow mensual después de impuestos:</strong> {euros(resultados.cashflowMensualDespuesImpuestos)}.
                  </li>
                  <li>
                    <strong>Margen mensual de seguridad:</strong> alquiler menos cuota y gastos operativos medios = {euros(resultados.margenSeguridadMensual)}.
                  </li>
                  <li>
                    <strong>Capital propio necesario:</strong> {euros(resultados.capitalPropio)}.
                  </li>
                  <li>
                    <strong>LTV real sobre coste total:</strong> {porcentaje(resultados.ltvCosteTotal)}.
                  </li>
                  <li>
                    <strong>ROE post-IRPF:</strong> {porcentaje(resultados.roeDespuesImpuestos)}. Mide la rentabilidad anual estimada del dinero propio después de gastos, hipoteca e impuestos.
                  </li>
                  <li>
                    <strong>Alquiler mínimo break-even:</strong> {euros(resultados.alquilerMinimoBreakEven)} al mes para cubrir gastos operativos y cuota hipotecaria.
                  </li>
                  <li>
                    <strong>Decisión sugerida:</strong> {score.decision} con score {score.total}/100 y EV estimado {score.evPct >= 0 ? "+" : ""}{score.evPct}%.
                  </li>
                </ul>
              </div>
            </Tarjeta>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <GraficoBarras
                titulo="Gráfico: composición del coste total"
                descripcion="Visualiza rápidamente dónde se concentra el dinero necesario para comprar y poner el inmueble en alquiler."
                datos={datosGraficoCostes.length ? datosGraficoCostes : [{ label: "Sin datos", valor: 0 }]}
              />
              <GraficoBarras
                titulo="Gráfico: pre-IRPF vs post-IRPF"
                descripcion="Muestra el impacto estimado de la fiscalidad en el cash-flow mensual."
                datos={[
                  { label: "Pre-IRPF", valor: resultados.cashflowMensualAntesImpuestos },
                  { label: "Post-IRPF", valor: resultados.cashflowMensualDespuesImpuestos },
                ]}
              />
            </div>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Coste de oportunidad</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Compara esta inversión con otras alternativas (por ejemplo, bolsa). Te ayuda a saber si este piso es realmente la mejor opción para tu dinero.
                </p>
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Campo label="Rentabilidad alternativa anual" campo="rentabilidadAlternativa" value={datos.rentabilidadAlternativa} onChange={actualizar} suffix="%" />
                  <Campo label="Horizonte de inversión" campo="anosInversion" value={datos.anosInversion} onChange={actualizar} suffix="años" />
                  <Campo label="Revalorización anual inmueble" campo="revalorizacionAnual" value={datos.revalorizacionAnual} onChange={actualizar} suffix="%" />
                  <Campo label="Gastos de venta" campo="gastosVentaPct" value={datos.gastosVentaPct} onChange={actualizar} suffix="%" />
                  <Campo label="Impuesto ganancia venta" campo="impuestoGananciaPct" value={datos.impuestoGananciaPct} onChange={actualizar} suffix="%" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Metrica titulo="Valor futuro inversión alternativa" valor={euros(resultados.valorFuturoAlternativa)} ayuda="Capital propio invertido a la rentabilidad alternativa" />
                  <Metrica titulo="Valor total inmueble" valor={euros(resultados.valorTotalInmueble)} ayuda="Venta neta estimada + cash-flow acumulado" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Diferencia vs alternativa" valor={euros(resultados.diferenciaVsAlternativa)} ayuda="Valor total inmueble - inversión alternativa" destacado />
                  <Metrica titulo="Cash-flow acumulado" valor={euros(resultados.cashflowTotal)} ayuda="Cash-flow post-IRPF acumulado durante el horizonte" />
                  <Metrica titulo="Beneficio neto venta" valor={euros(resultados.beneficioNetoVenta)} ayuda="Venta estimada menos gastos e impuestos" />
                </div>
              </div>
            </Tarjeta>

            <GraficoBarras
              titulo="Gráfico: inmueble vs inversión alternativa"
              descripcion="Compara visualmente si el valor total estimado del inmueble supera a invertir el capital propio en otra alternativa."
              datos={datosGraficoOportunidad}
            />

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Escenario de salida / venta</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Estima cuánto ganarías cuando vendas el inmueble en el futuro, teniendo en cuenta revalorización, gastos e impuestos.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Valor futuro inmueble" valor={euros(resultados.valorFuturoVenta)} ayuda="Precio de compra capitalizado por revalorización" />
                  <Metrica titulo="Gastos venta" valor={euros(resultados.gastosVenta)} ayuda="Gastos estimados sobre precio de venta" />
                  <Metrica titulo="Impuesto venta" valor={euros(resultados.impuestoVenta)} ayuda="Impuesto estimado sobre ganancia bruta" />
                </div>
              </div>
            </Tarjeta>

            <GraficoBarras
              titulo="Gráfico: cash-flow mensual por escenario"
              descripcion="Compara de un vistazo cuánto dinero te quedaría al mes en un escenario pesimista, base y optimista."
              datos={datosGraficoEscenarios}
            />

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Simulación de escenarios</h2>
                <p className="mb-3 text-sm text-slate-600">
                  Muestra el <strong>cash-flow mensual post-IRPF</strong>: el dinero que te quedaría cada mes después de gastos, hipoteca e impuestos si el escenario cambia.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metrica titulo="Cash-flow mensual pesimista" valor={euros(escenarios.pesimista.cashflowMensualPostIRPF)} ayuda="Alquiler -10%, vacancia +5%, tipo +1%" />
                  <Metrica titulo="Cash-flow mensual base" valor={euros(escenarios.base.cashflowMensualPostIRPF)} ayuda="Condiciones actuales" />
                  <Metrica titulo="Cash-flow mensual optimista" valor={euros(escenarios.optimista.cashflowMensualPostIRPF)} ayuda="Alquiler +10%, vacancia menor" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <p><strong>Pesimista:</strong> alquiler {euros(escenarios.pesimista.alquiler)}/mes, vacancia {porcentaje(escenarios.pesimista.vacanciaPct)}, tipo {porcentaje(escenarios.pesimista.tipoInteres)}.</p>
                  <p><strong>Base:</strong> alquiler {euros(escenarios.base.alquiler)}/mes, vacancia {porcentaje(escenarios.base.vacanciaPct)}, tipo {porcentaje(escenarios.base.tipoInteres)}.</p>
                  <p><strong>Optimista:</strong> alquiler {euros(escenarios.optimista.alquiler)}/mes, vacancia {porcentaje(escenarios.optimista.vacanciaPct)}, tipo {porcentaje(escenarios.optimista.tipoInteres)}.</p>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Fórmulas utilizadas</h2>
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <p><strong>Coste total:</strong> compra + impuestos + gastos + comisiones + reforma + muebles + otros.</p>
                  <p><strong>NOI:</strong> ingresos brutos anuales - gastos operativos anuales.</p>
                  <p><strong>Rentabilidad bruta:</strong> alquiler anual / coste total.</p>
                  <p><strong>Rentabilidad neta:</strong> NOI anual / coste total.</p>
                  <p><strong>ROE antes de impuestos:</strong> cash-flow anual antes de IRPF / capital propio.</p>
                  <p><strong>ROE post-IRPF:</strong> cash-flow anual después de IRPF estimado / capital propio.</p>
                  <p><strong>ROCE:</strong> NOI anual / capital propio.</p>
                  <p><strong>LTV compra:</strong> hipoteca / precio de compra.</p>
                  <p><strong>Cuota/alquiler:</strong> cuota hipotecaria mensual / alquiler mensual.</p>
                  <p><strong>Fiscalidad:</strong> IRPF estimado = base fiscal reducida positiva x tipo marginal.</p>
                  <p><strong>Amortización fiscal:</strong> si se activa, se suma como gasto deducible estimado según valor de construcción y porcentaje indicado.</p>
                  <p><strong>Score:</strong> pondera cash-flow post-IRPF, rentabilidad neta, ROE post-IRPF, LTV, cuota/alquiler y margen de seguridad.</p>
                  <p><strong>EV%:</strong> estimación orientativa basada en el score; no es garantía de rentabilidad futura.</p>
                </div>
              </div>
            </Tarjeta>
          </div>
        </div>
      </div>
    </div>
  );
}
