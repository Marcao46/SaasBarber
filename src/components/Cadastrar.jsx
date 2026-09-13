import { useState } from "react"

import {
    collection,
    addDoc
} from "firebase/firestore"

import {
    createUserWithEmailAndPassword
} from "firebase/auth"

import { auth, db } from "../fireBaseConfig"

import "./Cadastrar.css"


const Cadastrar = ({ voltarHome }) => {

    const [nomeCompleto, setNomeCompleto] = useState("")
    const [nomeBarbearia, setNomeBarbearia] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")


    const handleSubmit = async (event) => {

        event.preventDefault()

        try {

            const usuarioCriado =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    senha
                )

            await addDoc(
                collection(db, "barbearias"),
                {
                    nomeCompleto,
                    nomeBarbearia,
                    email,
                    telefone,
                    donoId: usuarioCriado.user.uid
                }
            )

            alert("Barbearia cadastrada com sucesso!")

            limparCampos()

        } catch (erro) {

            console.log(
                "Erro ao cadastrar barbearia:",
                erro
            )

            alert("Erro ao cadastrar barbearia")
        }

    }


    const limparCampos = () => {

        setNomeCompleto("")
        setNomeBarbearia("")
        setEmail("")
        setTelefone("")
        setSenha("")

    }


    return (

        <div className="cadastro-page">

            <div className="cadastro-container">

                <div className="cadastro-topo">

                    <div>

                        <span className="cadastro-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>
                            Cadastro da Barbearia
                        </h1>

                        <p>
                            Cadastre os dados do estabelecimento.
                        </p>

                    </div>


                    <button
                        className="cadastro-home"
                        type="button"
                        onClick={voltarHome}
                    >
                        Voltar ao Login
                    </button>

                </div>


                <div className="cadastro-conteudo">

                    <form
                        className="cadastro-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="campo-cadastro">

                            <label>
                                Nome completo
                            </label>

                            <input
                                type="text"
                                placeholder="Digite seu nome completo"
                                value={nomeCompleto}
                                onChange={(e) =>
                                    setNomeCompleto(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="campo-cadastro">

                            <label>
                                Nome da barbearia
                            </label>

                            <input
                                type="text"
                                placeholder="Digite o nome da barbearia"
                                value={nomeBarbearia}
                                onChange={(e) =>
                                    setNomeBarbearia(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="campo-cadastro">

                            <label>
                                E-mail
                            </label>

                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="campo-cadastro">

                            <label>
                                Telefone
                            </label>

                            <input
                                type="tel"
                                placeholder="(47) 99999-9999"
                                value={telefone}
                                onChange={(e) =>
                                    setTelefone(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="campo-cadastro">

                            <label>
                                Senha
                            </label>

                            <input
                                type="password"
                                placeholder="Crie uma senha"
                                value={senha}
                                onChange={(e) =>
                                    setSenha(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="botao-salvar"
                        >
                            Cadastrar Barbearia
                        </button>

                    </form>

                </div>

            </div>

        </div>

    )
}

export default Cadastrar