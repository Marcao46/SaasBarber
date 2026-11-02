import { alterarAgendamento } from "../agendaApi";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaSearch,
  FaSyncAlt,
  FaClock,
  FaCut,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";

import { auth, db } from "../fireBaseConfig";
import "./GerenciarAgendamentos.css";

function normalizarStatus(status) {
  const valor = String(status || "pendente").toLowerCase();

  if (
    valor.includes("confirm") ||
    valor.includes("aprov")
  ) {
    return "confirmado";
  }

  if (
    valor.includes("cancel") ||
    valor.includes("recus")
  ) {
    return "cancelado";
  }

  if (
    valor.includes("conclu") ||
    valor.includes("finaliz")
  ) {
    return "concluido";
  }

  return "pendente";
}

function obterData(agendamento) {
  const valor =
    agendamento.data ||
    agendamento.dataAgendamento ||
    agendamento.dataHora ||
    agendamento.horario ||
    "";

  if (valor?.toDate && typeof valor.toDate === "function") {
    return valor.toDate();
  }

  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === "string" && valor) {
    // Evita interpretar uma data simples como UTC.
    const correspondencia = valor.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/
    );

    if (correspondencia) {
      const [, ano, mes, dia, hora = "00", minuto = "00"] =
        correspondencia;

      return new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto)
      );
    }

    const dataConvertida = new Date(valor);

    if (!Number.isNaN(dataConvertida.getTime())) {
      return dataConvertida;
    }
  }

  return null;
}

function formatarData(data) {
  if (!data) return "Data não informada";

  return data.toLocaleDateString("pt-BR");
}

function formatarHora(agendamento, data) {
  const horaSalva =
    agendamento.horarioInicio ||
    agendamento.hora ||
    agendamento.horarioAgendamento ||
    agendamento.horaAgendamento;

  if (typeof horaSalva === "string" && horaSalva) {
    return horaSalva;
  }

  if (data) {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "Horário não informado";
}

function obterNomeCliente(agendamento) {
  return (
    agendamento.nomeCliente ||
    agendamento.clienteNome ||
    agendamento.nome ||
    agendamento.cliente?.nome ||
    "Cliente não informado"
  );
}

function obterNomeBarbeiro(agendamento) {
  return (
    agendamento.nomeBarbeiro ||
    agendamento.barbeiroNome ||
    agendamento.profissional ||
    agendamento.barbeiro?.nome ||
    "Barbeiro não informado"
  );
}

function obterNomeServico(agendamento) {
  return (
    agendamento.nomeServico ||
    agendamento.servicoNome ||
    agendamento.servico?.nome ||
    (typeof agendamento.servico === "string"
      ? agendamento.servico
      : "") ||
    "Serviço não informado"
  );
}

function obterTelefone(agendamento) {
  return (
    agendamento.telefoneCliente ||
    agendamento.telefone ||
    agendamento.cliente?.telefone ||
    "Não informado"
  );
}

export default function GerenciarAgendamentos({ voltarPainel }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroData, setFiltroData] = useState("");

  async function carregarAgendamentos() {
    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        setErro("Faça login novamente para acessar os agendamentos.");
        setAgendamentos([]);
        return;
      }

      const consultaBarbearia = query(
        collection(db, "barbearias"),
        where("donoId", "==", usuario.uid)
      );

      const resultadoBarbearia = await getDocs(consultaBarbearia);

      if (resultadoBarbearia.empty) {
        setErro("Nenhuma barbearia foi encontrada para sua conta.");
        setAgendamentos([]);
        return;
      }

      const barbeariaId = resultadoBarbearia.docs[0].id;

      const consulta = query(
        collection(db, "agendamentos"),
        where("barbeariaId", "==", barbeariaId)
      );

      const resultado = await getDocs(consulta);

      const lista = resultado.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      lista.sort((a, b) => {
        const dataA = obterData(a)?.getTime() || 0;
        const dataB = obterData(b)?.getTime() || 0;

        return dataB - dataA;
      });

      setAgendamentos(lista);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);

      setErro(
        "Não foi possível carregar os agendamentos. Confira as permissões do Firebase e os campos dos documentos."
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    let parar = () => {};
    const usuario = auth.currentUser;
    if (!usuario) { setCarregando(false); return; }
    getDocs(query(collection(db, "barbearias"), where("donoId", "==", usuario.uid))).then(lojas => {
      if (!ativo) return;
      if (lojas.empty) { setErro("Nenhuma barbearia encontrada."); setCarregando(false); return; }
      parar = onSnapshot(query(collection(db, "agendamentos"), where("barbeariaId", "==", lojas.docs[0].id)), snap => {
        setAgendamentos(snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b) => `${b.data} ${b.horarioInicio}`.localeCompare(`${a.data} ${a.horarioInicio}`)));
        setCarregando(false);
      }, () => { setErro("Não foi possível acompanhar a agenda."); setCarregando(false); });
    }).catch(() => { if (ativo) { setErro("Não foi possível carregar a agenda."); setCarregando(false); } });
    return () => { ativo = false; parar(); };
  }, []);

  async function atualizarStatus(agendamento, novoStatus) {
    const nomeCliente = obterNomeCliente(agendamento);

    if (
      novoStatus === "cancelado" &&
      !window.confirm(
        `Deseja cancelar o agendamento de ${nomeCliente}?`
      )
    ) {
      return;
    }

    setErro("");
    setMensagem("");

    try {
      const acoes = { confirmado: "confirmar", cancelado: "cancelar", concluido: "concluir" };
      await alterarAgendamento({ id: agendamento.id, acao: acoes[novoStatus] });

      const textos = {
        confirmado: "Agendamento confirmado com sucesso.",
        cancelado: "Agendamento cancelado.",
        concluido: "Agendamento marcado como concluído.",
        pendente: "Agendamento marcado como pendente.",
      };

      setMensagem(textos[novoStatus] || "Status atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      setErro(
        "Não foi possível atualizar o status. Confira as regras do Firestore."
      );
    }
  }

  const agendamentosFiltrados = agendamentos.filter((item) => {
    const termo = busca.trim().toLowerCase();

    const textoPesquisa = [
      obterNomeCliente(item),
      obterNomeBarbeiro(item),
      obterNomeServico(item),
      obterTelefone(item),
      item.emailCliente || item.email || "",
    ]
      .join(" ")
      .toLowerCase();

    const status = normalizarStatus(item.status);
    const data = obterData(item);
    const dataFormatada = data
      ? [
          data.getFullYear(),
          String(data.getMonth() + 1).padStart(2, "0"),
          String(data.getDate()).padStart(2, "0"),
        ].join("-")
      : "";

    const correspondeBusca =
      !termo || textoPesquisa.includes(termo);

    const correspondeStatus =
      filtroStatus === "todos" || status === filtroStatus;

    const correspondeData =
      !filtroData || dataFormatada === filtroData;

    return (
      correspondeBusca &&
      correspondeStatus &&
      correspondeData
    );
  });

  const totalPendentes = agendamentos.filter(
    (item) => normalizarStatus(item.status) === "pendente"
  ).length;

  const totalConfirmados = agendamentos.filter(
    (item) => normalizarStatus(item.status) === "confirmado"
  ).length;

  const totalCancelados = agendamentos.filter(
    (item) => normalizarStatus(item.status) === "cancelado"
  ).length;

  return (
    <main className="ga-pagina">
      <header className="ga-header">
        <div className="ga-header-esquerda">
          <button
            type="button"
            className="ga-voltar"
            onClick={voltarPainel}
          >
            <FaArrowLeft />
            Voltar ao painel
          </button>

          <span className="ga-etiqueta">SAASBARBER</span>
          <h1>Agendamentos</h1>

          <p>
            Acompanhe os horários e gerencie os atendimentos da
            sua barbearia.
          </p>
        </div>

        <button
          type="button"
          className="ga-atualizar"
          onClick={() => {
            setAtualizando(true);
            carregarAgendamentos();
          }}
          disabled={carregando}
        >
          <FaSyncAlt />
          {atualizando ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      {erro && (
        <div className="ga-alerta ga-alerta-erro">
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro("")}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}

      {mensagem && (
        <div className="ga-alerta ga-alerta-sucesso">
          <span>{mensagem}</span>
          <button
            type="button"
            onClick={() => setMensagem("")}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}

      <section className="ga-resumos">
        <article className="ga-resumo">
          <div className="ga-resumo-icone ga-icone-total">
            <FaCalendarAlt />
          </div>
          <div>
            <span>Total de agendamentos</span>
            <strong>{agendamentos.length}</strong>
          </div>
        </article>

        <article className="ga-resumo">
          <div className="ga-resumo-icone ga-icone-pendente">
            <FaHourglassHalf />
          </div>
          <div>
            <span>Pendentes</span>
            <strong>{totalPendentes}</strong>
          </div>
        </article>

        <article className="ga-resumo">
          <div className="ga-resumo-icone ga-icone-confirmado">
            <FaCheckCircle />
          </div>
          <div>
            <span>Confirmados</span>
            <strong>{totalConfirmados}</strong>
          </div>
        </article>

        <article className="ga-resumo">
          <div className="ga-resumo-icone ga-icone-cancelado">
            <FaTimesCircle />
          </div>
          <div>
            <span>Cancelados</span>
            <strong>{totalCancelados}</strong>
          </div>
        </article>
      </section>

      <section className="ga-lista-container">
        <div className="ga-lista-titulo">
          <div>
            <h2>Lista de agendamentos</h2>
            <p>
              {agendamentosFiltrados.length} resultado(s) encontrado(s)
            </p>
          </div>
        </div>

        <div className="ga-filtros">
          <label className="ga-busca">
            <FaSearch />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar cliente, barbeiro ou serviço..."
            />
          </label>

          <label className="ga-filtro">
            <span>Status</span>
            <select
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>

          <label className="ga-filtro">
            <span>Data</span>
            <input
              type="date"
              value={filtroData}
              onChange={(event) => setFiltroData(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="ga-limpar"
            onClick={() => {
              setBusca("");
              setFiltroStatus("todos");
              setFiltroData("");
            }}
          >
            Limpar filtros
          </button>
        </div>

        {carregando ? (
          <div className="ga-estado">
            <div className="ga-spinner" />
            <p>Carregando agendamentos...</p>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="ga-vazio">
            <FaCalendarAlt />
            <h3>Nenhum agendamento encontrado</h3>
            <p>
              Não há agendamentos que correspondam aos filtros.
              Se você esperava ver registros, confira se eles estão
              salvos na coleção agendamentos com o campo barbeariaId.
            </p>
          </div>
        ) : (
          <div className="ga-tabela-area">
            <table className="ga-tabela">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Profissional</th>
                  <th>Data e hora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {agendamentosFiltrados.map((item) => {
                  const data = obterData(item);
                  const status = normalizarStatus(item.status);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="ga-cliente">
                          <div className="ga-avatar">
                            {obterNomeCliente(item)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{obterNomeCliente(item)}</strong>
                            <span>{obterTelefone(item)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="ga-info">
                          <FaCut />
                          <span>{obterNomeServico(item)}</span>
                        </div>
                      </td>

                      <td>{obterNomeBarbeiro(item)}</td>

                      <td>
                        <div className="ga-data">
                          <span>
                            {formatarData(data)}
                          </span>
                          <span>
                            <FaClock />
                            {formatarHora(item, data)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className={`ga-status ga-status-${status}`}>
                          {status === "confirmado" && <FaCheckCircle />}
                          {status === "pendente" && <FaHourglassHalf />}
                          {status === "cancelado" && <FaTimesCircle />}
                          {status === "concluido" && <FaCheckCircle />}

                          {item.reagendamento && "Reagendamento pendente ? "}
                          {status.charAt(0).toUpperCase() +
                            status.slice(1)}
                        </span>
                      </td>

                      <td>
                        <div className="ga-acoes">
                          {status === "pendente" && !item.reagendamento && (
                            <button
                              type="button"
                              className="ga-acao-confirmar"
                              onClick={() =>
                                atualizarStatus(item, "confirmado")
                              }
                            >
                              Confirmar
                            </button>
                          )}

                          {status === "confirmado" && !item.reagendamento && (
                            <button
                              type="button"
                              className="ga-acao-concluir"
                              onClick={() =>
                                atualizarStatus(item, "concluido")
                              }
                            >
                              Concluir
                            </button>
                          )}

                          {status !== "cancelado" &&
                            status !== "concluido" && (
                              <button
                                type="button"
                                className="ga-acao-cancelar"
                                onClick={() =>
                                  atualizarStatus(item, "cancelado")
                                }
                              >
                                Cancelar
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
