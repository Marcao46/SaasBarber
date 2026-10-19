
import { useEffect, useState } from "react";

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../fireBaseConfig";

import {
    FaArrowLeft,
    FaCut,
    FaPlus,
    FaEdit,
    FaTrash,
    FaClock,
    FaExclamationTriangle
} from "react-icons/fa";

import "./GerenciarServicos.css";

const GerenciarServicos = ({ voltarPainel }) => {
    const [barbeariaId, setBarbeariaId] = useState("");
    const [servicos, setServicos] = useState([]);
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [duracao, setDuracao] = useState("30");
    const [editandoId, setEditandoId] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [servicoParaExcluir, setServicoParaExcluir] = useState(null);

    // Carrega os serviços cadastrados na barbearia.
    const carregarServicos = async (id) => {
        const referencia = collection(
            db,
            "barbearias",
            id,
            "servicos"
        );

        const resultado = await getDocs(referencia);

        const lista = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        lista.sort((a, b) =>
            (a.nome || "").localeCompare(b.nome || "")
        );

        setServicos(lista);
    };

    // Atualiza a vitrine pública sem apagar outros dados da barbearia.
    const sincronizarServicosPublicos = async (id) => {
        const referenciaServicos = collection(
            db,
            "barbearias",
            id,
            "servicos"
        );

        const resultado = await getDocs(referenciaServicos);

        const listaPublica = resultado.docs
            .map((documento) => {
                const dados = documento.data();

                return {
                    id: documento.id,
                    nome: dados.nome,
                    preco: dados.preco,
                    duracao: dados.duracao,
                    ativo: dados.ativo !== false
                };
            })
            .filter((servico) => servico.ativo);

        const referenciaPublica = doc(
            db,
            "barbeariasPublicas",
            id
        );

        const documentoPublico = await getDoc(referenciaPublica);

        if (!documentoPublico.exists()) {
            throw new Error(
                "A barbearia não possui uma vitrine pública com o mesmo ID."
            );
        }

        await setDoc(
            referenciaPublica,
            {
                servicos: listaPublica
            },
            {
                merge: true
            }
        );
    };

    // Uma falha na vitrine não deve ser confundida com
    // uma falha no cadastro ou na exclusão do serviço.
    const sincronizarServicosComAviso = async (id) => {
        try {
            await sincronizarServicosPublicos(id);
            setAviso("");
            return true;
        } catch (error) {
            console.error(
                "Falha ao sincronizar a vitrine pública:",
                error
            );

            setAviso(
                "A operação foi concluída, mas a vitrine pública não foi atualizada. Verifique o documento e as permissões do Firebase."
            );

            return false;
        }
    };

    // Localiza a barbearia do proprietário ao abrir a tela.
    useEffect(() => {
        let ativo = true;

        const iniciar = async () => {
            try {
                const usuario = auth.currentUser;

                if (!usuario) {
                    throw new Error("Usuário não autenticado.");
                }

                const consulta = query(
                    collection(db, "barbearias"),
                    where("donoId", "==", usuario.uid)
                );

                const resultado = await getDocs(consulta);

                if (resultado.empty) {
                    throw new Error(
                        "Nenhuma barbearia encontrada para esta conta."
                    );
                }

                const id = resultado.docs[0].id;

                const referencia = collection(
                    db,
                    "barbearias",
                    id,
                    "servicos"
                );

                const dados = await getDocs(referencia);

                if (!ativo) return;

                setBarbeariaId(id);

                const lista = dados.docs.map((documento) => ({
                    id: documento.id,
                    ...documento.data()
                }));

                lista.sort((a, b) =>
                    (a.nome || "").localeCompare(b.nome || "")
                );

                setServicos(lista);
            } catch (error) {
                console.error(
                    "Erro ao carregar serviços:",
                    error
                );

                if (ativo) {
                    setErro(error.message);
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        iniciar();

        return () => {
            ativo = false;
        };
    }, []);

    const limparFormulario = () => {
        setNome("");
        setPreco("");
        setDuracao("30");
        setEditandoId(null);
    };

    // Cadastra um novo serviço ou salva uma edição.
    const salvarServico = async (event) => {
        event.preventDefault();

        if (!barbeariaId || salvando) return;

        const valor = Number(preco.replace(",", "."));
        const minutos = Number(duracao);

        if (
            !nome.trim() ||
            !Number.isFinite(valor) ||
            valor <= 0 ||
            !Number.isInteger(minutos) ||
            minutos <= 0
        ) {
            setErro("Informe nome, preço e duração válidos.");
            setAviso("");
            return;
        }

        try {
            setSalvando(true);
            setErro("");
            setAviso("");

            const dados = {
                nome: nome.trim(),
                preco: valor,
                duracao: minutos,
                ativo: true,
                atualizadoEm: serverTimestamp()
            };

            if (editandoId) {
                await updateDoc(
                    doc(
                        db,
                        "barbearias",
                        barbeariaId,
                        "servicos",
                        editandoId
                    ),
                    dados
                );
            } else {
                await addDoc(
                    collection(
                        db,
                        "barbearias",
                        barbeariaId,
                        "servicos"
                    ),
                    {
                        ...dados,
                        criadoEm: serverTimestamp()
                    }
                );
            }

            // Primeiro atualiza a lista principal.
            await carregarServicos(barbeariaId);

            // Limpa o formulário após a operação principal.
            limparFormulario();

            // Sincronização pública é tratada separadamente.
            await sincronizarServicosComAviso(barbeariaId);
        } catch (error) {
            console.error("Erro ao salvar serviço:", error);

            setErro(
                "Não foi possível salvar o serviço no Firebase. Verifique sua conexão e as permissões."
            );
        } finally {
            setSalvando(false);
        }
    };

    const editarServico = (servico) => {
        setEditandoId(servico.id);
        setNome(servico.nome || "");
        setPreco(
            String(servico.preco ?? "").replace(".", ",")
        );
        setDuracao(String(servico.duracao || 30));
        setErro("");
        setAviso("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Abre o modal personalizado de confirmação.
    const excluirServico = (servico) => {
        setErro("");
        setAviso("");
        setServicoParaExcluir(servico);
    };

    // Exclui o serviço e depois tenta sincronizar a vitrine.
    const confirmarExclusaoServico = async () => {
        const servico = servicoParaExcluir;

        if (!servico || !barbeariaId || excluindo) return;

        try {
            setExcluindo(true);
            setErro("");
            setAviso("");

            await deleteDoc(
                doc(
                    db,
                    "barbearias",
                    barbeariaId,
                    "servicos",
                    servico.id
                )
            );

            // A exclusão foi confirmada pelo Firebase.
            // Atualiza a tela antes da sincronização pública.
            await carregarServicos(barbeariaId);

            if (editandoId === servico.id) {
                limparFormulario();
            }

            setServicoParaExcluir(null);

            // Se falhar, mostra apenas um aviso específico.
            await sincronizarServicosComAviso(barbeariaId);
        } catch (error) {
            console.error("Erro ao excluir serviço:", error);

            setErro(
                "Não foi possível concluir a exclusão no Firebase. Atualize a lista e verifique se o serviço ainda existe."
            );

            setServicoParaExcluir(null);
        } finally {
            setExcluindo(false);
        }
    };

    const formatarPreco = (valor) =>
        Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    return (
        <main className="servicos-page">
            <div className="servicos-container">
                <button
                    type="button"
                    className="servicos-voltar"
                    onClick={voltarPainel}
                >
                    <FaArrowLeft />
                    Voltar ao painel
                </button>

                <header className="servicos-topo">
                    <span className="servicos-etiqueta">
                        GESTÃO DA BARBEARIA
                    </span>

                    <h1>Serviços e Preços</h1>

                    <p>
                        Cadastre os serviços oferecidos,
                        seus valores e o tempo de atendimento.
                    </p>
                </header>

                {erro && (
                    <div className="servicos-erro" role="alert">
                        {erro}
                    </div>
                )}

                {aviso && (
                    <div
                        className="servicos-aviso"
                        role="status"
                    >
                        {aviso}
                    </div>
                )}

                {carregando ? (
                    <p>Carregando serviços...</p>
                ) : barbeariaId ? (
                    <>
                        <section className="servicos-formulario-card">
                            <h2>
                                {editandoId
                                    ? "Editar serviço"
                                    : "Cadastrar novo serviço"}
                            </h2>

                            <form onSubmit={salvarServico}>
                                <div className="servicos-campo">
                                    <label htmlFor="servico-nome">
                                        Nome do serviço
                                    </label>

                                    <input
                                        id="servico-nome"
                                        type="text"
                                        placeholder="Ex.: Corte degradê"
                                        value={nome}
                                        onChange={(e) =>
                                            setNome(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="servicos-form-grid">
                                    <div className="servicos-campo">
                                        <label htmlFor="servico-preco">
                                            Preço (R$)
                                        </label>

                                        <input
                                            id="servico-preco"
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Ex.: 35,00"
                                            value={preco}
                                            onChange={(e) =>
                                                setPreco(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="servicos-campo">
                                        <label htmlFor="servico-duracao">
                                            Duração (minutos)
                                        </label>

                                        <input
                                            id="servico-duracao"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={duracao}
                                            onChange={(e) =>
                                                setDuracao(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="servicos-acoes">
                                    <button
                                        type="submit"
                                        className="servicos-salvar"
                                        disabled={salvando}
                                    >
                                        <FaPlus />
                                        {salvando
                                            ? "Salvando..."
                                            : editandoId
                                                ? "Salvar alterações"
                                                : "Cadastrar serviço"}
                                    </button>

                                    {editandoId && (
                                        <button
                                            type="button"
                                            className="servicos-cancelar"
                                            onClick={limparFormulario}
                                            disabled={salvando}
                                        >
                                            Cancelar edição
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <section className="servicos-listagem">
                            <h2>Serviços cadastrados</h2>

                            {servicos.length === 0 ? (
                                <div className="servicos-vazio">
                                    <FaCut />
                                    <p>
                                        Nenhum serviço cadastrado ainda.
                                    </p>
                                </div>
                            ) : (
                                <div className="servicos-grid">
                                    {servicos.map((servico) => (
                                        <article
                                            className="servicos-item"
                                            key={servico.id}
                                        >
                                            <div className="servicos-item-topo">
                                                <div className="servicos-item-icone">
                                                    <FaCut />
                                                </div>

                                                <strong>
                                                    {formatarPreco(
                                                        servico.preco
                                                    )}
                                                </strong>
                                            </div>

                                            <h3>{servico.nome}</h3>

                                            <p>
                                                <FaClock />
                                                {servico.duracao} minutos
                                            </p>

                                            <div className="servicos-item-acoes">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        editarServico(servico)
                                                    }
                                                >
                                                    <FaEdit />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="servicos-excluir"
                                                    onClick={() =>
                                                        excluirServico(servico)
                                                    }
                                                >
                                                    <FaTrash />
                                                    Excluir
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <p>Nenhuma barbearia disponível para esta conta.</p>
                )}
            </div>

            {servicoParaExcluir && (
                <div
                    className="modal-excluir-overlay"
                    onClick={() => {
                        if (!excluindo) {
                            setServicoParaExcluir(null);
                        }
                    }}
                >
                    <section
                        className="modal-excluir-card"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-excluir-servico"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-excluir-icone">
                            <FaExclamationTriangle />
                        </div>

                        <h2 id="titulo-excluir-servico">
                            Excluir serviço?
                        </h2>

                        <p>
                            Tem certeza de que deseja excluir o serviço{" "}
                            <strong>{servicoParaExcluir.nome}</strong>?
                            Esta ação não poderá ser desfeita.
                        </p>

                        <div className="modal-excluir-acoes">
                            <button
                                type="button"
                                className="modal-excluir-cancelar"
                                disabled={excluindo}
                                onClick={() =>
                                    setServicoParaExcluir(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="modal-excluir-confirmar"
                                disabled={excluindo}
                                onClick={confirmarExclusaoServico}
                            >
                                <FaTrash />
                                {excluindo
                                    ? "Excluindo..."
                                    : "Sim, excluir"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
};

export default GerenciarServicos;
