
import { useEffect, useState } from "react";
import "./TemaGlobal.css";

const CHAVE_TEMA = "saasbarber-tema";

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA) === "escuro"
      ? "escuro"
      : "claro";
  } catch {
    return "claro";
  }
}

function IconeSol() {
  return (
    <svg viewBox="0 0 64 64" className="tema-icone-svg">
      <g
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M32 4 V12" />
        <path d="M32 52 V60" />
        <path d="M4 32 H12" />
        <path d="M52 32 H60" />
        <path d="M12.2 12.2 L18 18" />
        <path d="M46 46 L51.8 51.8" />
        <path d="M51.8 12.2 L46 18" />
        <path d="M18 46 L12.2 51.8" />
      </g>

      <circle cx="32" cy="32" r="12" fill="currentColor" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg viewBox="0 0 64 64" className="tema-icone-svg">
      <path
        d="M36 5 C49 11 57 22 57 33 C57 47 47 57 33 59 C42 51 44 42 44 32 C44 21 41 12 36 5Z"
        fill="currentColor"
      />

      <path
        d="M17 13 L20 20 L27 23 L20 26 L17 33 L14 26 L7 23 L14 20Z"
        fill="currentColor"
      />

      <path
        d="M10 39 L12 44 L17 46 L12 48 L10 53 L8 48 L3 46 L8 44Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function BotaoTema() {
  const [tema, setTema] = useState(lerTemaSalvo);

  const modoEscuro = tema === "escuro";

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    document.documentElement.style.colorScheme = tema;

    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (erro) {
      console.warn("Não foi possível salvar o tema.", erro);
    }
  }, [tema]);

  function alternarTema() {
    setTema((atual) =>
      atual === "claro" ? "escuro" : "claro"
    );
  }

  return (
    <button
      type="button"
      className={`tema-chave ${modoEscuro ? "tema-escuro" : "tema-claro"}`}
      onClick={alternarTema}
      aria-label={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={modoEscuro}
      title={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span className="tema-sol">
        <IconeSol />
      </span>

      <span className="tema-lua">
        <IconeLua />
      </span>

      <span className="tema-bolinha" />
    </button>
  );
}
