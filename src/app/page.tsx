import FidelityLanding from "./fidelity/page";

/**
 * La raíz "/" renderiza directamente la landing de Fidelity (en vez de
 * redirigir a "/fidelity"). Un redirect aquí agregaba un salto extra
 * antes de mostrar contenido, lo que en móvil (datos lentos, navegador
 * in-app de Google/Safari) se sentía como que la página "no cargaba" hasta
 * refrescar. Renderizarlo directo permite que Next la pre-genere estática.
 */
export default function Home() {
  return <FidelityLanding />;
}
