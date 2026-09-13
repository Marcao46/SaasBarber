import { useState } from "react"

import {
    createUserWithEmailAndPassword
} from "firebase/auth"

import {
    addDoc,
    collection
} from "firebase/firestore"

import {
    auth,
    db
} from "../fireBaseConfig"

import "./CadastrarCliente.css"


const CadastrarCliente = ({ voltarHome }) => {

    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")


    const handleSubmit = async (event) => {

        event.preventDefault()

        try {

            // 1 - cria a conta do cliente no Firebase Authentication
            const usuarioCriado =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    senha
                )


            // 2 - salva os dados do cliente no Firestore
            await addDoc(
                collection(db, "clientes"),
                {
                    nome: nome,
                    telefone: telefone,
                    email: email,
                    usuarioId: usuarioCriado.user.uid,
                    tipoUsuario: "cliente"
                }
            )


            alert("Cliente cadastrado com sucesso!")


            // limpa os campos
            setNome("")
            setTelefone("")
            setEmail("")
            setSenha("")

        } catch (erro) {

            console.log("Erro ao cadastrar cliente:", erro)

            alert("Erro ao cadastrar cliente")

        }

    }


    return (

        <div className="cliente-page">

            <div className="cliente-container">

                <div className="cliente-topo">

                    <div>

                        <span className="cliente-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>Cadastro de Cliente</h1>

                        <p>
                            Crie sua conta para realizar agendamentos.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="cliente-voltar"
                        onClick={voltarHome}
                    >
                        Voltar ao Login
                    </button>

                </div>


                <form
                    className="cliente-form"
                    onSubmit={handleSubmit}
                >

                    <div className="cliente-campo">

                        <label>Nome completo</label>

                        <input
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(e) =>
                                setNome(e.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="cliente-campo">

                        <label>Telefone</label>

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


                    <div className="cliente-campo">

                        <label>E-mail</label>

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


                    <div className="cliente-campo">

                        <label>Senha</label>

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
                        className="cliente-cadastrar"
                    >
                        Cadastrar Cliente
                    </button>

                </form>

            </div>

        </div>

    )

}

export default CadastrarCliente