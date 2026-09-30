import { useState } from "react"

import {
    createUserWithEmailAndPassword,
    deleteUser
} from "firebase/auth"

import {
    doc,
    setDoc,
    serverTimestamp
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


    // Cadastro

    const handleSubmit = async (event) => {

        event.preventDefault()

        try {

            // Validação

            if (!nome.trim()) {
                alert("Digite seu nome completo.")
                return
            }

            if (!telefone.trim()) {
                alert("Digite seu telefone.")
                return
            }

            if (!email.trim()) {
                alert("Digite seu e-mail.")
                return
            }

            if (senha.length < 6) {
                alert("A senha precisa ter pelo menos 6 caracteres.")
                return
            }


            // Firebase

            const usuarioCriado =
                await createUserWithEmailAndPassword(
                    auth,
                    email.trim(),
                    senha
                )


            const uid = usuarioCriado.user.uid


            // Banco de dados

            try {

                await setDoc(
                    doc(db, "clientes", uid),
                    {
                        nome: nome.trim(),
                        telefone: telefone.trim(),
                        email: email.trim(),
                        usuarioId: uid,
                        tipoUsuario: "cliente",
                        criadoEm: serverTimestamp()
                    }
                )


                // Sucesso

                alert("Cliente cadastrado com sucesso!")

                setNome("")
                setTelefone("")
                setEmail("")
                setSenha("")


            } catch (erroFirestore) {

                console.error(
                    "Erro ao salvar cliente:",
                    erroFirestore
                )

                try {

                    await deleteUser(usuarioCriado.user)

                } catch (erroDelete) {

                    console.error(
                        "Erro ao remover usuário:",
                        erroDelete
                    )

                }

                alert(
                    "Não foi possível salvar o cliente.\n\n" +
                    erroFirestore.message
                )

            }


        } catch (erro) {

            console.error(
                "Erro ao criar cliente:",
                erro
            )


            // Erros

            if (erro.code === "auth/email-already-in-use") {

                alert(
                    "Este e-mail já está cadastrado."
                )

            }
            else if (erro.code === "auth/invalid-email") {

                alert(
                    "Digite um e-mail válido."
                )

            }
            else if (erro.code === "auth/weak-password") {

                alert(
                    "A senha precisa ter pelo menos 6 caracteres."
                )

            }
            else {

                alert(
                    "Erro ao cadastrar cliente:\n\n" +
                    erro.message
                )

            }

        }

    }


    // Tela

    return (

        <div className="cliente-page">

            <div className="cliente-container">

                <div className="cliente-topo">

                    <div>

                        <span className="cliente-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>
                            Cadastro de Cliente
                        </h1>

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

                        <label>
                            Nome completo
                        </label>

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


                    <div className="cliente-campo">

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


                    <div className="cliente-campo">

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