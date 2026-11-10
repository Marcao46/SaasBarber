
import ListaAgendamentos from "./ListaAgendamentos";
import DatasConfiguradas from "./DatasConfiguradas";
import { prepararAgendaBarbeiro } from '../agendaApi';

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaUser,
  FaHome,
  FaSignOutAlt,
  FaCut,
  FaBars,
  FaArrowLeft,
  FaSave,
  FaCalendarCheck,
} from "react-icons/fa";

import { auth, db } from "../fireBaseConfig";
import BotaoTema from "./BotaoTema";
import "./PainelBarbeiro.css";
import "./Agendamento.css";

const DIAS = [
  { id: "domingo", nome: "Domingo", curto: "DOM" },
  { id: "segunda", nome: "Segunda-feira", curto: "SEG" },
  { id: "terca", nome: "Terça-feira", curto: "TER" },
  { id: "quarta", nome: "Quarta-feira", curto: "QUA" },
  { id: "quinta", nome: "Quinta-feira", curto: "QUI" },
  { id: "sexta", nome: "Sexta-feira", curto: "SEX" },
  { id: "sabado", nome: "Sábado", curto: "SÁB" },
];

const disponibilidadeInicial = DIAS.map((dia) => ({
  dia: dia.id,
  ativo: dia.id !== "domingo",
  inicio: "09:00",
  fim: "18:00",
  intervaloInicio: "12:00",
  intervaloFim: "13:00",
}));

export default function PainelBarbeiro({ voltarHome }) {
  const usuario = auth.currentUser;

  const [aba, setAba] = useState("inicio");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [nome, setNome] = useState("Barbeiro");
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [disponibilidade, setDisponibilidade] = useState(
    disponibilidadeInicial
  );

  const [dataExcecao, setDataExcecao] = useState("");
  const [excecaoBloqueada, setExcecaoBloqueada] = useState(false);
  const [inicioExcecao, setInicioExcecao] = useState("09:00");
  const [fimExcecao, setFimExcecao] = useState("18:00");
  const [intervaloInicioExcecao, setIntervaloInicioExcecao] =
    useState("12:00");
  const [intervaloFimExcecao, setIntervaloFimExcecao] =
    useState("13:00");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [mensagemExcecao, setMensagemExcecao] = useState('');

  useEffect(() => {
    if (!usuario) {
      setCarregando(false);
      return;
    }

    carregarDados();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;

    return onSnapshot(
      query(
        collection(db, "agendamentos"),
        where("barbeiroId", "==", usuario.uid)
      ),
      (snap) => {
        const lista = snap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        }));

        setAgendamentos(lista);

        setClientes(
          Array.from(
            new Map(
              lista
                .filter((a) => a.clienteId)
                .map((a) => [
                  a.clienteId,
                  {
                    id: a.clienteId,
                    nome: a.clienteNome || "Cliente",
                  },
                ])
            ).values()
          )
        );
      },
      () =>
        mostrarMensagem(
          "Não foi possível acompanhar a agenda em tempo real.",
          "erro"
        )
    );
  }, [usuario]);

  function mostrarMensagem(texto, tipo = "sucesso") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  async function carregarDados() {
    if (!usuario) return;

    setCarregando(true);
    setMensagem("");

    try {
      const barbeirosSnap = await getDocs(
        query(
          collection(db, "barbeiros"),
          where("usuarioId", "==", usuario.uid)
        )
      );

      if (!barbeirosSnap.empty) {
        setNome(barbeirosSnap.docs[0].data().nome || "Barbeiro");
      }

      await prepararAgendaBarbeiro();

      const disponibilidadeSnap = await getDoc(
        doc(db, "disponibilidades", usuario.uid)
      );

      if (disponibilidadeSnap.exists()) {
        const dados = disponibilidadeSnap.data();

        if (Array.isArray(dados.semanal)) {
          setDisponibilidade(
            DIAS.map((dia) => {
              const salvo = dados.semanal.find(
                (item) => item.dia === dia.id
              );

              const inicial = disponibilidadeInicial.find(
                (item) => item.dia === dia.id
              );

              return salvo
                ? {
                    dia: dia.id,
                    ativo: Boolean(salvo.ativo),
                    inicio: salvo.inicio || "09:00",
                    fim: salvo.fim || "18:00",
                    intervaloInicio:
                      salvo.intervaloInicio || "12:00",
                    intervaloFim:
                      salvo.intervaloFim || "13:00",
                  }
                : inicial;
            })
          );
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar painel:", erro);

      mostrarMensagem(
        erro.message ||
          "Não foi possível carregar os dados. Verifique a conexão e as permissões do Firebase.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  }

  function atualizarDia(diaId, campo, valor) {
    setDisponibilidade((atual) =>
      atual.map((dia) =>
        dia.dia === diaId
          ? { ...dia, [campo]: valor }
          : dia
      )
    );
  }

  function validarHorario(inicio, fim) {
    return Boolean(inicio && fim && inicio < fim);
  }

  function validarIntervalo(
    inicio,
    fim,
    trabalhoInicio,
    trabalhoFim
  ) {
    if (!inicio && !fim) return true;
    if (!inicio || !fim || inicio >= fim) return false;

    return inicio >= trabalhoInicio && fim <= trabalhoFim;
  }

  async function salvarDisponibilidade() {
    if (!usuario) {
      mostrarMensagem("Sua sessão não está disponível.", "erro");
      return;
    }

    for (const dia of disponibilidade) {
      if (!dia.ativo) continue;

      if (!validarHorario(dia.inicio, dia.fim)) {
        mostrarMensagem(
          `Confira os horários de ${obterNomeDia(dia.dia)}.`,
          "erro"
        );
        return;
      }

      if (
        !validarIntervalo(
          dia.intervaloInicio,
          dia.intervaloFim,
          dia.inicio,
          dia.fim
        )
      ) {
        mostrarMensagem(
          `Confira o intervalo de ${obterNomeDia(dia.dia)}. Ele deve estar dentro do horário de trabalho.`,
          "erro"
        );
        return;
      }
    }

    setSalvando(true);
    setMensagem("");

    try {
      await setDoc(
        doc(db, "disponibilidades", usuario.uid),
        {
          barbeiroId: usuario.uid,
          semanal: disponibilidade,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );

      mostrarMensagem("Disponibilidade semanal salva com sucesso.");
    } catch (erro) {
      console.error("Erro ao salvar disponibilidade:", erro);

      mostrarMensagem(
        "Não foi possível salvar a disponibilidade. Verifique as permissões do Firebase.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarExcecao() {
    setMensagemExcecao('');

    if (!usuario || !dataExcecao) {
      mostrarMensagem("Selecione uma data para continuar.", "erro");
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataSelecionada = new Date(`${dataExcecao}T00:00:00`);

    if (dataSelecionada < hoje) {
      mostrarMensagem("Selecione hoje ou uma data futura.", "erro");
      return;
    }

    if (
      !excecaoBloqueada &&
      !validarHorario(inicioExcecao, fimExcecao)
    ) {
      mostrarMensagem("Confira o horário de início e fim.", "erro");
      return;
    }

    if (
      !excecaoBloqueada &&
      !validarIntervalo(
        intervaloInicioExcecao,
        intervaloFimExcecao,
        inicioExcecao,
        fimExcecao
      )
    ) {
      mostrarMensagem(
        "Confira o intervalo. Ele deve estar dentro do horário de trabalho.",
        "erro"
      );
      return;
    }

    setSalvando(true);
    setMensagem("");

    try {
      await setDoc(
        doc(
          db,
          "excecoesDisponibilidade",
          `${usuario.uid}_${dataExcecao}`
        ),
        {
          barbeiroId: usuario.uid,
          data: dataExcecao,
          bloqueada: excecaoBloqueada,
          inicio: inicioExcecao,
          fim: fimExcecao,
          intervaloInicio: intervaloInicioExcecao,
          intervaloFim: intervaloFimExcecao,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );

      mostrarMensagem("Ajuste da data salvo com sucesso.");

      setMensagemExcecao(
        `Ajuste de ${dataExcecao
          .split('-')
          .reverse()
          .join('/')} salvo: ${
          excecaoBloqueada
            ? 'dia bloqueado'
            : `dia liberado das ${inicioExcecao} às ${fimExcecao}`
        }.`
      );
    } catch (erro) {
      console.error("Erro ao salvar ajuste:", erro);

      setMensagemExcecao(
        'Não foi possível salvar o ajuste. Verifique a conexão e tente novamente.'
      );

      mostrarMensagem(
        "Não foi possível salvar o ajuste da data.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    try {
      await signOut(auth);
    } catch (erro) {
      console.error("Erro ao sair:", erro);
      mostrarMensagem("Não foi possível sair da conta.", "erro");
    }
  }

  function abrirAba(novaAba) {
    setAba(novaAba);
    setMensagem("");
    setMenuMobileAberto(false);
  }

  const agendamentosAtivos = agendamentos.filter(
    (item) =>
      ![
        "cancelado",
        "cancelada",
        "recusado",
        "concluido",
      ].includes(String(item.status || "").toLowerCase())
  );

  const itensMenu = [
    { id: "inicio", nome: "Início", icone: <FaHome /> },
    {
      id: "agendamentos",
      nome: "Meus Agendamentos",
      icone: <FaCalendarAlt />,
    },
    {
      id: "disponibilidade",
      nome: "Minha Disponibilidade",
      icone: <FaClock />,
    },
    {
      id: "clientes",
      nome: "Meus Clientes",
      icone: <FaUsers />,
    },
    {
      id: "perfil",
      nome: "Meu Perfil",
      icone: <FaUser />,
    },
  ];

  const titulos = {
    inicio: [
      `Olá, ${nome}!`,
      "Gerencie sua rotina de trabalho e acompanhe seus atendimentos.",
    ],
    agendamentos: [
      "Meus Agendamentos",
      "Consulte seus próximos atendimentos.",
    ],
    disponibilidade: [
      "Minha Disponibilidade",
      "Organize seus dias e horários de trabalho.",
    ],
    clientes: [
      "Meus Clientes",
      "Consulte os clientes que você atende.",
    ],
    perfil: ["Meu Perfil", "Seus dados profissionais."],
  };

  if (carregando) {
    return (
      <div className="barbeiro-layout">
        <main className="barbeiro-main">
          <p className="ag-loading">Carregando painel...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="barbeiro-layout">
      <button
        className="barbeiro-mobile-toggle"
        onClick={() => setMenuMobileAberto(!menuMobileAberto)}
        aria-label="Abrir ou fechar menu"
      >
        <FaBars />
      </button>

      {menuMobileAberto && (
        <button
          className="barbeiro-mobile-fundo"
          onClick={() => setMenuMobileAberto(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`barbeiro-sidebar ${
          menuMobileAberto ? "aberto" : ""
        }`}
      >
        <div className="barbeiro-marca">
          <div className="barbeiro-logo">
            <FaCut />
          </div>

          <div>
            <h2>SaaSBarber</h2>
            <p>Painel do Barbeiro</p>
          </div>
        </div>

        <div className="barbeiro-menu-titulo">
          MENU PRINCIPAL
        </div>

        <nav className="barbeiro-menu">
          {itensMenu.map((item) => (
            <button
              key={item.id}
              className={`barbeiro-menu-item ${
                aba === item.id ? "ativo" : ""
              }`}
              onClick={() => abrirAba(item.id)}
            >
              <span className="barbeiro-menu-icone">
                {item.icone}
              </span>

              <span>{item.nome}</span>
            </button>
          ))}
        </nav>

        <div className="barbeiro-sidebar-rodape">
          <div className="barbeiro-usuario">
            <div className="barbeiro-avatar">
              <FaUser />
            </div>

            <div>
              <strong>{nome}</strong>
              <span>Profissional do sistema</span>
            </div>
          </div>

          <button className="barbeiro-sair" onClick={sair}>
            <FaSignOutAlt />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <main className="barbeiro-main">
        <header className="barbeiro-cabecalho">
          <div>
            <span className="barbeiro-cabecalho-etiqueta">
              PAINEL DO BARBEIRO
            </span>

            <h1>{titulos[aba][0]}</h1>
            <p>{titulos[aba][1]}</p>
          </div>

          {/* AÇÕES DO CABEÇALHO */}
          <div className="barbeiro-cabecalho-acoes">
            <BotaoTema />

            {typeof voltarHome === "function" && (
              <button
                type="button"
                className="barbeiro-voltar-home"
                onClick={voltarHome}
              >
                <FaHome />
                <span>Voltar para Home</span>
              </button>
            )}
          </div>
        </header>

        {mensagem && (
          <p
            className={`ag-message ${
              tipoMensagem === "erro"
                ? "barbeiro-mensagem-erro"
                : "barbeiro-mensagem-sucesso"
            }`}
            role="status"
          >
            {mensagem}
          </p>
        )}

        {aba === "inicio" && (
          <>
            <section className="barbeiro-banner">
              <div>
                <span className="barbeiro-etiqueta">
                  SISTEMA DE BARBEARIA
                </span>

                <h2>Sua área do barbeiro</h2>

                <p>
                  Acompanhe seus agendamentos, organize sua
                  disponibilidade e gerencie sua rotina.
                </p>
              </div>

              <FaCut className="barbeiro-banner-icone" />
            </section>

            <section className="barbeiro-area">
              <div className="barbeiro-area-titulo">
                <h2>Minha Área</h2>
                <p>Escolha uma opção para continuar.</p>
              </div>

              <div className="barbeiro-cards">
                <button
                  className="barbeiro-card"
                  onClick={() => abrirAba("agendamentos")}
                >
                  <span className="barbeiro-card-icone">
                    <FaCalendarAlt />
                  </span>

                  <div className="barbeiro-card-texto">
                    <h3>Meus Agendamentos</h3>
                    <p>Consulte seus próximos atendimentos.</p>
                  </div>

                  <span className="barbeiro-seta">→</span>
                </button>

                <button
                  className="barbeiro-card"
                  onClick={() => abrirAba("disponibilidade")}
                >
                  <span className="barbeiro-card-icone">
                    <FaClock />
                  </span>

                  <div className="barbeiro-card-texto">
                    <h3>Minha Disponibilidade</h3>
                    <p>Defina seus dias e horários de trabalho.</p>
                  </div>

                  <span className="barbeiro-seta">→</span>
                </button>

                <button
                  className="barbeiro-card"
                  onClick={() => abrirAba("clientes")}
                >
                  <span className="barbeiro-card-icone">
                    <FaUsers />
                  </span>

                  <div className="barbeiro-card-texto">
                    <h3>Meus Clientes</h3>
                    <p>Consulte seus clientes e atendimentos.</p>
                  </div>

                  <span className="barbeiro-seta">→</span>
                </button>

                <button
                  className="barbeiro-card"
                  onClick={() => abrirAba("perfil")}
                >
                  <span className="barbeiro-card-icone">
                    <FaUser />
                  </span>

                  <div className="barbeiro-card-texto">
                    <h3>Meu Perfil</h3>
                    <p>Consulte seus dados profissionais.</p>
                  </div>

                  <span className="barbeiro-seta">→</span>
                </button>
              </div>

              <div className="barbeiro-resumo">
                <div>
                  <strong>{agendamentosAtivos.length}</strong>
                  <span>Agendamentos ativos</span>
                </div>

                <div>
                  <strong>{clientes.length}</strong>
                  <span>Clientes registrados</span>
                </div>
              </div>
            </section>
          </>
        )}

        {aba !== "inicio" && (
          <button
            className="barbeiro-voltar"
            onClick={() => abrirAba("inicio")}
          >
            <FaArrowLeft />
            Voltar ao início
          </button>
        )}

        {aba === "agendamentos" && (
          <ListaAgendamentos papel="barbeiro" />
        )}

        {aba === "clientes" && (
          <section className="barbeiro-secao">
            <h2>Meus Clientes</h2>

            {clientes.length === 0 ? (
              <p>Nenhum cliente encontrado nos agendamentos.</p>
            ) : (
              <div className="ag-fields">
                {clientes.map((cliente) => (
                  <article className="ag-card" key={cliente.id}>
                    <FaUser />
                    <h3>{cliente.nome}</h3>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {aba === "disponibilidade" && (
          <section className="barbeiro-secao barbeiro-disponibilidade">
            <div className="disp-intro">
              <div className="disp-intro-icone">
                <FaCalendarCheck />
              </div>

              <div>
                <h2>Minha Disponibilidade Semanal</h2>
                <p>
                  Escolha os dias em que atende e defina seus
                  horários de trabalho e intervalo.
                </p>
              </div>
            </div>

            <div className="disp-legenda">
              <span>
                <i className="disp-ponto disp-ponto-ativo" />
                Dia ativo
              </span>

              <span>
                <i className="disp-ponto disp-ponto-inativo" />
                Dia de folga
              </span>
            </div>

            <div className="disp-lista-dias">
              {disponibilidade.map((dia) => {
                const diaInfo = DIAS.find(
                  (item) => item.id === dia.dia
                );

                return (
                  <article
                    className={`disp-dia-card ${
                      dia.ativo
                        ? "disp-dia-ativo"
                        : "disp-dia-inativo"
                    }`}
                    key={dia.dia}
                  >
                    <div className="disp-dia-cabecalho">
                      <div className="disp-dia-identidade">
                        <div className="disp-dia-sigla">
                          {diaInfo?.curto}
                        </div>

                        <div>
                          <h3>{diaInfo?.nome}</h3>
                          <span>
                            {dia.ativo
                              ? "Horários de atendimento"
                              : "Dia de folga"}
                          </span>
                        </div>
                      </div>

                      <label className="disp-switch">
                        <input
                          type="checkbox"
                          checked={dia.ativo}
                          onChange={(e) =>
                            atualizarDia(
                              dia.dia,
                              "ativo",
                              e.target.checked
                            )
                          }
                        />

                        <span className="disp-switch-trilho" />

                        <span className="disp-switch-texto">
                          {dia.ativo ? "Ativo" : "Folga"}
                        </span>
                      </label>
                    </div>

                    {dia.ativo && (
                      <div className="disp-horarios">
                        <div className="disp-campo">
                          <label htmlFor={`${dia.dia}-inicio`}>
                            <FaClock />
                            Início do expediente
                          </label>

                          <input
                            id={`${dia.dia}-inicio`}
                            type="time"
                            value={dia.inicio}
                            onChange={(e) =>
                              atualizarDia(
                                dia.dia,
                                "inicio",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="disp-campo">
                          <label htmlFor={`${dia.dia}-fim`}>
                            <FaClock />
                            Fim do expediente
                          </label>

                          <input
                            id={`${dia.dia}-fim`}
                            type="time"
                            value={dia.fim}
                            onChange={(e) =>
                              atualizarDia(
                                dia.dia,
                                "fim",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="disp-campo">
                          <label htmlFor={`${dia.dia}-intervalo-inicio`}>
                            <FaClock />
                            Início do intervalo
                          </label>

                          <input
                            id={`${dia.dia}-intervalo-inicio`}
                            type="time"
                            value={dia.intervaloInicio}
                            onChange={(e) =>
                              atualizarDia(
                                dia.dia,
                                "intervaloInicio",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="disp-campo">
                          <label htmlFor={`${dia.dia}-intervalo-fim`}>
                            <FaClock />
                            Fim do intervalo
                          </label>

                          <input
                            id={`${dia.dia}-intervalo-fim`}
                            type="time"
                            value={dia.intervaloFim}
                            onChange={(e) =>
                              atualizarDia(
                                dia.dia,
                                "intervaloFim",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="disp-acoes">
              <p>
                <FaClock />
                Os horários definidos representam seu expediente semanal.
              </p>

              <button
                className="disp-botao-salvar"
                onClick={salvarDisponibilidade}
                disabled={salvando}
              >
                <FaSave />
                {salvando
                  ? "Salvando..."
                  : "Salvar disponibilidade semanal"}
              </button>
            </div>

            <div className="disp-divisor" />

            <div className="disp-excecao-cabecalho">
              <div className="disp-excecao-icone">
                <FaCalendarAlt />
              </div>

              <div>
                <h2>Ajustar uma data específica</h2>
                <p>
                  Configure um horário diferente ou bloqueie completamente um dia.
                </p>
              </div>
            </div>

            <div className="disp-excecao-card">
              <div className="disp-campo disp-campo-data">
                <label htmlFor="data-excecao">
                  <FaCalendarAlt />
                  Data do ajuste
                </label>

                <input
                  id="data-excecao"
                  type="date"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={dataExcecao}
                  onChange={(e) => setDataExcecao(e.target.value)}
                />
              </div>

              <label className="disp-bloquear-dia">
                <input
                  type="checkbox"
                  checked={excecaoBloqueada}
                  onChange={(e) =>
                    setExcecaoBloqueada(e.target.checked)
                  }
                />

                <span className="disp-bloquear-icone">
                  <FaCalendarAlt />
                </span>

                <span>
                  <strong>Bloquear este dia</strong>
                  <small>
                    Não disponibilizar horários nesta data.
                  </small>
                </span>
              </label>

              {!excecaoBloqueada && (
                <div className="disp-horarios disp-horarios-excecao">
                  <div className="disp-campo">
                    <label htmlFor="excecao-inicio">
                      Início do expediente
                    </label>

                    <input
                      id="excecao-inicio"
                      type="time"
                      value={inicioExcecao}
                      onChange={(e) =>
                        setInicioExcecao(e.target.value)
                      }
                    />
                  </div>

                  <div className="disp-campo">
                    <label htmlFor="excecao-fim">
                      Fim do expediente
                    </label>

                    <input
                      id="excecao-fim"
                      type="time"
                      value={fimExcecao}
                      onChange={(e) =>
                        setFimExcecao(e.target.value)
                      }
                    />
                  </div>

                  <div className="disp-campo">
                    <label htmlFor="excecao-intervalo-inicio">
                      Início do intervalo
                    </label>

                    <input
                      id="excecao-intervalo-inicio"
                      type="time"
                      value={intervaloInicioExcecao}
                      onChange={(e) =>
                        setIntervaloInicioExcecao(e.target.value)
                      }
                    />
                  </div>

                  <div className="disp-campo">
                    <label htmlFor="excecao-intervalo-fim">
                      Fim do intervalo
                    </label>

                    <input
                      id="excecao-intervalo-fim"
                      type="time"
                      value={intervaloFimExcecao}
                      onChange={(e) =>
                        setIntervaloFimExcecao(e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <button
                className="disp-botao-salvar disp-botao-excecao"
                onClick={salvarExcecao}
                disabled={salvando}
              >
                <FaSave />
                {salvando
                  ? "Salvando..."
                  : "Salvar ajuste da data"}
              </button>
            </div>

            {mensagemExcecao && (
              <p className="ag-message" role="status">
                {mensagemExcecao}
              </p>
            )}

            <DatasConfiguradas
              barbeiroId={usuario?.uid}
              editar
              aoSelecionar={(item) => {
                setDataExcecao(item.data);
                setExcecaoBloqueada(Boolean(item.bloqueada));
                setInicioExcecao(item.inicio || '09:00');
                setFimExcecao(item.fim || '18:00');
                setIntervaloInicioExcecao(
                  item.intervaloInicio || ''
                );
                setIntervaloFimExcecao(
                  item.intervaloFim || ''
                );
                setMensagemExcecao(
                  'Ajuste carregado para edição no formulário acima.'
                );
              }}
            />

            <p className="disp-nota">
              As datas liberadas aparecem no painel do cliente após salvar.
              Os horários respeitam a duração do serviço, os intervalos e as reservas existentes.
            </p>
          </section>
        )}

        {aba === "perfil" && (
          <section className="barbeiro-secao">
            <h2>Meu Perfil</h2>

            <p>
              <strong>Nome:</strong> {nome}
            </p>

            <p>
              <strong>E-mail:</strong>{" "}
              {usuario?.email || "Não disponível"}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
