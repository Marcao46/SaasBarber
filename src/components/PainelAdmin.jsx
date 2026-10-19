
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
    FaLightbulb,
    FaBars,
    FaTimes,
    FaHome,
} from "react-icons/fa";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../fireBaseConfig";

import CadastrarBarbeiro from "./CadastrarBarbeiro";
import GerenciarServicos from "./GerenciarServicos";
import "./PainelAdmin.css";

const PainelAdmin = ({ voltarHome }) => {
    const [secaoAtiva, setSecaoAtiva] = useState("inicio");
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);
    const [saindo, setSaindo] = useState(false);

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

    const menu = [
        { id: "inicio", titulo: "Visão geral", icone: <FaHome /> },
        { id: "barbeiro", titulo: "Cadastrar barbeiro", icone: <FaCut /> },
        { id: "servicos", titulo: "Serviços e preços", icone: <FaStore /> },
        { id: "equipe", titulo: "Gerenciar barbeiros", icone: <FaUser /> },
        { id: "agendamentos", titulo: "Agendamentos", icone: <FaCalendarAlt /> },
        { id: "clientes", titulo: "Clientes", icone: <FaUsers /> },
        { id: "barbearia", titulo: "Editar barbearia", icone: <FaCog /> },
    ];

    const titulos = {
        inicio: "Visão geral",
        barbeiro: "Cadastrar barbeiro",
        servicos: "Serviços e preços",
        equipe: "Gerenciar barbeiros",
        agendamentos: "Agendamentos",
        clientes: "Clientes",
        barbearia: "Editar barbearia",
    };

    const renderizarConteudo = () => {
        switch (secaoAtiva) {
            case "barbeiro":
                return (
                    <CadastrarBarbeiro
                        voltarPainel={() => abrirSecao("inicio")}
                    />
                );

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
                            {menu.find((item) => item.id === secaoAtiva)?.icone}
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
                    {menu.map((item) => (
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

            <section className="proprietario-area-principal">
                <header className="proprietario-cabecalho">
                    <div className="proprietario-cabecalho-titulo">
                        <span>PAINEL DO PROPRIETÁRIO</span>

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
    );
};

export default PainelAdmin;
