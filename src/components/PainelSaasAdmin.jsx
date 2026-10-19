
import {
  FaStore,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCreditCard,
  FaBox,
  FaCog,
  FaCut,
  FaHome,
  FaSignOutAlt,
  FaArrowRight,
  FaUserShield,
  FaArrowLeft,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

import GerenciarBarbearias from "./GerenciarBarbearias";
import { auth, db } from "../fireBaseConfig";

import "./PainelSaasAdmin.css";

export default function PainelSaasAdmin({ voltarHome }) {
  const [totalBarbearias, setTotalBarbearias] = useState(0);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarBarbearias() {
      try {
        const resultado = await getDocs(collection(db, "barbearias"));
        setTotalBarbearias(resultado.size);
      } catch (erro) {
        console.error("Erro ao buscar barbearias:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarBarbearias();
  }, []);

  async function sair() {
    try {
      await signOut(auth);

      if (typeof voltarHome === "function") {
        voltarHome();
      } else {
        window.location.reload();
      }
    } catch (erro) {
      console.error("Erro ao sair:", erro);
      alert("Não foi possível sair da conta.");
    }
  }

  const opcoes = [
    {
      titulo: "Barbearias",
      descricao: "Consulte e gerencie as barbearias cadastradas.",
      icone: <FaStore />,
      secao: "barbearias",
      acao: () => setSecaoAtiva("barbearias"),
    },
    {
      titulo: "Assinaturas",
      descricao: "Área de controle dos planos e assinaturas.",
      icone: <FaCreditCard />,
      secao: "assinaturas",
      acao: () => setSecaoAtiva("assinaturas"),
    },
    {
      titulo: "Pendências",
      descricao: "Consulte pagamentos e vencimentos.",
      icone: <FaExclamationTriangle />,
      secao: "pendencias",
      acao: () => setSecaoAtiva("pendencias"),
    },
    {
      titulo: "Financeiro",
      descricao: "Acompanhe as informações financeiras.",
      icone: <FaMoneyBillWave />,
      secao: "financeiro",
      acao: () => setSecaoAtiva("financeiro"),
    },
    {
      titulo: "Planos",
      descricao: "Área para configurar os planos oferecidos.",
      icone: <FaBox />,
      secao: "planos",
      acao: () => setSecaoAtiva("planos"),
    },
    {
      titulo: "Configurações",
      descricao: "Configurações gerais da plataforma.",
      icone: <FaCog />,
      secao: "configuracoes",
      acao: () => setSecaoAtiva("configuracoes"),
    },
  ];

  const titulos = {
    inicio: "Painel Administrativo",
    barbearias: "Barbearias",
    assinaturas: "Assinaturas",
    pendencias: "Pendências",
    financeiro: "Financeiro",
    planos: "Planos",
    configuracoes: "Configurações",
  };

  const opcaoAtual = opcoes.find(
    (opcao) => opcao.secao === secaoAtiva
  );

  return (
    <div className="painel-saas-admin">
      <aside className="saas-sidebar">
        <div className="saas-logo">
          <div className="saas-logo-icone">
            <FaCut />
          </div>

          <div>
            <h2>SaaSBarber</h2>
            <p>Painel Administrativo</p>
          </div>
        </div>

        <p className="saas-menu-titulo">MENU PRINCIPAL</p>

        <nav className="saas-menu">
          <button
            type="button"
            className={secaoAtiva === "inicio" ? "ativo" : ""}
            onClick={() => setSecaoAtiva("inicio")}
          >
            <FaHome />
            <span>Início</span>
          </button>

          {opcoes.map((opcao) => (
            <button
              type="button"
              key={opcao.titulo}
              className={
                secaoAtiva === opcao.secao ? "ativo" : ""
              }
              onClick={opcao.acao}
            >
              {opcao.icone}
              <span>{opcao.titulo}</span>
            </button>
          ))}
        </nav>

        <div className="saas-sidebar-rodape">
          <div className="saas-admin-identificacao">
            <div className="saas-admin-avatar">
              <FaUserShield />
            </div>

            <div>
              <strong>Administrador</strong>
              <p>Administração do sistema</p>
            </div>
          </div>

          <button
            type="button"
            className="saas-sair"
            onClick={sair}
          >
            <FaSignOutAlt />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <main className="saas-conteudo">
        <header className="saas-cabecalho">
          <div className="saas-cabecalho-titulo">
            <small>ADMINISTRAÇÃO DA PLATAFORMA</small>
            <h1>{titulos[secaoAtiva]}</h1>
            <p>
              Gerencie as áreas administrativas do SaaSBarber.
            </p>
          </div>

          <div className="saas-cabecalho-acoes">
            <div className="saas-boas-vindas">
              <FaUserShield className="saas-boas-vindas-icone" />
              <span>Bem-vindo, Admin!</span>
            </div>

            {typeof voltarHome === "function" && (
              <button
                type="button"
                className="saas-voltar-home"
                onClick={voltarHome}
              >
                <FaHome />
                <span>Voltar para Home</span>
              </button>
            )}
          </div>
        </header>

        {secaoAtiva === "inicio" ? (
          <>
            <section className="saas-banner">
              <div>
                <small>SISTEMA DE BARBEARIA</small>
                <h2>Sua central administrativa</h2>
                <p>
                  Acompanhe as barbearias cadastradas e acesse as
                  ferramentas de gerenciamento da plataforma.
                </p>
              </div>

              <FaCut className="saas-banner-icone" />
            </section>

            <section className="saas-secao">
              <h2>Resumo da plataforma</h2>
              <p className="saas-subtitulo">
                Indicadores disponíveis no sistema.
              </p>

              <div className="saas-indicadores">
                <div className="saas-indicador">
                  <div className="saas-indicador-icone">
                    <FaStore />
                  </div>

                  <div className="saas-indicador-texto">
                    <p>Barbearias cadastradas</p>
                    <strong>
                      {carregando ? "..." : totalBarbearias}
                    </strong>
                  </div>
                </div>

                <div className="saas-indicador">
                  <div className="saas-indicador-icone">
                    <FaCheckCircle />
                  </div>

                  <div className="saas-indicador-texto">
                    <p>Assinaturas ativas</p>
                    <strong>—</strong>
                  </div>
                </div>

                <div className="saas-indicador">
                  <div className="saas-indicador-icone">
                    <FaExclamationTriangle />
                  </div>

                  <div className="saas-indicador-texto">
                    <p>Pendências</p>
                    <strong>—</strong>
                  </div>
                </div>

                <div className="saas-indicador">
                  <div className="saas-indicador-icone">
                    <FaMoneyBillWave />
                  </div>

                  <div className="saas-indicador-texto">
                    <p>Receita mensal</p>
                    <strong>—</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="saas-secao">
              <h2>Gestão da plataforma</h2>
              <p className="saas-subtitulo">
                Escolha uma opção para continuar.
              </p>

              <div className="saas-cartoes">
                {opcoes.map((opcao) => (
                  <button
                    type="button"
                    className="saas-cartao"
                    key={opcao.titulo}
                    onClick={opcao.acao}
                  >
                    <span className="saas-cartao-icone">
                      {opcao.icone}
                    </span>

                    <div className="saas-cartao-texto">
                      <h3>{opcao.titulo}</h3>
                      <p>{opcao.descricao}</p>
                    </div>

                    <FaArrowRight className="saas-cartao-seta" />
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : secaoAtiva === "barbearias" ? (
          <section className="saas-secao saas-area-barbearias">
            <GerenciarBarbearias
              voltarPainel={() => setSecaoAtiva("inicio")}
            />
          </section>
        ) : (
          <section className="saas-secao">
            <div className="saas-secao-placeholder">
              <div className="saas-indicador-icone">
                {opcaoAtual?.icone}
              </div>

              <h2>{titulos[secaoAtiva]}</h2>

              <p>
                Esta área ainda não possui gerenciamento implementado.
              </p>

              <button
                type="button"
                className="saas-botao"
                onClick={() => setSecaoAtiva("inicio")}
              >
                <FaArrowLeft />
                <span>Voltar ao painel</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
