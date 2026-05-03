"use client";

import React, { useMemo, useState } from "react";

export default function CalculadoraRentabilidadInmobiliaria() {
  const [datos, setDatos] = useState({
    // Compra y puesta en marcha
    precioCompra: 70000,
    itp: 5600,
    notariaRegistroGestoria: 800,
    tasacion: 315,
    estudioHipoteca: 25,
    gastosHipoteca: 1500,
    comisionComprador: 6050,
    comisionInmobiliaria: 3630,
    reforma: 7260,
    mueblesEquipamiento: 3630,
    cerraduraLlaves: 150,
    otrosPuestaMarcha: 0,

    // Ingresos
    alquilerMensual: 600,

    // Gastos operativos anuales
    ibi: 250,
    comunidad: 420,
    seguroHogar: 221.5,
    seguroVida: 254.33,
    seguroImpago: 300,
    mantenimiento: 600,
    reparacionesExtra: 300,
    gestionAlquilerPct: 0,
    vacanciaPct: 5,

    // Financiación
    hipoteca: 49000,
    tipoInteres: 3,
    plazoAnos: 30,
  });

  function actualizar(campo, valor) {
    const numero = Number(valor);
    setDatos((prev) => ({
      ...prev,
      [campo]: Number.isFinite(numero) ? numero : 0,
    }));
  }

  const resultados = useMemo(() => {
    const costeCompra =
      datos.precioCompra +
      datos.itp +
      datos.notariaRegistroGestoria +
      datos.tasacion +
      datos.estudioHipoteca +
      datos.gastosHipoteca +
      datos.comisionComprador +
      datos.comisionInmobiliaria;

    const costePuestaMarcha =
      datos.reforma +
      datos.mueblesEquipamiento +
      datos.cerraduraLlaves +
      datos.otrosPuestaMarcha;

    const costeTotal = costeCompra + costePuestaMarcha;
    const capitalPropio = Math.max(costeTotal - datos.hipoteca, 0);
    const ingresosBrutosAnuales = datos.alquilerMensual * 12;

    const vacancia = ingresosBrutosAnuales * (datos.vacanciaPct / 100);
    const gestionAlquiler = ingresosBrutosAnuales * (datos.gestionAlquilerPct / 100);

    const gastosAnuales =
      datos.ibi +
      datos.comunidad +
      datos.seguroHogar +
      datos.seguroVida +
      datos.seguroImpago +
      datos.mantenimiento +
      datos.reparacionesExtra +
      vacancia +
      gestionAlquiler;

    const noiAnual = ingresosBrutosAnuales - gastosAnuales;
    const interesMensual = datos.tipoInteres / 100 / 12;
    const numPagos = Math.max(datos.plazoAnos * 12, 1);

    let cuotaHipoteca = 0;
    if (datos.hipoteca > 0) {
      if (interesMensual > 0) {
        cuotaHipoteca =
          (datos.hipoteca * interesMensual) /
          (1 - Math.pow(1 + interesMensual, -numPagos));
      } else {
        cuotaHipoteca = datos.hipoteca / numPagos;
      }
    }

    const cuotaAnual = cuotaHipoteca * 12;
    const cashflowAnual = noiAnual - cuotaAnual;
    const cashflowMensual = cashflowAnual / 12;
    const beneficioAntesImpuestos = cashflowAnual;

    return {
      costeCompra,
      costePuestaMarcha,
      costeTotal,
      capitalPropio,
      ingresosBrutosAnuales,
      vacancia,
      gestionAlquiler,
      gastosAnuales,
      noiAnual,
      cuotaHipoteca,
      cuotaAnual,
      cashflowMensual,
      cashflowAnual,
      beneficioAntesImpuestos,
      rentabilidadBruta: costeTotal > 0 ? (ingresosBrutosAnuales / costeTotal) * 100 : 0,
      rentabilidadNeta: costeTotal > 0 ? (noiAnual / costeTotal) * 100 : 0,
      cashOnCash: capitalPropio > 0 ? (cashflowAnual / capitalPropio) * 100 : 0,
      roce: capitalPropio > 0 ? (noiAnual / capitalPropio) * 100 : 0,
      ratioCuotaAlquiler:
        datos.alquilerMensual > 0 ? (cuotaHipoteca / datos.alquilerMensual) * 100 : 0,
      ltvCompra: datos.precioCompra > 0 ? (datos.hipoteca / datos.precioCompra) * 100 : 0,
      ltvCosteTotal: costeTotal > 0 ? (datos.hipoteca / costeTotal) * 100 : 0,
      gastoOperativoMensual: gastosAnuales / 12,
      margenSeguridadMensual: datos.alquilerMensual - cuotaHipoteca - gastosAnuales / 12,
    };
  }, [datos]);

  function euros(numero) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(numero) ? numero : 0);
  }

  function porcentaje(numero) {
    return `${(Number.isFinite(numero) ? numero : 0).toFixed(2)}%`;
  }

  const estado =
    resultados.cashflowMensual > 150 &&
    resultados.rentabilidadNeta >= 5.5 &&
    resultados.cashOnCash >= 8
      ? {
          texto: "EV+",
          icono: "✅",
          detalle: "Operación atractiva si el riesgo del inquilino, la vacancia y los gastos reales están controlados.",
        }
      : resultados.cashflowMensual >= 0 && resultados.rentabilidadNeta >= 4
      ? {
          texto: "EV0 / EV+ suave",
          icono: "⚖️",
          detalle:
            "Operación razonable, pero no excelente. Hay que compararla con fondos indexados, liquidez y una segunda oportunidad inmobiliaria.",
        }
      : {
          texto: "EV-",
          icono: "⚠️",
          detalle:
            "La operación queda ajustada: poco margen ante impagos, reparaciones, vacancia o subida de gastos.",
        };

  function Campo({ label, campo, suffix = "€" }) {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="relative">
          <input
            type="number"
            value={datos[campo]}
            onChange={(e) => actualizar(campo, e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-14 text-slate-900 shadow-sm outline-none focus:border-slate-500"
          />
          <span className="absolute right-3 top-2.5 text-sm text-slate-400">{suffix}</span>
        </div>
      </div>
    );
  }

  function Tarjeta({ children, className = "" }) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
        {children}
      </div>
    );
  }

  function Metrica({ titulo, valor, ayuda }) {
    return (
      <Tarjeta>
        <div className="p-4">
          <p className="text-sm text-slate-500">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>
          <p className="mt-2 text-xs text-slate-400">{ayuda}</p>
        </div>
      </Tarjeta>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏠 Calculadora realista de rentabilidad inmobiliaria</h1>
            <p className="mt-2 text-slate-600">
              Adaptada a una operación real: compra, ITP, financiación, reforma, seguros, impago, gestión, vacancia y mantenimiento.
            </p>
          </div>

          <Tarjeta>
            <div className="flex items-center gap-3 p-4">
              <div className="text-3xl">{estado.icono}</div>
              <div>
                <p className="text-xl font-bold">{estado.texto}</p>
                <p className="max-w-md text-sm text-slate-500">{estado.detalle}</p>
              </div>
            </div>
          </Tarjeta>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">1️⃣ Compra y financiación</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Precio de compra" campo="precioCompra" />
                  <Campo label="ITP" campo="itp" />
                  <Campo label="Notaría, registro y gestoría" campo="notariaRegistroGestoria" />
                  <Campo label="Tasación" campo="tasacion" />
                  <Campo label="Estudio hipoteca" campo="estudioHipoteca" />
                  <Campo label="Gastos hipoteca" campo="gastosHipoteca" />
                  <Campo label="Comisión API" campo="comisionComprador" />
                  <Campo label="Comisión inmobiliaria" campo="comisionInmobiliaria" />
                </div>
                <div className="space-y-4 border-t pt-4">
                  <Campo label="Importe hipoteca" campo="hipoteca" />
                  <Campo label="Tipo de interés" campo="tipoInteres" suffix="%" />
                  <Campo label="Plazo" campo="plazoAnos" suffix="años" />
                </div>
              </div>
            </Tarjeta>

            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">2️⃣ Puesta en marcha</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <Campo label="Reforma" campo="reforma" />
                  <Campo label="Muebles / equipamiento" campo="mueblesEquipamiento" />
                  <Campo label="Cerradura / llaves" campo="cerraduraLlaves" />
                  <Campo label="Otros puesta en marcha" campo="otrosPuestaMarcha" />
                </div>
              </div>
            </Tarjeta>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Coste compra" valor={euros(resultados.costeCompra)} ayuda="Precio + ITP + notaría + financiación + comisiones" />
              <Metrica titulo="Puesta en marcha" valor={euros(resultados.costePuestaMarcha)} ayuda="Reforma + muebles + llaves + extras" />
              <Metrica titulo="Coste total proyecto" valor={euros(resultados.costeTotal)} ayuda="Coste completo real de la operación" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Capital propio necesario" valor={euros(resultados.capitalPropio)} ayuda="Coste total menos hipoteca" />
              <Metrica titulo="Cuota hipoteca" valor={euros(resultados.cuotaHipoteca)} ayuda="Cuota mensual estimada" />
              <Metrica titulo="LTV sobre compra" valor={porcentaje(resultados.ltvCompra)} ayuda="Hipoteca / precio de compra" />
            </div>

            <Tarjeta>
              <div className="space-y-5 p-5">
                <h2 className="text-xl font-semibold">3️⃣ Ingresos, gastos y riesgo operativo</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Campo label="Alquiler mensual" campo="alquilerMensual" />
                  <Campo label="IBI anual" campo="ibi" />
                  <Campo label="Comunidad anual" campo="comunidad" />
                  <Campo label="Seguro hogar anual" campo="seguroHogar" />
                  <Campo label="Seguro vida anual" campo="seguroVida" />
                  <Campo label="Seguro / garantía de impago anual" campo="seguroImpago" />
                  <Campo label="Mantenimiento anual" campo="mantenimiento" />
                  <Campo label="Reparaciones extra anual" campo="reparacionesExtra" />
                  <Campo label="Gestión alquiler" campo="gestionAlquilerPct" suffix="%" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Vacancia estimada</span>
                    <span>{datos.vacanciaPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={datos.vacanciaPct}
                    onChange={(e) => actualizar("vacanciaPct", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
                  <Metrica titulo="Ingresos brutos/año" valor={euros(resultados.ingresosBrutosAnuales)} ayuda="Alquiler mensual x 12" />
                  <Metrica titulo="Vacancia anual" valor={euros(resultados.vacancia)} ayuda="Pérdida estimada por meses vacíos" />
                  <Metrica titulo="Gastos operativos/año" valor={euros(resultados.gastosAnuales)} ayuda="Sin incluir hipoteca" />
                  <Metrica titulo="NOI anual" valor={euros(resultados.noiAnual)} ayuda="Ingreso neto antes de hipoteca" />
                </div>
              </div>
            </Tarjeta>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Cash-flow mensual" valor={euros(resultados.cashflowMensual)} ayuda="Después de gastos y cuota hipotecaria" />
              <Metrica titulo="Rentabilidad neta" valor={porcentaje(resultados.rentabilidadNeta)} ayuda="NOI / coste total del proyecto" />
              <Metrica titulo="Cash on Cash" valor={porcentaje(resultados.cashOnCash)} ayuda="Cash-flow anual / capital propio" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metrica titulo="Rentabilidad bruta" valor={porcentaje(resultados.rentabilidadBruta)} ayuda="Alquiler anual / coste total" />
              <Metrica titulo="ROCE" valor={porcentaje(resultados.roce)} ayuda="NOI / capital propio invertido" />
              <Metrica titulo="Cuota / alquiler" valor={porcentaje(resultados.ratioCuotaAlquiler)} ayuda="Idealmente por debajo del 50%" />
            </div>

            <Tarjeta>
              <div className="p-5">
                <h2 className="mb-3 text-xl font-semibold">Lectura rápida</h2>
                <ul className="space-y-2 text-slate-700">
                  <li>
                    <strong>Cash-flow:</strong> {resultados.cashflowMensual >= 0 ? "positivo" : "negativo"} de {euros(resultados.cashflowMensual)} al mes.
                  </li>
                  <li>
                    <strong>Margen mensual:</strong> alquiler menos cuota y gastos operativos medios = {euros(resultados.margenSeguridadMensual)}.
                  </li>
                  <li>
                    <strong>Capital bloqueado:</strong> necesitas aproximadamente {euros(resultados.capitalPropio)} de fondos propios.
                  </li>
                  <li>
                    <strong>LTV real sobre coste total:</strong> {porcentaje(resultados.ltvCosteTotal)}. Cuanto menor sea, más capital propio queda bloqueado.
                  </li>
                  <li>
                    <strong>EV estimado:</strong> {estado.texto}. La pregunta clave es: ¿esta operación maximiza mejor tu capital que mantener liquidez, invertir en indexados o esperar otra oportunidad inmobiliaria?
                  </li>
                </ul>
              </div>
            </Tarjeta>
          </div>
        </div>
      </div>
    </div>
  );
}
