
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
<<<<<<< Updated upstream
    FaLightbulb
} from "react-icons/fa"
=======
    FaLightbulb,
    FaBars,
    FaTimes,
    FaHome
} from "react-icons/fa";
>>>>>>> Stashed changes

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../fireBaseConfig";

<<<<<<< Updated upstream
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
=======
import CadastrarBarbeiro from "./CadastrarBarbeiro";
import GerenciarServicos from "./GerenciarServicos";
import "./PainelAdmin.css";
>>>>>>> Stashed changes

const PainelAdmin = ({ voltarHome }) => {
    const [secaoAtiva, setSecaoAtiva] = useState("inicio");
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);
    const [saindo, setSaindo] = useState(false);

<<<<<<< Updated upstream
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
=======
    const sair = async () => {
        try {
            setSaindo(true);
            await signOut(auth);
        } catch (erro) {
            console.error("Erro ao sair:", erro);
            window.alert("Não foi possível sair. Tente novamente.");
        } finally {
            setSaindo(false);
        }
    };

    const abrirSecao = (secao) => {
        setSecaoAtiva(secao);
        setMenuMobileAberto(false);
    };
>>>>>>> Stashed changes

    const menu = [
        { id: "inicio", titulo: "Visão geral", icone: <FaHome /> },
        { id: "barbeiro", titulo: "Cadastrar barbeiro", icone: <FaCut /> },
        { id: "servicos", titulo: "Serviços e preços", icone: <FaStore /> },
        { id: "equipe", titulo: "Gerenciar barbeiros", icone: <FaUser /> },
        { id: "agendamentos", titulo: "Agendamentos", icone: <FaCalendarAlt /> },
        { id: "clientes", titulo: "Clientes", icone: <FaUsers /> },
        { id: "barbearia", titulo: "Editar barbearia", icone: <FaCog /> }
    ];

<<<<<<< Updated upstream
    return (

        <main className="painel-page">
=======
    const titulos = {
        inicio: "Visão geral",
        barbeiro: "Cadastrar barbeiro",
        servicos: "Serviços e preços",
        equipe: "Gerenciar barbeiros",
        agendamentos: "Agendamentos",
        clientes: "Clientes",
        barbearia: "Editar barbearia"
    };
>>>>>>> Stashed changes

    const renderizarConteudo = () => {
        switch (secaoAtiva) {
            case "barbeiro":
                return (
                    <CadastrarBarbeiro
                        voltarPainel={() => abrirSecao("inicio")}
                    />
                );

<<<<<<< Updated upstream
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
=======
            case "servicos":
                return (
                    <GerenciarServicos
                        voltarPainel={() => abrirSecao("inicio")}
                    />
                );

            case "equipe":
            case "agendamentos":
            case "clientes":
            case "barbearia":
                return (
                    <section className="proprietario-em-construcao">
                        <div className="proprietario-em-construcao-icone">
                            {menu.find(item => item.id === secaoAtiva)?.icone}
                        </div>

                        <span className="proprietario-etiqueta">
                            ÁREA DO PROPRIETÁRIO
                        </span>

                        <h2>{titulos[secaoAtiva]}</h2>

                        <p>
                            Esta área ainda está em desenvolvimento.
                            As funcionalidades existentes do sistema
                            foram mantidas.
                        </p>

                        <button
                            type="button"
                            onClick={() => abrirSecao("inicio")}
                        >
                            Voltar para a visão geral
                        </button>
                    </section>
                );

            default:
                return (
                    <>
                        <section className="proprietario-boas-vindas">
                            <div className="proprietario-boas-vindas-texto">
                                <span className="proprietario-etiqueta">
                                    <FaCheckCircle />
                                    SUA ÁREA DE GESTÃO
                                </span>

                                <h2>
                                    Sua barbearia,
                                    <br />
                                    <strong>sob seu controle.</strong>
                                </h2>

                                <p>
                                    Organize sua equipe, gerencie seus
                                    serviços e prepare sua barbearia
                                    para os agendamentos.
                                </p>

                                <button
                                    type="button"
                                    className="proprietario-botao-principal"
                                    onClick={() => abrirSecao("barbeiro")}
                                >
                                    <FaCut />
                                    Cadastrar profissional
                                    <FaArrowRight />
                                </button>
                            </div>

                            <div
                                className="proprietario-ilustracao"
                                aria-hidden="true"
                            >
                                <FaStore />
                            </div>
                        </section>

                        <section className="proprietario-secao">
                            <div className="proprietario-titulo-secao">
                                <div>
                                    <span className="proprietario-etiqueta">
                                        VISÃO GERAL
                                    </span>

                                    <h2>Resumo da barbearia</h2>

                                    <p>
                                        Indicadores aguardando integração
                                        com os dados reais.
                                    </p>
                                </div>

                                <FaChartLine />
                            </div>

                            <div className="proprietario-resumo-grid">
                                <article className="proprietario-resumo-card">
                                    <span><FaCalendarAlt /></span>
                                    <strong>—</strong>
                                    <p>Agendamentos de hoje</p>
                                    <small>Aguardando integração</small>
                                </article>

                                <article className="proprietario-resumo-card">
                                    <span><FaUsers /></span>
                                    <strong>—</strong>
                                    <p>Clientes cadastrados</p>
                                    <small>Aguardando integração</small>
                                </article>

                                <article className="proprietario-resumo-card">
                                    <span><FaCut /></span>
                                    <strong>—</strong>
                                    <p>Profissionais</p>
                                    <small>Aguardando integração</small>
                                </article>

                                <article className="proprietario-resumo-card">
                                    <span><FaClock /></span>
                                    <strong>—</strong>
                                    <p>Próximos atendimentos</p>
                                    <small>Aguardando integração</small>
                                </article>
                            </div>
                        </section>

                        <section className="proprietario-secao">
                            <div className="proprietario-titulo-secao">
                                <div>
                                    <span className="proprietario-etiqueta">
                                        FERRAMENTAS
                                    </span>

                                    <h2>Gerenciar minha barbearia</h2>

                                    <p>
                                        Escolha uma opção para continuar.
                                    </p>
                                </div>
                            </div>

                            <div className="proprietario-ferramentas-grid">
                                <button
                                    type="button"
                                    className="proprietario-ferramenta"
                                    onClick={() => abrirSecao("barbeiro")}
                                >
                                    <span><FaCut /></span>
                                    <div>
                                        <h3>Cadastrar barbeiro</h3>
                                        <p>
                                            Adicionar um profissional à equipe.
                                        </p>
                                    </div>
                                    <FaArrowRight />
                                </button>
>>>>>>> Stashed changes

                                <button
                                    type="button"
                                    className="proprietario-ferramenta"
                                    onClick={() => abrirSecao("servicos")}
                                >
                                    <span><FaStore /></span>
                                    <div>
                                        <h3>Serviços e preços</h3>
                                        <p>
                                            Configurar serviços, valores e duração.
                                        </p>
                                    </div>
                                    <FaArrowRight />
                                </button>

                                <button
                                    type="button"
                                    className="proprietario-ferramenta"
                                    onClick={() => abrirSecao("agendamentos")}
                                >
                                    <span><FaCalendarAlt /></span>
                                    <div>
                                        <h3>Agendamentos</h3>
                                        <p>
                                            Acompanhar os horários marcados.
                                        </p>
                                    </div>
                                    <FaArrowRight />
                                </button>

                                <button
                                    type="button"
                                    className="proprietario-ferramenta"
                                    onClick={() => abrirSecao("clientes")}
                                >
                                    <span><FaUsers /></span>
                                    <div>
                                        <h3>Clientes</h3>
                                        <p>
                                            Consultar clientes e atendimentos.
                                        </p>
                                    </div>
                                    <FaArrowRight />
                                </button>
                            </div>
                        </section>

                        <section className="proprietario-dica">
                            <FaLightbulb />
                            <div>
                                <h3>Dica para sua barbearia</h3>
                                <p>
                                    Mantenha os profissionais e serviços
                                    organizados para facilitar sua rotina.
                                </p>
                            </div>
                        </section>
                    </>
                );
        }
    };

    return (
        <main className="proprietario-layout">
            <button
                type="button"
                className="proprietario-mobile-toggle"
                onClick={() => setMenuMobileAberto(!menuMobileAberto)}
                aria-label="Abrir ou fechar menu"
            >
                {menuMobileAberto ? <FaTimes /> : <FaBars />}
                <span>SaaSBarber</span>
            </button>

            {menuMobileAberto && (
                <button
                    type="button"
                    className="proprietario-mobile-fundo"
                    aria-label="Fechar menu"
                    onClick={() => setMenuMobileAberto(false)}
                />
            )}

            <aside
                className={`proprietario-sidebar ${
                    menuMobileAberto ? "menu-aberto" : ""
                }`}
            >
                <div className="proprietario-logo">
                    <span className="proprietario-logo-icone">
                        <FaCut />
                    </span>

                    <div>
                        <strong>SaaSBarber</strong>
                        <small>ÁREA DO PROPRIETÁRIO</small>
                    </div>
                </div>

                <p className="proprietario-menu-legenda">
                    MENU PRINCIPAL
                </p>

                <nav className="proprietario-menu">
                    {menu.map(item => (
                        <button
                            type="button"
                            key={item.id}
                            className={
                                secaoAtiva === item.id
                                    ? "proprietario-menu-item ativo"
                                    : "proprietario-menu-item"
                            }
                            onClick={() => abrirSecao(item.id)}
                        >
                            <span>{item.icone}</span>
                            <span>{item.titulo}</span>
                        </button>
                    ))}
                </nav>

                <div className="proprietario-sidebar-rodape">
                    <div className="proprietario-status">
                        <span />
                        <div>
                            <strong>Sua barbearia</strong>
                            <small>Painel de gestão</small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="proprietario-sair"
                        onClick={sair}
                        disabled={saindo}
                    >
                        <FaSignOutAlt />
                        {saindo ? "Saindo..." : "Sair da conta"}
                    </button>
                </div>
            </aside>

<<<<<<< Updated upstream

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
=======
            <section className="proprietario-area-principal">
                <header className="proprietario-cabecalho">
                    <div className="proprietario-cabecalho-titulo">
                        <span>PAINEL DO PROPRIETÁRIO</span>
>>>>>>> Stashed changes

                        <h1>
                            {secaoAtiva === "inicio"
                                ? "Olá, proprietário!"
                                : titulos[secaoAtiva]}
                        </h1>

                        {secaoAtiva === "inicio" && (
                            <p>
                                Gerencie sua barbearia e acompanhe seus serviços.
                            </p>
                        )}
                    </div>

                    <div className="proprietario-cabecalho-acoes">
                        <div className="proprietario-bemvindo">
                            <FaUser />
                            <span>Bem-vindo(a)!</span>
                        </div>

                        {typeof voltarHome === "function" && (
                            <button
                                type="button"
                                className="proprietario-voltar-home"
                                onClick={voltarHome}
                            >
                                <FaHome />
                                <span>Voltar para Home</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="proprietario-conteudo">
                    {renderizarConteudo()}

                    <footer className="proprietario-rodape">
                        <span>SaaSBarber • Gestão inteligente</span>
                        <span>© {new Date().getFullYear()}</span>
                    </footer>
                </div>
            </section>
        </main>
<<<<<<< Updated upstream

    )

}

export default PainelAdmin
=======
    );
};

export default PainelAdmin;
>>>>>>> Stashed changes
