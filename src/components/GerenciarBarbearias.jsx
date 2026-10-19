
import { useEffect, useState } from "react";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

import { db } from "../fireBaseConfig";

import "./GerenciarBarbearias.css";


const GerenciarBarbearias = ({ voltarPainel }) => {
    const [barbearias, setBarbearias] = useState([]);
    const [idEditando, setIdEditando] = useState(null);

    const [nomeCompleto, setNomeCompleto] = useState("");
    const [nomeBarbearia, setNomeBarbearia] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        buscarBarbearias();
    }, []);

    const buscarBarbearias = async () => {
        setCarregando(true);

        try {
            const resultado = await getDocs(
                collection(db, "barbearias")
            );

            const lista = resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data()
            }));

            setBarbearias(lista);
        } catch (erro) {
            console.error("Erro ao buscar barbearias:", erro);
            alert("Erro ao carregar as barbearias.");
        } finally {
            setCarregando(false);
        }
    };

    const editarBarbearia = (barbearia) => {
        setIdEditando(barbearia.id);

        setNomeCompleto(barbearia.nomeCompleto || "");
        setNomeBarbearia(barbearia.nomeBarbearia || "");
        setEmail(barbearia.email || "");
        setTelefone(barbearia.telefone || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const cancelarEdicao = () => {
        setIdEditando(null);
        setNomeCompleto("");
        setNomeBarbearia("");
        setEmail("");
        setTelefone("");
    };

    const salvarEdicao = async (event) => {
        event.preventDefault();

        if (!idEditando) return;

        setSalvando(true);

        try {
            const barbeariaRef = doc(
                db,
                "barbearias",
                idEditando
            );

            await updateDoc(barbeariaRef, {
                nomeCompleto: nomeCompleto.trim(),
                nomeBarbearia: nomeBarbearia.trim(),
                email: email.trim(),
                telefone: telefone.trim()
            });

            setBarbearias((listaAtual) =>
                listaAtual.map((barbearia) =>
                    barbearia.id === idEditando
                        ? {
                            ...barbearia,
                            nomeCompleto: nomeCompleto.trim(),
                            nomeBarbearia: nomeBarbearia.trim(),
                            email: email.trim(),
                            telefone: telefone.trim()
                        }
                        : barbearia
                )
            );

            cancelarEdicao();

            alert("Barbearia atualizada com sucesso!");
        } catch (erro) {
            console.error("Erro ao editar barbearia:", erro);
            alert("Erro ao atualizar barbearia.");
        } finally {
            setSalvando(false);
        }
    };

    const excluirBarbearia = async (id) => {
        // Confirmação usando o modal personalizado AlertaGlobal.
        if (typeof window.confirmarPersonalizado !== "function") {
            alert("Erro: o alerta de confirmação não está disponível.");
            return;
        }

        const confirmar = await window.confirmarPersonalizado(
            "Deseja realmente excluir esta barbearia? Essa ação não pode ser desfeita.",
            {
                titulo: "Excluir barbearia?",
                textoConfirmar: "Excluir",
                tipo: "exclusao"
            }
        );

        if (!confirmar) return;

        try {
            await deleteDoc(
                doc(db, "barbearias", id)
            );

            setBarbearias((listaAtual) =>
                listaAtual.filter(
                    (barbearia) => barbearia.id !== id
                )
            );

            if (idEditando === id) {
                cancelarEdicao();
            }

            alert("Barbearia excluída com sucesso!");
        } catch (erro) {
            console.error("Erro ao excluir barbearia:", erro);
            alert("Erro ao excluir barbearia.");
        }
    };

    return (
        <div className="gerenciar-page">
            <div className="gerenciar-container">

                <div className="gerenciar-topo">
                    <div>
                        <span className="gerenciar-subtitulo">
                            ADMINISTRAÇÃO DA PLATAFORMA
                        </span>

                        <h1>Barbearias Cadastradas</h1>

                        <p>
                            Consulte e gerencie as barbearias do SaaSBarber.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="gerenciar-voltar"
                        onClick={voltarPainel}
                    >
                        ← Voltar ao Painel
                    </button>
                </div>

                {idEditando && (
                    <form
                        className="gerenciar-form"
                        onSubmit={salvarEdicao}
                    >
                        <h2>Editar Barbearia</h2>

                        <div className="gerenciar-form-grid">
                            <div>
                                <label htmlFor="nomeCompleto">
                                    Nome do dono
                                </label>

                                <input
                                    id="nomeCompleto"
                                    type="text"
                                    value={nomeCompleto}
                                    onChange={(e) =>
                                        setNomeCompleto(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="nomeBarbearia">
                                    Nome da barbearia
                                </label>

                                <input
                                    id="nomeBarbearia"
                                    type="text"
                                    value={nomeBarbearia}
                                    onChange={(e) =>
                                        setNomeBarbearia(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="emailBarbearia">
                                    E-mail
                                </label>

                                <input
                                    id="emailBarbearia"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="telefoneBarbearia">
                                    Telefone
                                </label>

                                <input
                                    id="telefoneBarbearia"
                                    type="tel"
                                    value={telefone}
                                    onChange={(e) =>
                                        setTelefone(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="gerenciar-form-acoes">
                            <button
                                type="submit"
                                className="gerenciar-salvar"
                                disabled={salvando}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Salvar Alterações"}
                            </button>

                            <button
                                type="button"
                                className="gerenciar-cancelar"
                                onClick={cancelarEdicao}
                                disabled={salvando}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                <div className="gerenciar-lista-topo">
                    <div>
                        <h2>Barbearias</h2>
                        <p>Total: {barbearias.length}</p>
                    </div>

                    <button
                        type="button"
                        className="gerenciar-atualizar"
                        onClick={buscarBarbearias}
                        disabled={carregando}
                    >
                        {carregando
                            ? "Atualizando..."
                            : "Atualizar Lista"}
                    </button>
                </div>

                {carregando && barbearias.length === 0 ? (
                    <div className="gerenciar-vazio">
                        Carregando barbearias...
                    </div>
                ) : barbearias.length === 0 ? (
                    <div className="gerenciar-vazio">
                        Nenhuma barbearia cadastrada.
                    </div>
                ) : (
                    <div className="gerenciar-grid">
                        {barbearias.map((barbearia) => (
                            <div
                                className="gerenciar-card"
                                key={barbearia.id}
                            >
                                <div className="gerenciar-card-topo">
                                    <div>
                                        <span>BARBEARIA</span>

                                        <h3>
                                            {barbearia.nomeBarbearia ||
                                                "Barbearia sem nome"}
                                        </h3>
                                    </div>

                                    <div className="gerenciar-status">
                                        Cadastrada
                                    </div>
                                </div>

                                <div className="gerenciar-dados">
                                    <p>
                                        <strong>Dono:</strong>{" "}
                                        {barbearia.nomeCompleto || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>E-mail:</strong>{" "}
                                        {barbearia.email || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Telefone:</strong>{" "}
                                        {barbearia.telefone || "Não informado"}
                                    </p>
                                </div>

                                <div className="gerenciar-acoes">
                                    <button
                                        type="button"
                                        className="gerenciar-editar"
                                        onClick={() =>
                                            editarBarbearia(barbearia)
                                        }
                                    >
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        className="gerenciar-excluir"
                                        onClick={() =>
                                            excluirBarbearia(barbearia.id)
                                        }
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GerenciarBarbearias;
