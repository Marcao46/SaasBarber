import { FaCalendarAlt, FaClock, FaUsers, FaUser } from "react-icons/fa"
import { signOut } from "firebase/auth"
import { auth } from "../fireBaseConfig"
import "./PainelBarbeiro.css"

const PainelBarbeiro = () => {

    const sair = async () => {
        try {
            await signOut(auth)
            console.log("Barbeiro saiu do sistema")
        } catch (erro) {
            console.log("Erro ao sair:", erro)
        }
    }

    return (
        <div className="barbeiro-page">

            <div className="barbeiro-container">

                <div className="barbeiro-topo">

                    <div>
                        <span className="barbeiro-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>Painel do Barbeiro</h1>

                        <p>
                            Gerencie sua rotina de trabalho.
                        </p>
                    </div>

                    <button
                        className="barbeiro-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>

                </div>

                <section className="barbeiro-conteudo">

                    <div className="barbeiro-titulo">
                        <h2>Minha Área</h2>

                        <p>
                            Escolha uma opção para continuar.
                        </p>
                    </div>

                    <div className="barbeiro-grid">

                        <button className="barbeiro-card">

                            <span className="barbeiro-icone">
                                <FaCalendarAlt className="icone-branco" />
                            </span>

                            <div>
                                <h3>Meus Agendamentos</h3>

                                <p>
                                    Consulte seus próximos atendimentos.
                                </p>
                            </div>

                        </button>

                        <button className="barbeiro-card">

                            <span className="barbeiro-icone">
                                <FaClock className="icone-branco" />
                            </span>

                            <div>
                                <h3>Minha Disponibilidade</h3>
                                <p>Defina seus dias e horários de trabalho.</p>
                            </div>

                        </button>

                        <button className="barbeiro-card">

                            <span className="barbeiro-icone">
                                <FaUsers className="icone-branco" />
                            </span>

                            <div>
                                <h3>Meus Clientes</h3>

                                <p>
                                    Consulte seus clientes e atendimentos.
                                </p>
                            </div>

                        </button>

                        <button className="barbeiro-card">

                            <span className="barbeiro-icone">
                                <FaUser className="icone-branco" />
                            </span>

                            <div>
                                <h3>Meu Perfil</h3>

                                <p>
                                    Consulte seus dados profissionais.
                                </p>
                            </div>

                        </button>

                    </div>

                </section>

            </div>

        </div>
    )
}

export default PainelBarbeiro