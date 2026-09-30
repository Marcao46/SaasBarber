import { FaStore, FaCheckCircle, FaExclamationTriangle, FaMoneyBillWave, FaCreditCard, FaBox, FaCog } from "react-icons/fa"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { signOut } from "firebase/auth"
import GerenciarBarbearias from "./GerenciarBarbearias"

import { auth, db } from "../fireBaseConfig"

import "./PainelSaasAdmin.css"

const PainelSaasAdmin = () => {

    const [totalBarbearias, setTotalBarbearias] = useState(0)
    const [mostrarBarbearias, setMostrarBarbearias] =
        useState(false)

    useEffect(() => {

        buscarBarbearias()

    }, [])

    const buscarBarbearias = async () => {

        try {

            const resultado = await getDocs(
                collection(db, "barbearias")
            )

            setTotalBarbearias(resultado.size)

        } catch (erro) {

            console.log(
                "Erro ao buscar barbearias:",
                erro
            )

        }

    }

    const sair = async () => {

        try {

            await signOut(auth)

            window.location.reload()

        } catch (erro) {

            console.log(
                "Erro ao sair:",
                erro
            )

        }

    }
    if (mostrarBarbearias) {

        return (
            <GerenciarBarbearias
                voltarPainel={() =>
                    setMostrarBarbearias(false)
                }
            />
        )

    }

    return (
        <div className="saas-admin-page">

            <div className="saas-admin-container">

                <header className="saas-admin-header">

                    <div>

                        <span className="saas-admin-subtitulo">
                            ADMINISTRAÇÃO DA PLATAFORMA
                        </span>

                        <h1>
                            Painel SaaSBarber
                        </h1>

                        <p>
                            Gerencie barbearias, assinaturas e cobranças.
                        </p>

                    </div>

                    <button
                        className="saas-admin-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>

                </header>


                <section className="saas-resumo">

                    <div className="saas-resumo-card">

                        <span className="saas-resumo-icone">
                            <FaStore className="icone-branco" />
                        </span>

                        <div>

                            <p>
                                Barbearias
                            </p>

                            <strong>
                                {totalBarbearias}
                            </strong>

                        </div>

                    </div>


                    <div className="saas-resumo-card">

                        <span className="saas-resumo-icone">
                            <FaCheckCircle className="icone-branco" />
                        </span>

                        <div>

                            <p>
                                Assinaturas Ativas
                            </p>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>


                    <div className="saas-resumo-card">

                        <span className="saas-resumo-icone">
                            <FaExclamationTriangle className="icone-branco" />
                        </span>

                        <div>

                            <p>
                                Vencidas
                            </p>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>


                    <div className="saas-resumo-card">

                        <span className="saas-resumo-icone">
                            <FaMoneyBillWave className="icone-branco" />
                        </span>

                        <div>

                            <p>
                                Receita Mensal
                            </p>

                            <strong>
                                R$ 0,00
                            </strong>

                        </div>

                    </div>

                </section>


                <section className="saas-gestao">

                    <div className="saas-gestao-titulo">

                        <h2>
                            Gestão da Plataforma
                        </h2>

                        <p>
                            Escolha uma área para administrar.
                        </p>

                    </div>


                    <div className="saas-gestao-grid">

                        <button className="saas-gestao-card" onClick={() =>
                            setMostrarBarbearias(true)
                        }>

                            <span>
                                <FaStore className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Barbearias
                                </h3>

                                <p>
                                    Consulte todas as barbearias cadastradas.
                                </p>

                            </div>

                        </button>


                        <button className="saas-gestao-card">

                            <span>
                                <FaCreditCard className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Assinaturas
                                </h3>

                                <p>
                                    Controle planos mensais e anuais.
                                </p>

                            </div>

                        </button>


                        <button className="saas-gestao-card">

                            <span>
                                <FaExclamationTriangle className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Pendências
                                </h3>

                                <p>
                                    Consulte pagamentos e vencimentos.
                                </p>

                            </div>

                        </button>


                        <button className="saas-gestao-card">

                            <span>
                                <FaMoneyBillWave className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Financeiro
                                </h3>

                                <p>
                                    Consulte receitas e pagamentos.
                                </p>

                            </div>

                        </button>


                        <button className="saas-gestao-card">

                            <span>
                                <FaBox className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Planos
                                </h3>

                                <p>
                                    Configure planos, preços e períodos.
                                </p>

                            </div>

                        </button>


                        <button className="saas-gestao-card">

                            <span>
                                <FaCog className="icone-branco" />
                            </span>

                            <div>

                                <h3>
                                    Configurações
                                </h3>

                                <p>
                                    Configurações gerais do SaaSBarber.
                                </p>

                            </div>

                        </button>

                    </div>

                </section>

            </div>

        </div>
    )
}

export default PainelSaasAdmin