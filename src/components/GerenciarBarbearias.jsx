import { useEffect, useState } from "react"

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore"

import { db } from "../fireBaseConfig"

import "./GerenciarBarbearias.css"


const GerenciarBarbearias = ({ voltarPainel }) => {

    const [barbearias, setBarbearias] = useState([])

    const [idEditando, setIdEditando] = useState(null)

    const [nomeCompleto, setNomeCompleto] = useState("")
    const [nomeBarbearia, setNomeBarbearia] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")


    useEffect(() => {

        buscarBarbearias()

    }, [])


    const buscarBarbearias = async () => {

        try {

            const resultado = await getDocs(
                collection(db, "barbearias")
            )

            const lista = resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...documento.data()
                })
            )

            setBarbearias(lista)

        } catch (erro) {

            console.log(
                "Erro ao buscar barbearias:",
                erro
            )

        }

    }


    const editarBarbearia = (barbearia) => {

        setIdEditando(barbearia.id)

        setNomeCompleto(
            barbearia.nomeCompleto || ""
        )

        setNomeBarbearia(
            barbearia.nomeBarbearia || ""
        )

        setEmail(
            barbearia.email || ""
        )

        setTelefone(
            barbearia.telefone || ""
        )

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }


    const salvarEdicao = async (event) => {

        event.preventDefault()

        try {

            const barbeariaRef = doc(
                db,
                "barbearias",
                idEditando
            )

            await updateDoc(
                barbeariaRef,
                {
                    nomeCompleto,
                    nomeBarbearia,
                    email,
                    telefone
                }
            )

            alert(
                "Barbearia atualizada com sucesso!"
            )

            cancelarEdicao()

            buscarBarbearias()

        } catch (erro) {

            console.log(
                "Erro ao editar barbearia:",
                erro
            )

            alert(
                "Erro ao atualizar barbearia"
            )

        }

    }


    const excluirBarbearia = async (id) => {

        const confirmar = window.confirm(
            "Deseja realmente excluir esta barbearia?"
        )

        if (!confirmar) {
            return
        }

        try {

            await deleteDoc(
                doc(
                    db,
                    "barbearias",
                    id
                )
            )

            setBarbearias(
                barbearias.filter(
                    (barbearia) =>
                        barbearia.id !== id
                )
            )

        } catch (erro) {

            console.log(
                "Erro ao excluir barbearia:",
                erro
            )

            alert(
                "Erro ao excluir barbearia"
            )

        }

    }


    const cancelarEdicao = () => {

        setIdEditando(null)

        setNomeCompleto("")
        setNomeBarbearia("")
        setEmail("")
        setTelefone("")

    }


    return (

        <div className="gerenciar-page">

            <div className="gerenciar-container">

                <div className="gerenciar-topo">

                    <div>

                        <span className="gerenciar-subtitulo">
                            ADMINISTRAÇÃO DA PLATAFORMA
                        </span>

                        <h1>
                            Barbearias Cadastradas
                        </h1>

                        <p>
                            Consulte e gerencie as barbearias do SaaSBarber.
                        </p>

                    </div>


                    <button
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

                        <h2>
                            Editar Barbearia
                        </h2>


                        <div className="gerenciar-form-grid">

                            <div>

                                <label>
                                    Nome do dono
                                </label>

                                <input
                                    type="text"
                                    value={nomeCompleto}
                                    onChange={(e) =>
                                        setNomeCompleto(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    Nome da barbearia
                                </label>

                                <input
                                    type="text"
                                    value={nomeBarbearia}
                                    onChange={(e) =>
                                        setNomeBarbearia(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    E-mail
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <label>
                                    Telefone
                                </label>

                                <input
                                    type="tel"
                                    value={telefone}
                                    onChange={(e) =>
                                        setTelefone(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        <div className="gerenciar-form-acoes">

                            <button
                                type="submit"
                                className="gerenciar-salvar"
                            >
                                Salvar Alterações
                            </button>


                            <button
                                type="button"
                                className="gerenciar-cancelar"
                                onClick={cancelarEdicao}
                            >
                                Cancelar
                            </button>

                        </div>

                    </form>

                )}


                <div className="gerenciar-lista-topo">

                    <div>

                        <h2>
                            Barbearias
                        </h2>

                        <p>
                            Total: {barbearias.length}
                        </p>

                    </div>


                    <button
                        className="gerenciar-atualizar"
                        onClick={buscarBarbearias}
                    >
                        Atualizar Lista
                    </button>

                </div>


                {barbearias.length === 0 ? (

                    <div className="gerenciar-vazio">

                        Nenhuma barbearia cadastrada.

                    </div>

                ) : (

                    <div className="gerenciar-grid">

                        {barbearias.map(
                            (barbearia) => (

                                <div
                                    className="gerenciar-card"
                                    key={barbearia.id}
                                >

                                    <div className="gerenciar-card-topo">

                                        <div>

                                            <span>
                                                BARBEARIA
                                            </span>

                                            <h3>
                                                {barbearia.nomeBarbearia}
                                            </h3>

                                        </div>

                                        <div className="gerenciar-status">
                                            Cadastrada
                                        </div>

                                    </div>


                                    <div className="gerenciar-dados">

                                        <p>
                                            <strong>
                                                Dono:
                                            </strong>{" "}
                                            {barbearia.nomeCompleto}
                                        </p>

                                        <p>
                                            <strong>
                                                E-mail:
                                            </strong>{" "}
                                            {barbearia.email}
                                        </p>

                                        <p>
                                            <strong>
                                                Telefone:
                                            </strong>{" "}
                                            {barbearia.telefone}
                                        </p>

                                    </div>


                                    <div className="gerenciar-acoes">

                                        <button
                                            className="gerenciar-editar"
                                            onClick={() =>
                                                editarBarbearia(
                                                    barbearia
                                                )
                                            }
                                        >
                                            Editar
                                        </button>


                                        <button
                                            className="gerenciar-excluir"
                                            onClick={() =>
                                                excluirBarbearia(
                                                    barbearia.id
                                                )
                                            }
                                        >
                                            Excluir
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    )
}

export default GerenciarBarbearias