
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  FaCalendarAlt,
  FaClock,
  FaStore,
  FaUser,
  FaHome,
  FaSignOutAlt,
  FaArrowRight,
  FaCut,
  FaArrowLeft,
} from "react-icons/fa";

import { auth, db } from "../fireBaseConfig";
import ListaAgendamentos from "./ListaAgendamentos";
import AgendarHorarioCliente from "./AgendarHorarioCliente";
import BotaoTema from "./BotaoTema";
import "./PainelCliente.css";
import "./Agendamento.css";

export default function PainelCliente({ voltarHome }) {
  const [telaAtiva, setTelaAtiva] = useState("inicio");
  const [dadosCliente, setDadosCliente] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const usuario = auth.currentUser;

  const nomeCliente =
    dadosCliente?.nome ||
    dadosCliente?.nomeCompleto ||
    usuario?.displayName ||
    "Cliente";

  useEffect(() => {
    async function carregarPerfil() {
      if (!usuario) return;

      try {
        const resultado = await getDoc(
          doc(db, "clientes", usuario.uid)
        );

        if (resultado.exists()) {
          setDadosCliente(resultado.data());
        }
      } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
      }
    }

    carregarPerfil();
  }, [usuario]);

  async function sair() {
    try {
      await signOut(auth);
    } catch (erro) {
      console.error("Erro ao sair:", erro);
      setMensagem("Não foi possível sair da conta.");
    }
  }

  const opcoes = [
    {
      id: "agendar",
      titulo: "Agendar Horário",
      descricao: "Escolha uma barbearia, serviço, barbeiro e horário.",
      icone: <FaCalendarAlt />,
    },
    {
      id: "agendamentos",
      titulo: "Meus Agendamentos",
      descricao:
        "Consulte seus próximos horários e o histórico de agendamentos.",
      icone: <FaClock />,
    },
    {
      id: "barbearias",
      titulo: "Barbearias",
      descricao: "Consulte as barbearias disponíveis na sua região.",
      icone: <FaStore />,
    },
    {
      id: "perfil",
      titulo: "Meu Perfil",
      descricao: "Consulte seus dados pessoais.",
      icone: <FaUser />,
    },
  ];

  const tituloAtual =
    opcoes.find((opcao) => opcao.id === telaAtiva)?.titulo || "Início";

  function navegar(tela) {
    setMensagem("");
    setTelaAtiva(tela);
  }

  function conteudoInicio() {
    return (
      <>
        <section className="cliente-banner">
          <div className="cliente-banner-texto">
            <span className="cliente-etiqueta">
              SISTEMA DE BARBEARIA
            </span>

            <h2>Sua área do cliente</h2>

            <p>
              Aqui você pode agendar horários, consultar seus
              agendamentos e ver as barbearias disponíveis.
            </p>
          </div>

          <FaCut className="cliente-banner-icone" />
        </section>

        <section className="cliente-minha-area">
          <h2>Minha Área</h2>

          <p className="cliente-area-subtitulo">
            Escolha uma opção para continuar.
          </p>

          <div className="cliente-cartoes">
            {opcoes.map((opcao) => (
              <button
                type="button"
                className="cliente-cartao"
                key={opcao.id}
                onClick={() => navegar(opcao.id)}
              >
                <span className="cliente-cartao-icone">
                  {opcao.icone}
                </span>

                <span className="cliente-cartao-texto">
                  <strong>{opcao.titulo}</strong>
                  <span>{opcao.descricao}</span>
                </span>

                <FaArrowRight className="cliente-cartao-seta" />
              </button>
            ))}
          </div>
        </section>
      </>
    );
  }

  function conteudoAgendamentos() {
    return <ListaAgendamentos />;
  }

  function conteudoPerfil() {
    return (
      <section className="cliente-secao">
        <h2>Meu Perfil</h2>

        <p className="cliente-area-subtitulo">
          Consulte os dados da sua conta.
        </p>

        <div className="cliente-perfil-card">
          <span className="cliente-perfil-icone">
            <FaUser />
          </span>

          <div>
            <h3>{nomeCliente}</h3>

            <p>
              <strong>E-mail:</strong>{" "}
              {dadosCliente?.email ||
                usuario?.email ||
                "Não informado"}
            </p>

            <p>
              <strong>Telefone:</strong>{" "}
              {dadosCliente?.telefone || "Não informado"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  function conteudoBarbearias() {
    return (
      <section className="cliente-secao">
        <h2>Barbearias</h2>

        <p className="cliente-area-subtitulo">
          Consulte os profissionais e os serviços disponíveis para
          agendar seu horário.
        </p>

        <div className="cliente-vazio">
          <FaStore />

          <h3>Encontre seu próximo horário</h3>

          <p>
            Acesse o agendamento para consultar os barbeiros e
            serviços cadastrados no sistema.
          </p>

          <button
            type="button"
            className="cliente-botao"
            onClick={() => navegar("agendar")}
          >
            Consultar horários
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="cliente-layout">
      <aside className="cliente-sidebar">
        <div className="cliente-marca">
          <div className="cliente-logo">
            <FaCut />
          </div>

          <div>
            <h2>SaaSBarber</h2>
            <p>Painel do Cliente</p>
          </div>
        </div>

        <div className="cliente-menu-titulo">
          MENU PRINCIPAL
        </div>

        <nav className="cliente-menu">
          <button
            type="button"
            className={telaAtiva === "inicio" ? "ativo" : ""}
            onClick={() => navegar("inicio")}
          >
            <FaHome />
            <span>Início</span>
          </button>

          {opcoes.map((opcao) => (
            <button
              type="button"
              key={opcao.id}
              className={telaAtiva === opcao.id ? "ativo" : ""}
              onClick={() => navegar(opcao.id)}
            >
              {opcao.icone}
              <span>{opcao.titulo}</span>
            </button>
          ))}
        </nav>

        <div className="cliente-sidebar-rodape">
          <div className="cliente-identificacao">
            <div className="cliente-avatar">
              <FaUser />
            </div>

            <div>
              <strong>{nomeCliente}</strong>
              <span>Cliente</span>
            </div>
          </div>

          <button
            type="button"
            className="cliente-sair"
            onClick={sair}
          >
            <FaSignOutAlt />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <main className="cliente-principal">
        <header className="cliente-cabecalho">
          <div>
            <span className="cliente-sobretitulo">
              PAINEL DO CLIENTE
            </span>
            <h1>
              {telaAtiva === "inicio"
                ? `Olá, ${nomeCliente}!`
                : tituloAtual}
            </h1>

            <p>
              {telaAtiva === "inicio"
                ? "Agende seus serviços e acompanhe seus horários."
                : "Gerencie suas informações no SaaSBarber."}
            </p>
          </div>

          <div className="cliente-cabecalho-acoes">
            <BotaoTema />

            {typeof voltarHome === "function" && (
              <button
                type="button"
                className="cliente-voltar-home"
                onClick={voltarHome}
              >
                <FaHome />
                <span>Voltar para Home</span>
              </button>
            )}
          </div>
        </header>

        {mensagem && (
          <p role="status" className="cliente-alerta">
            {mensagem}
          </p>
        )}

        {telaAtiva === "inicio" && conteudoInicio()}

        {telaAtiva === "agendar" && (
          <section className="cliente-secao">
            <button
              type="button"
              className="cliente-voltar"
              onClick={() => navegar("inicio")}
            >
              <FaArrowLeft /> Voltar ao início
            </button>

            <AgendarHorarioCliente
              voltar={() => navegar("inicio")}
            />
          </section>
        )}

        {telaAtiva === "agendamentos" &&
          conteudoAgendamentos()}

        {telaAtiva === "barbearias" &&
          conteudoBarbearias()}

        {telaAtiva === "perfil" &&
          conteudoPerfil()}
      </main>
    </div>
  );
}
