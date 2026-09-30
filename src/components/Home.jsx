import { FaCut, FaLock, FaCalendarAlt, FaUsers, FaChartBar, FaStore } from "react-icons/fa"
import { useState } from "react"
import Login from "./Login"
import LoginSaasAdmin from "./LoginSaasAdmin"
import "./Home.css"

const Home = () => {

    const [mostrarAdminSaas, setMostrarAdminSaas] =
        useState(false)

    if (mostrarAdminSaas) {

        return (
            <LoginSaasAdmin
                voltarHome={() =>
                    setMostrarAdminSaas(false)
                }
            />
        )

    }


    return (
        <div className="home-page">

            {/* CABEÇALHO */}
            <header className="home-header">

                <div className="home-logo">

                    <div className="home-logo-icone">
                        <FaCut className="icone-branco" />
                    </div>

                    <div>

                        <h1>
                            SaaS<span>Barber</span>
                        </h1>

                        <p>
                            Tecnologia para o seu negócio
                        </p>

                    </div>

                </div>


                <nav className="home-menu">

                    <a href="#inicio">
                        Início
                    </a>

                    <a href="#recursos">
                        Recursos
                    </a>

                    <a href="#planos">
                        Planos
                    </a>

                    <a href="#contato">
                        Contato
                    </a>

                </nav>


                <button
                    className="botao-admin-saas"
                    onClick={() =>
                        setMostrarAdminSaas(true)
                    }
                >
                    <><FaLock className="icone-branco" /> Admin SaaS</>
                </button>

            </header>


            {/* CONTEÚDO PRINCIPAL */}

            <main
                className="home-principal"
                id="inicio"
            >

                {/* LOGIN NORMAL */}

                <div className="home-login">

                    <Login />

                </div>


                {/* APRESENTAÇÃO */}

                <div className="home-apresentacao">

                    <span className="home-destaque">
                        MAIS QUE AGENDAMENTOS
                    </span>


                    <h2>

                        Leve sua barbearia

                        <br />

                        para o{" "}

                        <strong>
                            próximo nível
                        </strong>

                    </h2>


                    <p className="home-descricao">

                        Um sistema completo para gerenciar
                        sua barbearia, seus profissionais,
                        clientes e agendamentos.

                    </p>


                    <div
                        className="home-recursos"
                        id="recursos"
                    >

                        <div className="recurso-card">

                            <span>
                                <FaCalendarAlt className="icone-branco" />
                            </span>

                            <p>
                                Agendamentos
                                <br />
                                online
                            </p>

                        </div>


                        <div className="recurso-card">

                            <span>
                                <FaUsers className="icone-branco" />
                            </span>

                            <p>
                                Gestão de
                                <br />
                                profissionais
                            </p>

                        </div>


                        <div className="recurso-card">

                            <span>
                                <FaChartBar className="icone-branco" />
                            </span>

                            <p>
                                Controle
                                <br />
                                administrativo
                            </p>

                        </div>


                        <div className="recurso-card">

                            <span>
                                <FaStore className="icone-branco" />
                            </span>

                            <p>
                                Gestão da
                                <br />
                                barbearia
                            </p>

                        </div>

                    </div>


                    <div className="home-chamada">

                        <h3>
                            Solução completa para
                            barbearias modernas
                        </h3>

                        <p>

                            Mais organização para o dono,
                            praticidade para o barbeiro e
                            facilidade para o cliente.

                        </p>

                    </div>

                </div>

            </main>

        </div>
    )
}

export default Home