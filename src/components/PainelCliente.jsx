import { signOut } from "firebase/auth"
import { auth } from "../fireBaseConfig"
import "./PainelCliente.css"

const PainelCliente = () => {

    const sair = async () => {
        try {
            await signOut(auth)
            console.log("Cliente saiu do sistema")
        } catch (erro) {
            console.log("Erro ao sair:", erro)
        }
    }

    return (
        <div className="cliente-painel-page">

            <div className="cliente-painel-container">

                <div className="cliente-painel-topo">

                    <div>
                        <span className="cliente-painel-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>Painel do Cliente</h1>

                        <p>
                            Agende seus serviços e acompanhe seus horários.
                        </p>
                    </div>

                    <button
                        className="cliente-painel-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>

                </div>

                <section className="cliente-painel-conteudo">

                    <div className="cliente-painel-titulo">
                        <h2>Minha Área</h2>

                        <p>
                            Escolha uma opção para continuar.
                        </p>
                    </div>

                    <div className="cliente-painel-grid">

                        <button className="cliente-painel-card">

                            <span className="cliente-painel-icone">
                                📅
                            </span>

                            <div>
                                <h3>Agendar Horário</h3>

                                <p>
                                    Escolha uma barbearia, serviço e barbeiro.
                                </p>
                            </div>

                        </button>

                        <button className="cliente-painel-card">

                            <span className="cliente-painel-icone">
                                🕐
                            </span>

                            <div>
                                <h3>Meus Agendamentos</h3>

                                <p>
                                    Consulte seus próximos horários.
                                </p>
                            </div>

                        </button>

                        <button className="cliente-painel-card">

                            <span className="cliente-painel-icone">
                                💈
                            </span>

                            <div>
                                <h3>Barbearias</h3>

                                <p>
                                    Consulte as barbearias disponíveis.
                                </p>
                            </div>

                        </button>

                        <button className="cliente-painel-card">

                            <span className="cliente-painel-icone">
                                👤
                            </span>

                            <div>
                                <h3>Meu Perfil</h3>

                                <p>
                                    Consulte e atualize seus dados.
                                </p>
                            </div>

                        </button>

                    </div>

                </section>

            </div>

        </div>
    )
}

export default PainelCliente