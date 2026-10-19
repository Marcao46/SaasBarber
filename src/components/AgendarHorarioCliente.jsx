import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  runTransaction,
} from "firebase/firestore";

import { auth, db } from "../fireBaseConfig";
import { FaArrowLeft, FaCalendarAlt, FaClock } from "react-icons/fa";
import "./Agendamento.css";

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function adicionarMinutos(horario, minutos) {
  const [h, m] = horario.split(":").map(Number);
  const total = h * 60 + m + minutos;

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

function minutos(horario) {
  if (!horario || !horario.includes(":")) return 0;

  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterDuracao(servico) {
  const valor =
    servico?.duracaoMinutos ??
    servico?.duracao ??
    servico?.tempoMinutos ??
    30;

  const numero = Number(valor);

  return Number.isFinite(numero) && numero > 0 ? numero : 30;
}

export default function AgendarHorarioCliente({ voltar }) {
  const usuario = auth.currentUser;

  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState(dataLocalISO());
  const [horario, setHorario] = useState("");

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const barbeiroSelecionado = useMemo(
    () => barbeiros.find((item) => item.id === barbeiroId),
    [barbeiros, barbeiroId]
  );

  const servicoSelecionado = useMemo(
    () => servicos.find((item) => item.id === servicoId),
    [servicos, servicoId]
  );

  useEffect(() => {
    carregarOpcoes();
  }, []);

  useEffect(() => {
    setHorario("");
    setHorariosDisponiveis([]);

    if (barbeiroId && servicoId && data) {
      carregarHorarios();
    }
  }, [barbeiroId, servicoId, data]);

  async function carregarOpcoes() {
    setCarregando(true);
    setMensagem("");

    try {
      const [resultadoBarbeiros, resultadoServicos] = await Promise.all([
        getDocs(collection(db, "barbeiros")),
        getDocs(collection(db, "servicos")),
      ]);

      const listaBarbeiros = resultadoBarbeiros.docs
        .map((item) => ({
          id: item.data().usuarioId || item.id,
          documentoId: item.id,
          ...item.data(),
        }))
        .filter((item) => item.usuarioId || item.id);

      const listaServicos = resultadoServicos.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setBarbeiros(listaBarbeiros);
      setServicos(listaServicos);
    } catch (erro) {
      console.error("Erro ao carregar opções:", erro);
      setMensagem(
        "Não foi possível carregar os barbeiros e serviços. Confira o Firebase."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarHorarios() {
    setMensagem("");

    try {
      const barbeiro = barbeiros.find((item) => item.id === barbeiroId);

      if (!barbeiro) {
        setHorariosDisponiveis([]);
        return;
      }

      const dataEscolhida = new Date(`${data}T12:00:00`);
      const diaSemana = DIAS_SEMANA[dataEscolhida.getDay()];

      const disponibilidadeRef = doc(
        db,
        "disponibilidades",
        barbeiroId
      );

      const disponibilidadeSnap = await getDoc(disponibilidadeRef);

      if (!disponibilidadeSnap.exists()) {
        setHorariosDisponiveis([]);
        setMensagem(
          "Este barbeiro ainda não configurou a disponibilidade semanal."
        );
        return;
      }

      const dadosDisponibilidade = disponibilidadeSnap.data();
      const configuracaoDia = (dadosDisponibilidade.semanal || []).find(
        (item) => item.dia === diaSemana
      );

      if (!configuracaoDia || configuracaoDia.ativo === false) {
        setHorariosDisponiveis([]);
        setMensagem("O barbeiro não atende neste dia da semana.");
        return;
      }

      let inicio = configuracaoDia.inicio || "09:00";
      let fim = configuracaoDia.fim || "18:00";
      let intervaloInicio = configuracaoDia.intervaloInicio || "";
      let intervaloFim = configuracaoDia.intervaloFim || "";

      const excecaoRef = doc(
        db,
        "excecoesDisponibilidade",
        `${barbeiroId}_${data}`
      );

      const excecaoSnap = await getDoc(excecaoRef);

      if (excecaoSnap.exists()) {
        const excecao = excecaoSnap.data();

        if (excecao.bloqueada) {
          setHorariosDisponiveis([]);
          setMensagem("O barbeiro bloqueou os horários desta data.");
          return;
        }

        inicio = excecao.inicio || inicio;
        fim = excecao.fim || fim;
        intervaloInicio = excecao.intervaloInicio || "";
        intervaloFim = excecao.intervaloFim || "";
      }

      const consultaAgendamentos = query(
        collection(db, "agendamentos"),
        where("barbeiroId", "==", barbeiroId),
        where("data", "==", data)
      );

      const resultadoAgendamentos = await getDocs(consultaAgendamentos);

      const ocupados = resultadoAgendamentos.docs
        .map((item) => item.data())
        .filter(
          (item) =>
            !["cancelado", "cancelada"].includes(
              String(item.status || "").toLowerCase()
            )
        );

      const duracao = obterDuracao(servicoSelecionado);
      const opcoes = [];
      const agora = new Date();
      const hoje = dataLocalISO(agora);
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

      for (
        let inicioMinutos = minutos(inicio);
        inicioMinutos + duracao <= minutos(fim);
        inicioMinutos += 30
      ) {
        const horarioInicio = `${String(
          Math.floor(inicioMinutos / 60)
        ).padStart(2, "0")}:${String(inicioMinutos % 60).padStart(2, "0")}`;

        const horarioFim = adicionarMinutos(horarioInicio, duracao);

        if (
          data === hoje &&
          inicioMinutos <= minutosAgora
        ) {
          continue;
        }

        if (
          intervaloInicio &&
          intervaloFim &&
          inicioMinutos < minutos(intervaloFim) &&
          minutos(horarioFim) > minutos(intervaloInicio)
        ) {
          continue;
        }

        const conflito = ocupados.some((item) => {
          if (!item.horarioInicio || !item.horarioFim) return false;

          return (
            inicioMinutos < minutos(item.horarioFim) &&
            minutos(horarioFim) > minutos(item.horarioInicio)
          );
        });

        if (!conflito) {
          opcoes.push(horarioInicio);
        }
      }

      setHorariosDisponiveis(opcoes);

      if (opcoes.length === 0) {
        setMensagem("Não há horários disponíveis para esta seleção.");
      }
    } catch (erro) {
      console.error("Erro ao consultar horários:", erro);
      setHorariosDisponiveis([]);
      setMensagem("Erro ao consultar os horários disponíveis.");
    }
  }

  async function confirmarAgendamento(event) {
    event.preventDefault();

    if (!usuario) {
      setMensagem("Entre na sua conta de cliente para agendar.");
      return;
    }

    if (!barbeiroSelecionado || !servicoSelecionado || !horario || !data) {
      setMensagem("Selecione o barbeiro, o serviço, a data e o horário.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    try {
      const clienteSnap = await getDoc(doc(db, "clientes", usuario.uid));
      const cliente = clienteSnap.exists() ? clienteSnap.data() : {};

      const duracao = obterDuracao(servicoSelecionado);
      const horarioFim = adicionarMinutos(horario, duracao);

      const agendamento = {
        barbeiroId,
        barbeiroNome: barbeiroSelecionado.nome || "Barbeiro",
        clienteId: usuario.uid,
        clienteNome:
          cliente.nome || usuario.displayName || usuario.email || "Cliente",
        servicoId: servicoSelecionado.id,
        servicoNome: servicoSelecionado.nome || servicoSelecionado.nomeServico || "Serviço",
        duracaoMinutos: duracao,
        data,
        horarioInicio: horario,
        horarioFim,
        status: "confirmado",
        barbeariaId: barbeiroSelecionado.barbeariaId || "",
        criadoEm: serverTimestamp(),
      };

      const reservaId = `${barbeiroId}_${data}_${horario.replace(":", "")}`;
      const reservaRef = doc(db, "reservasHorario", reservaId);

      await runTransaction(db, async (transacao) => {
        const reservaSnap = await transacao.get(reservaRef);

        if (reservaSnap.exists()) {
          throw new Error(
            "Este horário acabou de ser reservado. Escolha outro."
          );
        }

        transacao.set(reservaRef, {
          barbeiroId,
          data,
          horarioInicio: horario,
          horarioFim,
          clienteId: usuario.uid,
          criadoEm: serverTimestamp(),
        });

        const agendamentoRef = doc(collection(db, "agendamentos"));
        transacao.set(agendamentoRef, agendamento);
      });

      setMensagem("Agendamento confirmado com sucesso!");
      setHorario("");
      await carregarHorarios();
    } catch (erro) {
      console.error("Erro ao agendar:", erro);
      setMensagem(
        erro.message ||
          "Não foi possível confirmar o agendamento. Tente novamente."
      );
      await carregarHorarios();
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="ag-container">
        <div className="ag-card">
          <p className="ag-loading">Carregando opções de agendamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ag-container">
      <div className="ag-card">
        {voltar && (
          <button type="button" className="ag-button" onClick={voltar}>
            <FaArrowLeft /> Voltar ao painel
          </button>
        )}

        <h1>
          <FaCalendarAlt /> Agendar horário
        </h1>

        <p>Escolha o profissional, o serviço, a data e um horário livre.</p>

        <form className="ag-form" onSubmit={confirmarAgendamento}>
          <label>
            Barbeiro
            <select
              value={barbeiroId}
              onChange={(e) => setBarbeiroId(e.target.value)}
              required
            >
              <option value="">Selecione o barbeiro</option>
              {barbeiros.map((barbeiro) => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome || "Barbeiro"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Serviço
            <select
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              required
            >
              <option value="">Selecione o serviço</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome || servico.nomeServico || "Serviço"} —{" "}
                  {obterDuracao(servico)} min
                </option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input
              type="date"
              value={data}
              min={dataLocalISO()}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </label>

          <div>
            <h3>
              <FaClock /> Horários disponíveis
            </h3>

            {horariosDisponiveis.length > 0 ? (
              <div className="ag-fields">
                {horariosDisponiveis.map((opcao) => (
                  <button
                    type="button"
                    key={opcao}
                    className="ag-day"
                    aria-pressed={horario === opcao}
                    onClick={() => setHorario(opcao)}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            ) : (
              <p>
                {barbeiroId && servicoId && data
                  ? "Nenhum horário livre para esta data."
                  : "Selecione barbeiro, serviço e data para consultar os horários."}
              </p>
            )}
          </div>

          {horario && (
            <p>
              Você selecionou <strong>{formatarData(data)}</strong> às{" "}
              <strong>{horario}</strong>.
            </p>
          )}

          {mensagem && (
            <p className="ag-message" role="status">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            className="ag-button"
            disabled={salvando || !horario}
          >
            {salvando ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
