"use client";

import React, { useMemo, useState, memo } from "react";

const valoresIniciales = {
  precioCompra: "",
  itp: "",
  notariaRegistroGestoria: "",
  tasacion: "",
  gastosHipoteca: "",
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
};

type CampoClave = keyof typeof valoresIniciales;

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
  campo: CampoClave;
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
    const gastosHipoteca = numero(datos.gastosHipoteca);
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

    const costeCompra =
      precioCompra +
      itp +
      notariaRegistroGestoria +
      tasacion +
      gastosHipoteca +
      comisionAPI +
      comisionInmobiliaria;

    const costePuestaMarcha = reforma + mueblesEquipamiento + otrosCostesIniciales;
    const costeTotal = costeCompra + costePuestaMarcha;
    const capitalPropio = Math.max(costeTotal - hipoteca, 0);

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

    return {
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
      rentabilidadBruta: costeTotal > 0 ? (ingresosBrutosAnuales / costeTotal) * 100 : 0,
      rentabilidadNeta: costeTotal > 0 ? (noiAnual / costeTotal) * 100 : 0,
      roe: capitalPropio > 0 ? (cashflowAnualAntesImpuestos / capitalPropio) * 100 : 0,
      cashOnCash: capitalPropio > 0 ? (cashflowAnualAntesImpuestos / capitalPropio) * 100 : 0,
      roce: capitalPropio > 0 ? (noiAnual / capitalPropio) * 100 : 0,
      ratioCuotaAlquiler: alquilerMensual > 0 ? (cuotaHipoteca / alquilerMensual) * 100 : 0,
      ltvCompra: precioCompra > 0 ? (hipoteca / precioCompra) * 100 : 0,
      ltvCosteTotal: costeTotal > 0 ? (hipoteca / costeTotal) * 100 : 0,
      gastosOperativosMensuales: gastosOperativosAnuales / 12,
      margenSeguridadMensual: alquilerMensual - cuotaHipoteca - gastosOperativosAnuales / 12,
    };
  }, [datos]);

  const estado =
    resultados.cashflowMensualAntesImpuestos > 150 &&
    resultados.rentabilidadNeta >= 5.5 &&
    resultados.roe >= 8
      ? {
          texto: "Operación potencialmente atractiva",
          icono: "✅",
          detalle: "Buen equilibrio entre rentabilidad, apalancamiento y cash-flow. Revisa siempre riesgo de inquilino, liquidez y fiscalidad.",
        }
      : resultados.cashflowMensualAntesImpuestos >= 0 && resultados.rentabilidadNeta >= 4
      ? {
          texto: "Operación ajustada / aceptable",
          icono: "⚖️",
          detalle: "Puede tener sentido, pero compárala con otras alternativas: fondos indexados, liquidez u otra oportunidad inmobiliaria.",
        }
      : {
          texto: "Operación débil o incompleta",
          icono: "⚠️",
          detalle: "Faltan datos o el margen es bajo. Revisa precio, alquiler, gastos, financiación o riesgo de vacancia.",
        };

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
            <Tarjeta>
              <div className="flex items-center gap-3 p-4">
                <div className="text-3xl">{estado.icono}</div>
                <div>
                  <p className="text-xl font-bold">{estado.texto}</p>
                  <p className="max-w-md text-sm text-slate-500">{estado.detalle}</p>
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
                  <Campo label="Gastos de hipoteca" campo="gastosHipoteca" value={datos.gastosHipoteca} onChange={actualizar} />
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
                <h2 className="text-xl font-semibold">2️⃣ Puesta en marcha</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Reforma" campo="reforma" value={datos.reforma} onChange={actualizar} />
                  <Campo label="Muebles / equipamiento" campo="mueblesEquipamiento" value={datos.mueblesEquipamiento} onChange={actualizar} />
                  <Campo label="Otros costes iniciales" campo="otrosCostesIniciales" value={datos.otrosCostesIniciales} onChange={actualizar} />
                </div>
              </div>
            </Tarjeta>
          </div>

          <div className="space-y-6 lg:col-span-2">
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
                <h2 className="text-xl font-semibold">3️⃣ Ingresos, gastos y riesgo operativo</h2>

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Cash-flow mensual" valor={euros(resultados.cashflowMensualAntesImpuestos)} ayuda="NOI mensual menos cuota hipotecaria" destacado />
              <Metrica titulo="Rentabilidad neta" valor={porcentaje(resultados.rentabilidadNeta)} ayuda="NOI anual / coste total" destacado />
              <Metrica titulo="ROE / Cash on Cash" valor={porcentaje(resultados.roe)} ayuda="Cash-flow anual / capital propio" destacado />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Rentabilidad bruta" valor={porcentaje(resultados.rentabilidadBruta)} ayuda="Alquiler anual / coste total" />
              <Metrica titulo="ROCE" valor={porcentaje(resultados.roce)} ayuda="NOI anual / capital propio invertido" />
              <Metrica titulo="Cuota / alquiler" valor={porcentaje(resultados.ratioCuotaAlquiler)} ayuda="Cuanto menor, mayor margen de seguridad" />
            </div>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Lectura rápida</h2>
                <ul className="space-y-2 text-slate-700">
                  <li>
                    <strong>Cash-flow mensual antes de impuestos:</strong> {euros(resultados.cashflowMensualAntesImpuestos)}.
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
                    <strong>ROE / Cash on Cash:</strong> {porcentaje(resultados.roe)}. Mide la rentabilidad anual del dinero propio realmente invertido después de pagar gastos operativos e hipoteca.
                  </li>
                </ul>
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
                  <p><strong>ROE / Cash on Cash:</strong> cash-flow anual / capital propio.</p>
                  <p><strong>ROCE:</strong> NOI anual / capital propio.</p>
                  <p><strong>LTV compra:</strong> hipoteca / precio de compra.</p>
                  <p><strong>Cuota/alquiler:</strong> cuota hipotecaria mensual / alquiler mensual.</p>
                </div>
              </div>
            </Tarjeta>
          </div>
        </div>
      </div>
    </div>
  );
}
