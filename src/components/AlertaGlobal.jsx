
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";
import "./AlertaGlobal.css";

function identificarTipo(mensagem) {
  const texto = String(mensagem).toLowerCase();

  if (
    texto.includes("sucesso") ||
    texto.includes("cadastrad") ||
    texto.includes("atualizada") ||
    texto.includes("excluída")
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
  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    const alertaOriginal = window.alert;
    const confirmarOriginal = window.confirm;

    window.alert = (mensagem) => {
      const texto = String(mensagem);

      setAlerta({
        mensagem: texto,
        tipo: identificarTipo(texto),
      });
    };

    // Nova confirmação personalizada assíncrona.
    window.confirmarPersonalizado = (mensagem, opcoes = {}) =>
      new Promise((resolver) => {
        setConfirmacao({
          mensagem: String(mensagem),
          titulo: opcoes.titulo || "Confirmar ação",
          textoConfirmar: opcoes.textoConfirmar || "Confirmar",
          tipo: opcoes.tipo || "aviso",
          resolver,
        });
      });

    return () => {
      window.alert = alertaOriginal;
      window.confirm = confirmarOriginal;
      delete window.confirmarPersonalizado;
    };
  }, []);

  useEffect(() => {
    if (!alerta && !confirmacao) return;

    const fecharComEscape = (evento) => {
      if (evento.key === "Escape") {
        if (confirmacao) {
          confirmacao.resolver(false);
          setConfirmacao(null);
        } else {
          setAlerta(null);
        }
      }
    };

    window.addEventListener("keydown", fecharComEscape);

    return () => {
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [alerta, confirmacao]);

  const resolverConfirmacao = (resultado) => {
    if (!confirmacao) return;

    confirmacao.resolver(resultado);
    setConfirmacao(null);
  };

  if (!alerta && !confirmacao) return null;

  if (confirmacao) {
    const Icone =
      confirmacao.tipo === "exclusao"
        ? FaTrashAlt
        : FaExclamationTriangle;

    return (
      <div
        className="alerta-overlay"
        onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) {
            resolverConfirmacao(false);
          }
        }}
      >
        <div
          className={`alerta-modal alerta-${confirmacao.tipo}`}
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
              onClick={() => resolverConfirmacao(false)}
            >
              ×
            </button>
          </div>

          <h2 id="alerta-titulo">{confirmacao.titulo}</h2>

          <p id="alerta-mensagem">{confirmacao.mensagem}</p>

          <div className="alerta-acoes">
            <button
              className="alerta-botao alerta-botao-secundario"
              type="button"
              onClick={() => resolverConfirmacao(false)}
            >
              Cancelar
            </button>

            <button
              className={`alerta-botao ${
                confirmacao.tipo === "exclusao"
                  ? "alerta-botao-perigo"
                  : ""
              }`}
              type="button"
              onClick={() => resolverConfirmacao(true)}
            >
              {confirmacao.textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
