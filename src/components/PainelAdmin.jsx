
import {
    FaCut,
    FaUser,
    FaUsers,
    FaStore,
    FaCog,
    FaCalendarAlt,
    FaChartLine,
    FaArrowRight,
    FaSignOutAlt,
    FaClock,
    FaCheckCircle,
    FaLightbulb
} from "react-icons/fa"

import { useState } from "react"

import CadastrarBarbeiro from "./CadastrarBarbeiro"

import { signOut } from "firebase/auth"
import { auth } from "../fireBaseConfig"

import "./PainelAdmin.css"
import GerenciarServicos from "./GerenciarServicos"


const PainelAdmin = () => {
    const [mostrarServicos, setMostrarServicos] = useState(false)


    const [mostrarCadastroBarbeiro, setMostrarCadastroBarbeiro] =
        useState(false)

    const [saindo, setSaindo] = useState(false)


    const sair = async () => {

        try {
            setSaindo(true)

            await signOut(auth)

            console.log("Usuário saiu do sistema")

        } catch (erro) {

            console.log("Erro ao sair:", erro)

            alert("Não foi possível sair. Tente novamente.")

        } finally {
            setSaindo(false)
        }

    }

    if (mostrarServicos) {
        return (
            <GerenciarServicos
                voltarPainel={() => setMostrarServicos(false)}
            />
        )
    }
    if (mostrarCadastroBarbeiro) {

        return (
            <CadastrarBarbeiro
                voltarPainel={() =>
                    setMostrarCadastroBarbeiro(false)
                }
            />
        )

    }


    const funcionalidades = [
        {
            titulo: "Cadastrar Barbeiro",
            descricao: "Adicione um novo profissional à sua equipe.",
            icone: <FaCut />,
            disponivel: true,
            acao: () => setMostrarCadastroBarbeiro(true)
        },
        {
            titulo: "Gerenciar Barbeiros",
            descricao: "Consulte, edite ou remova profissionais.",
            icone: <FaUser />,
            disponivel: false
        },
        {
            titulo: "Agendamentos",
            descricao: "Acompanhe os horários da sua barbearia.",
            icone: <FaCalendarAlt />,
            disponivel: false
        },
        {
            titulo: "Clientes",
            descricao: "Consulte clientes e históricos de atendimento.",
            icone: <FaUsers />,
            disponivel: false
        },
        {
            titulo: "Serviços e Preços",
            descricao: "Configure serviços, valores e duração.",
            icone: <FaStore />,
            disponivel: true,
            destaque: true,
            acao: () => setMostrarServicos(true)
        },
        {
            titulo: "Editar Barbearia",
            descricao: "Atualize os dados do estabelecimento.",
            icone: <FaCog />,
            disponivel: false
        }
    ]


    return (

        <main className="painel-page">

            <div className="painel-container">

                {/* CABEÇALHO */}

                <header className="painel-topo">

                    <div className="painel-identidade">

                        <div className="painel-logo">
                            <FaCut />
                        </div>

                        <div>
                            <span className="painel-subtitulo">
                                SAASBARBER • ÁREA DO PROPRIETÁRIO
                            </span>

                            <h1>Painel Administrativo</h1>

                            <p>
                                Gerencie sua barbearia em um só lugar.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="botao-sair"
                        onClick={sair}
                        disabled={saindo}
                    >
                        <FaSignOutAlt />
                        {saindo ? "Saindo..." : "Sair"}
                    </button>

                </header>


                {/* BOAS-VINDAS */}

                <section className="painel-boas-vindas">

                    <div className="painel-boas-vindas-texto">

                        <span className="painel-etiqueta">
                            <FaCheckCircle />
                            SUA ÁREA DE GESTÃO
                        </span>

                        <h2>
                            Sua barbearia,
                            <br />
                            <strong>sob seu controle.</strong>
                        </h2>

                        <p>
                            Organize sua equipe, acompanhe os
                            agendamentos e mantenha seus serviços
                            sempre atualizados.
                        </p>

                        <button
                            type="button"
                            className="painel-botao-principal"
                            onClick={() =>
                                setMostrarCadastroBarbeiro(true)
                            }
                        >
                            <FaCut />
                            Cadastrar profissional
                            <FaArrowRight />
                        </button>

                    </div>

                    <div className="painel-boas-vindas-decoracao">
                        <div className="painel-circulo-decorativo">
                            <FaStore />
                        </div>
                    </div>

                </section>


                {/* VISÃO GERAL */}

                <section className="painel-conteudo">

                    <div className="painel-titulo-secao">

                        <div>
                            <span className="painel-etiqueta">
                                VISÃO GERAL
                            </span>

                            <h2>Resumo da barbearia</h2>

                            <p>
                                Indicadores que serão conectados
                                aos dados reais do sistema.
                            </p>
                        </div>

                        <FaChartLine className="painel-titulo-icone" />

                    </div>


                    <div className="painel-resumo-grid">

                        <div className="painel-resumo-card">

                            <span className="painel-resumo-icone">
                                <FaCalendarAlt />
                            </span>

                            <strong>—</strong>

                            <p>Agendamentos de hoje</p>

                            <small>Aguardando integração</small>

                        </div>


                        <div className="painel-resumo-card">

                            <span className="painel-resumo-icone">
                                <FaUsers />
                            </span>

                            <strong>—</strong>

                            <p>Clientes cadastrados</p>

                            <small>Aguardando integração</small>

                        </div>


                        <div className="painel-resumo-card">

                            <span className="painel-resumo-icone">
                                <FaCut />
                            </span>

                            <strong>—</strong>

                            <p>Profissionais</p>

                            <small>Aguardando integração</small>

                        </div>


                        <div className="painel-resumo-card">

                            <span className="painel-resumo-icone">
                                <FaClock />
                            </span>

                            <strong>—</strong>

                            <p>Próximos atendimentos</p>

                            <small>Aguardando integração</small>

                        </div>

                    </div>

                </section>


                {/* GERENCIAMENTO */}

                <section className="painel-conteudo">

                    <div className="painel-titulo-secao">

                        <div>
                            <span className="painel-etiqueta">
                                FERRAMENTAS
                            </span>

                            <h2>Gerenciar minha barbearia</h2>

                            <p>
                                Escolha uma funcionalidade para continuar.
                            </p>
                        </div>

                    </div>


                    <div className="painel-grid">

                        {funcionalidades.map((item) => (

                            <button
                                type="button"
                                key={item.titulo}
                                className={`painel-card ${item.destaque
                                        ? "painel-card-destaque"
                                        : ""
                                    }`}
                                onClick={item.acao}
                                disabled={!item.disponivel}
                            >

                                <span className="card-icone">
                                    {item.icone}
                                </span>

                                <div className="painel-card-texto">

                                    <h3>{item.titulo}</h3>

                                    <p>{item.descricao}</p>

                                    {!item.disponivel && (
                                        <span className="painel-card-status">
                                            Em desenvolvimento
                                        </span>
                                    )}

                                </div>

                                {item.disponivel && (
                                    <FaArrowRight className="painel-card-seta" />
                                )}

                            </button>

                        ))}

                    </div>

                </section>


                {/* DICA */}

                <section className="painel-dica">

                    <span className="painel-dica-icone">
                        <FaLightbulb />
                    </span>

                    <div>
                        <h3>Dica para sua barbearia</h3>

                        <p>
                            Mantenha seus profissionais e serviços
                            organizados para facilitar a rotina
                            e os futuros agendamentos.
                        </p>
                    </div>

                </section>


                {/* RODAPÉ */}

                <footer className="painel-rodape">

                    <span>
                        SaaSBarber • Gestão inteligente
                    </span>

                    <span>
                        © {new Date().getFullYear()}
                    </span>

                </footer>

            </div>

        </main>

    )

}

export default PainelAdmin
