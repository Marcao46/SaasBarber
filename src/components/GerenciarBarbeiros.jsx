
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../fireBaseConfig";
import "./GerenciarBarbeiros.css";

export default function GerenciarBarbeiros({ voltarPainel }) {
  const [barbeiros, setBarbeiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [barbeariaId, setBarbeariaId] = useState("");

  const [barbeiroEditando, setBarbeiroEditando] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    especialidades: "",
  });

  async function carregarBarbeiros() {
    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        setErro("Você precisa estar logado para acessar esta tela.");
        return;
      }

      // Busca a barbearia pertencente ao dono logado.
      const consultaBarbearia = query(
        collection(db, "barbearias"),
        where("donoId", "==", usuario.uid)
      );

      const resultadoBarbearia = await getDocs(consultaBarbearia);

      if (resultadoBarbearia.empty) {
        setErro("Nenhuma barbearia foi encontrada para sua conta.");
        setBarbeiros([]);
        return;
      }

      const idBarbearia = resultadoBarbearia.docs[0].id;
      setBarbeariaId(idBarbearia);

      // Busca somente os barbeiros desta barbearia.
      const consultaBarbeiros = query(
        collection(db, "barbeiros"),
        where("barbeariaId", "==", idBarbearia)
      );

      const resultadoBarbeiros = await getDocs(consultaBarbeiros);

      const lista = resultadoBarbeiros.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setBarbeiros(lista);
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
      setErro("Não foi possível carregar os barbeiros. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  function iniciarEdicao(barbeiro) {
    const especialidadesAtuais =
      barbeiro.especialidades ||
      (barbeiro.especialidade ? [barbeiro.especialidade] : []);

    setBarbeiroEditando(barbeiro.id);

    setForm({
      nome: barbeiro.nome || "",
      telefone: barbeiro.telefone || "",
      especialidades: Array.isArray(especialidadesAtuais)
        ? especialidadesAtuais.join(", ")
        : String(especialidadesAtuais),
    });

    setErro("");
    setMensagem("");
  }

  function cancelarEdicao() {
    setBarbeiroEditando(null);
    setForm({
      nome: "",
      telefone: "",
      especialidades: "",
    });
  }

  async function salvarEdicao(event) {
    event.preventDefault();

    if (!form.nome.trim()) {
      setErro("Informe o nome do barbeiro.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const especialidadesArray = form.especialidades
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const barbeiroRef = doc(
        db,
        "barbeiros",
        barbeiroEditando
      );

      await updateDoc(barbeiroRef, {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        especialidades: especialidadesArray,
        especialidade: especialidadesArray.join(", "),
      });

      setBarbeiros((listaAtual) =>
        listaAtual.map((barbeiro) =>
          barbeiro.id === barbeiroEditando
            ? {
                ...barbeiro,
                nome: form.nome.trim(),
                telefone: form.telefone.trim(),
                especialidades: especialidadesArray,
                especialidade: especialidadesArray.join(", "),
              }
            : barbeiro
        )
      );

      cancelarEdicao();
      setMensagem("Dados do barbeiro atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao editar barbeiro:", error);
      setErro("Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirBarbeiro(barbeiro) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o cadastro de ${barbeiro.nome}?`
    );

    if (!confirmou) return;

    setErro("");
    setMensagem("");

    try {
      await deleteDoc(doc(db, "barbeiros", barbeiro.id));

      setBarbeiros((listaAtual) =>
        listaAtual.filter((item) => item.id !== barbeiro.id)
      );

      if (barbeiroEditando === barbeiro.id) {
        cancelarEdicao();
      }

      setMensagem("Cadastro do barbeiro excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir barbeiro:", error);
      setErro("Não foi possível excluir o cadastro.");
    }
  }

  return (
    <main className="gerenciar-barbeiros">
      <header className="gb-header">
        <div>
          <span className="gb-etiqueta">SAASBARBER</span>
          <h1>Gerenciar barbeiros</h1>
          <p>Consulte e gerencie a equipe da sua barbearia.</p>
        </div>

        <button
          type="button"
          className="gb-btn gb-btn-voltar"
          onClick={voltarPainel}
        >
          ← Voltar ao painel
        </button>
      </header>

      <section className="gb-resumo">
        <div className="gb-resumo-icone">✂</div>
        <div>
          <span>Total de barbeiros</span>
          <strong>{barbeiros.length}</strong>
        </div>
      </section>

      {erro && <div className="gb-alerta gb-erro">{erro}</div>}
      {mensagem && (
        <div className="gb-alerta gb-sucesso">{mensagem}</div>
      )}

      {barbeiroEditando && (
        <section className="gb-form-card">
          <div className="gb-titulo-secao">
            <h2>Editar barbeiro</h2>
            <p>Altere as informações do profissional.</p>
          </div>

          <form onSubmit={salvarEdicao} className="gb-form">
            <label>
              Nome completo
              <input
                type="text"
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
                placeholder="Nome do barbeiro"
                required
              />
            </label>

            <label>
              Telefone
              <input
                type="tel"
                value={form.telefone}
                onChange={(event) =>
                  setForm({ ...form, telefone: event.target.value })
                }
                placeholder="Telefone do barbeiro"
              />
            </label>

            <label className="gb-campo-largo">
              Especialidades
              <input
                type="text"
                value={form.especialidades}
                onChange={(event) =>
                  setForm({
                    ...form,
                    especialidades: event.target.value,
                  })
                }
                placeholder="Ex.: Corte, Barba, Degradê"
              />
              <small>Separe as especialidades por vírgulas.</small>
            </label>

            <div className="gb-acoes-form">
              <button
                type="button"
                className="gb-btn gb-btn-secundario"
                onClick={cancelarEdicao}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="gb-btn gb-btn-principal"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="gb-lista-secao">
        <div className="gb-titulo-secao">
          <h2>Equipe cadastrada</h2>
          <p>Os profissionais vinculados à sua barbearia aparecem aqui.</p>
        </div>

        {carregando ? (
          <div className="gb-estado">
            <div className="gb-spinner" />
            <p>Carregando barbeiros...</p>
          </div>
        ) : barbeiros.length === 0 ? (
          <div className="gb-vazio">
            <div className="gb-vazio-icone">✂</div>
            <h3>Nenhum barbeiro encontrado</h3>
            <p>
              Cadastre um profissional ou confira se os registros estão
              vinculados à sua barbearia.
            </p>
          </div>
        ) : (
          <div className="gb-grid">
            {barbeiros.map((barbeiro) => {
              const especialidades =
                barbeiro.especialidades ||
                (barbeiro.especialidade
                  ? [barbeiro.especialidade]
                  : []);

              return (
                <article className="gb-card" key={barbeiro.id}>
                  <div className="gb-card-topo">
                    <div className="gb-avatar">
                      {(barbeiro.nome || "B")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="gb-card-identidade">
                      <h3>{barbeiro.nome || "Sem nome"}</h3>
                      <span className="gb-status">
                        <span className="gb-status-ponto" />
                        Cadastrado
                      </span>
                    </div>
                  </div>

                  <div className="gb-detalhes">
                    <div className="gb-detalhe">
                      <span>Telefone</span>
                      <p>{barbeiro.telefone || "Não informado"}</p>
                    </div>

                    <div className="gb-detalhe">
                      <span>E-mail</span>
                      <p>{barbeiro.email || "Não informado"}</p>
                    </div>

                    <div className="gb-detalhe">
                      <span>Especialidades</span>
                      <div className="gb-tags">
                        {especialidades.length > 0 ? (
                          especialidades.map((especialidade, index) => (
                            <span key={`${especialidade}-${index}`}>
                              {especialidade}
                            </span>
                          ))
                        ) : (
                          <span>Não informadas</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="gb-card-acoes">
                    <button
                      type="button"
                      className="gb-btn gb-btn-editar"
                      onClick={() => iniciarEdicao(barbeiro)}
                    >
                      ✎ Editar
                    </button>

                    <button
                      type="button"
                      className="gb-btn gb-btn-excluir"
                      onClick={() => excluirBarbeiro(barbeiro)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
