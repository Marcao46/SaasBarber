
import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import "./AlertaGlobal.css";

function identificarTipo(mensagem) {
  const texto = String(mensagem).toLowerCase();

  if (
    texto.includes("sucesso") ||
    texto.includes("cadastrad") ||
    texto.includes("atualizada")
  ) {
    return "sucesso";
  }

  if (
    texto.includes("atenção") ||
    texto.includes("preencha") ||
    texto.includes("senha") ||
    texto.includes("válido") ||
    texto.includes("já está")
  ) {
    return "aviso";
  }

  if (
    texto.includes("não foi possível") ||
    texto.includes("erro") ||
    texto.includes("falha")
  ) {
    return "erro";
  }

  return "info";
}

const configuracoes = {
  sucesso: {
    titulo: "Tudo certo!",
    icone: FaCheckCircle,
  },
  aviso: {
    titulo: "Atenção",
    icone: FaExclamationTriangle,
  },
  erro: {
    titulo: "Não foi possível concluir",
    icone: FaTimesCircle,
  },
  info: {
    titulo: "Aviso",
    icone: FaInfoCircle,
  },
};

export default function AlertaGlobal() {
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    const alertaOriginal = window.alert;

    window.alert = (mensagem) => {
      const texto = String(mensagem);
      const tipo = identificarTipo(texto);

      setAlerta({
        mensagem: texto,
        tipo,
      });
    };

    return () => {
      window.alert = alertaOriginal;
    };
  }, []);

  useEffect(() => {
    if (!alerta) return;

    const fecharComEscape = (evento) => {
      if (evento.key === "Escape") {
        setAlerta(null);
      }
    };

    window.addEventListener("keydown", fecharComEscape);

    return () => {
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [alerta]);

  if (!alerta) return null;

  const configuracao = configuracoes[alerta.tipo];
  const Icone = configuracao.icone;

  return (
    <div
      className="alerta-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          setAlerta(null);
        }
      }}
    >
      <div
        className={`alerta-modal alerta-${alerta.tipo}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alerta-titulo"
        aria-describedby="alerta-mensagem"
      >
        <div className="alerta-cabecalho">
          <div className="alerta-icone">
            <Icone />
          </div>

          <button
            className="alerta-fechar"
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setAlerta(null)}
          >
            ×
          </button>
        </div>

        <h2 id="alerta-titulo">{configuracao.titulo}</h2>

        <p id="alerta-mensagem">{alerta.mensagem}</p>

        <button
          className="alerta-botao"
          type="button"
          autoFocus
          onClick={() => setAlerta(null)}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
