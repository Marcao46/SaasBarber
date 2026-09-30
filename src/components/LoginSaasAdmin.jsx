import { FaCut, FaLock, FaUserShield } from "react-icons/fa"
import { useState } from "react"

import {
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth"

import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore"

import {
    auth,
    db
} from "../fireBaseConfig"

import "./LoginSaasAdmin.css"

import PainelSaasAdmin from "./PainelSaasAdmin"


const LoginSaasAdmin = ({ voltarHome }) => {

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [mostrarPainel, setMostrarPainel] =
        useState(false)


    const handleSubmit = async (event) => {

        event.preventDefault()

        try {

            // 1 - Faz login no Firebase Authentication
            const usuarioLogado =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                )


            const uid =
                usuarioLogado.user.uid


            console.log(
                "Usuário autenticado:",
                uid
            )


            // 2 - Procura esse UID na coleção adminsSaas
            const consultaAdmin =
                query(
                    collection(db, "adminsSaas"),
                    where("usuarioId", "==", uid),
                    where("ativo", "==", true)
                )


            const resultado =
                await getDocs(consultaAdmin)


            // 3 - Se não estiver cadastrado como Admin SaaS
            if (resultado.empty) {

                await signOut(auth)

                alert(
                    "Acesso negado. Esta conta não é um administrador SaaS."
                )

                return
            }


            // 4 - Admin autorizado
            console.log(
                "Admin SaaS autorizado:",
                usuarioLogado.user.email
            )


            setMostrarPainel(true)


        } catch (erro) {

            console.log(
                "Erro no login Admin SaaS:",
                erro
            )

            alert(
                "E-mail ou senha incorretos"
            )

        }

    }


    // Se o Admin estiver autorizado,
    // abre o painel SaaS
    if (mostrarPainel) {

        return <PainelSaasAdmin />

    }


    return (

        <div className="saas-login-page">

            <div className="saas-login-card">

                <button
                    type="button"
                    className="saas-voltar"
                    onClick={voltarHome}
                >
                    ← Voltar ao site
                </button>


                <div className="saas-logo">
                    <FaCut className="icone-branco" />
                </div>


                <span className="saas-identificacao">
                    ADMINISTRAÇÃO
                </span>


                <h1>
                    SaaS<span>Barber</span>
                </h1>


                <p className="saas-descricao">
                    Acesso exclusivo à administração
                    da plataforma.
                </p>


                <form onSubmit={handleSubmit}>

                    <div className="saas-campo">

                        <label>
                            E-mail administrativo
                        </label>

                        <input
                            type="email"
                            placeholder="Sistemabarbearia@gmail.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="saas-campo">

                        <label>
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="saas-entrar"
                    >
                        <><FaLock className="icone-branco" /> Entrar como Admin</>
                    </button>

                </form>


                <div className="saas-seguranca">
                    <><FaUserShield className="icone-branco" /> Área restrita ao administrador</>
                    do SaaSBarber
                </div>

            </div>

        </div>

    )

}

export default LoginSaasAdmin