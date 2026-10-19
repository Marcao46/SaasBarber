
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../fireBaseConfig";
import "./Agendamento.css";

const diasSemana = [
  { valor: 0, nome: "Domingo" },
  { valor: 1, nome: "Segunda-feira" },
  { valor: 2, nome: "Terça-feira" },
  { valor: 3, nome: "Quarta-feira" },
  { valor: 4, nome: "Quinta-feira" },
  { valor: 5, nome: "Sexta-feira" },
  { valor: 6, nome: "Sábado" },
];

const horarioPadrao = diasSemana.map((dia) => ({
  dia: dia.valor,
  ativo: dia.valor >= 1 && dia.valor <= 5,
  inicio: "09:00",
  fim: "18:00",
  intervaloInicio: "12:00",
  intervaloFim: "13:00",
}));

export default function DisponibilidadeBarbeiro() {
  const [semana, setSemana] = useState(horarioPadrao);
  const [data, setData] = useState("");
  const [bloqueada, setBloqueada] = useState(true);
  const [inicioExcecao, setInicioExcecao] = useState("09:00");
  const [fimExcecao, setFimExcecao] = useState("18:00");
  const [intervaloInicio, setIntervaloInicio] = useState("12:00");
  const [intervaloFim, setIntervaloFim] = useState("13:00");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const usuario = auth.currentUser;

      if (!usuario) {
        setMensagem("Faça login novamente para continuar.");
        setCarregando(false);
        return;
      }

      try {
        const referencia = doc(db, "disponibilidades", usuario.uid);
        const resultado = await getDoc(referencia);

        if (resultado.exists() && resultado.data().semanal) {
          const salva = resultado.data().semanal;

          setSemana(
            horarioPadrao.map((padrao) => ({
              ...padrao,
              ...(salva.find((item) => item.dia === padrao.dia) || {}),
            }))
          );
        }
      } catch (erro) {
        console.error(erro);
        setMensagem("Não foi possível carregar os horários.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function alterarDia(indice, campo, valor) {
    setSemana((atual) =>
      atual.map((item, i) =>
        i === indice ? { ...item, [campo]: valor } : item
      )
    );
  }

  async function salvarSemana() {
    const usuario = auth.currentUser;
    if (!usuario) {
      setMensagem("Faça login novamente.");
      return;
    }

    for (const dia of semana) {
      if (!dia.ativo) continue;

      if (dia.inicio >= dia.fim) {
        setMensagem("O horário final precisa ser depois do inicial.");
        return;
      }

      if (
        (dia.intervaloInicio || dia.intervaloFim) &&
        (!dia.intervaloInicio ||
          !dia.intervaloFim ||
          dia.intervaloInicio >= dia.intervaloFim ||
          dia.intervaloInicio < dia.inicio ||
          dia.intervaloFim > dia.fim)
      ) {
        setMensagem("Confira o intervalo de cada dia.");
        return;
      }
    }

    try {
      await setDoc(
        doc(db, "disponibilidades", usuario.uid),
        {
          barbeiroId: usuario.uid,
          semanal: semana,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );

      setMensagem("Horários semanais salvos!");
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao salvar. Verifique as permissões do Firebase.");
    }
  }

  async function salvarExcecao(evento) {
    evento.preventDefault();

    const usuario = auth.currentUser;
    if (!usuario || !data) {
      setMensagem("Selecione uma data.");
      return;
    }

    if (
      !bloqueada &&
      (inicioExcecao >= fimExcecao ||
        intervaloInicio >= intervaloFim ||
        intervaloInicio < inicioExcecao ||
        intervaloFim > fimExcecao)
    ) {
      setMensagem("Confira os horários da exceção.");
      return;
    }

    try {
      await setDoc(
        doc(db, "excecoesDisponibilidade", `${usuario.uid}_${data}`),
        {
          barbeiroId: usuario.uid,
          data,
          bloqueada,
          inicio: inicioExcecao,
          fim: fimExcecao,
          intervaloInicio,
          intervaloFim,
          atualizadoEm: serverTimestamp(),
        }
      );

      setMensagem(
        bloqueada
          ? "Data bloqueada com sucesso!"
          : "Horários especiais salvos!"
      );
    } catch (erro) {
      console.error(erro);
      setMensagem("Não foi possível salvar essa data.");
    }
  }

  if (carregando) {
    return <p className="ag-loading">Carregando horários...</p>;
  }

  return (
    <main className="ag-container">
      <h2>Disponibilidade</h2>
      <p>Configure os dias e horários em que você atende.</p>

      {mensagem && <div className="ag-message">{mensagem}</div>}

      <section className="ag-card">
        <h3>Horário semanal</h3>

        {semana.map((dia, indice) => (
          <div className="ag-day" key={dia.dia}>
            <label className="ag-day-name">
              <input
                type="checkbox"
                checked={dia.ativo}
                onChange={(e) =>
                  alterarDia(indice, "ativo", e.target.checked)
                }
              />
              {diasSemana[dia.dia].nome}
            </label>

            {dia.ativo && (
              <div className="ag-fields">
                <label>
                  Início
                  <input
                    type="time"
                    value={dia.inicio}
                    onChange={(e) =>
                      alterarDia(indice, "inicio", e.target.value)
                    }
                  />
                </label>

                <label>
                  Fim
                  <input
                    type="time"
                    value={dia.fim}
                    onChange={(e) =>
                      alterarDia(indice, "fim", e.target.value)
                    }
                  />
                </label>

                <label>
                  Início do intervalo
                  <input
                    type="time"
                    value={dia.intervaloInicio}
                    onChange={(e) =>
                      alterarDia(indice, "intervaloInicio", e.target.value)
                    }
                  />
                </label>

                <label>
                  Fim do intervalo
                  <input
                    type="time"
                    value={dia.intervaloFim}
                    onChange={(e) =>
                      alterarDia(indice, "intervaloFim", e.target.value)
                    }
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        <button className="ag-button" onClick={salvarSemana}>
          Salvar horário semanal
        </button>
      </section>

      <section className="ag-card">
        <h3>Exceção por data</h3>
        <p>Bloqueie um dia ou defina horários diferentes para uma data.</p>

        <form onSubmit={salvarExcecao} className="ag-form">
          <label>
            Data
            <input
              type="date"
              required
              min={new Date().toLocaleDateString("en-CA")}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className="ag-day-name">
            <input
              type="checkbox"
              checked={bloqueada}
              onChange={(e) => setBloqueada(e.target.checked)}
            />
            Não vou atender nessa data
          </label>

          {!bloqueada && (
            <div className="ag-fields">
              <label>
                Início
                <input
                  type="time"
                  value={inicioExcecao}
                  onChange={(e) => setInicioExcecao(e.target.value)}
                />
              </label>

              <label>
                Fim
                <input
                  type="time"
                  value={fimExcecao}
                  onChange={(e) => setFimExcecao(e.target.value)}
                />
              </label>

              <label>
                Início do intervalo
                <input
                  type="time"
                  value={intervaloInicio}
                  onChange={(e) => setIntervaloInicio(e.target.value)}
                />
              </label>

              <label>
                Fim do intervalo
                <input
                  type="time"
                  value={intervaloFim}
                  onChange={(e) => setIntervaloFim(e.target.value)}
                />
              </label>
            </div>
          )}

          <button className="ag-button" type="submit">
            Salvar exceção
          </button>
        </form>
      </section>
    </main>
  );
}
