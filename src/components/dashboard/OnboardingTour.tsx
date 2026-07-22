"use client";

import { useState, useEffect } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

const PASOS: { icon: IconName; titulo: string; desc: string }[] = [
  {
    icon: "tarjeta",
    titulo: "Mis tarjetas",
    desc: "Aquí creas y personalizas tu tarjeta de lealtad digital. Define cuántos sellos necesita el cliente para ganar su recompensa y elige los colores de tu marca.",
  },
  {
    icon: "clientes",
    titulo: "Clientes",
    desc: "Ve todos los clientes que tienen tu tarjeta. Puedes ver cuántos sellos llevan y cuándo fue su última visita.",
  },
  {
    icon: "promocion",
    titulo: "Promociones",
    desc: "Crea ofertas especiales con tiempo limitado — 2x1, descuentos, sellos dobles. Se mandan automáticamente como notificación push a tus clientes.",
  },
  {
    icon: "campana",
    titulo: "Notificaciones",
    desc: "Envía mensajes directos a todos tus clientes. Útil para anunciar novedades, cambios de horario o eventos especiales.",
  },
  {
    icon: "ajustes",
    titulo: "Configuración",
    desc: "Sube el logo de tu negocio y gestiona tu suscripción. Tu logo aparece en el sidebar y en la tarjeta de tus clientes.",
  },
];

const STORAGE_KEY = "roxier_tour_visto";

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function cerrar() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setPaso(0);
  }

  function siguiente() {
    if (paso < PASOS.length - 1) setPaso(paso + 1);
    else cerrar();
  }

  function anterior() {
    if (paso > 0) setPaso(paso - 1);
  }

  if (!visible) return null;

  const actual = PASOS[paso];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface border border-surface-border shadow-2xl p-6 space-y-5">

        {/* Progreso */}
        <div className="flex gap-1.5">
          {PASOS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= paso ? "bg-magenta" : "bg-surface-border"}`}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="text-center space-y-3">
          <Icon name={actual.icon} className="h-12 w-12 text-magenta" />
          <h2 className="text-xl font-black text-paper">{actual.titulo}</h2>
          <p className="text-mist text-sm leading-relaxed">{actual.desc}</p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 pt-1">
          {paso > 0 ? (
            <button onClick={anterior} className="flex-1 rounded-xl border border-surface-border py-2.5 text-sm font-semibold text-mist hover:text-paper transition-colors">
              Anterior
            </button>
          ) : (
            <button onClick={cerrar} className="flex-1 rounded-xl border border-surface-border py-2.5 text-sm font-semibold text-mist hover:text-paper transition-colors">
              Saltar
            </button>
          )}
          <button onClick={siguiente} className="flex-1 rounded-xl bg-magenta py-2.5 text-sm font-bold text-white hover:bg-magenta/90 transition-colors">
            {paso < PASOS.length - 1 ? "Siguiente →" : "¡Empezar!"}
          </button>
        </div>

        <p className="text-center text-xs text-mist">
          Paso {paso + 1} de {PASOS.length}
        </p>
      </div>
    </div>
  );
}

// Función para relanzar el tour desde cualquier parte
export function relanzarTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
