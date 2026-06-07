import { redirect } from "next/navigation";

/**
 * La raíz "/" redirige a "/fidelity".
 * Cuando integres esto a roxierco.com, esta redirección se ajusta
 * según cómo conectes el dominio principal.
 */
export default function Home() {
  redirect("/fidelity");
}
