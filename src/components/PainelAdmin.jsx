import {
    FaCut,
    FaUser,
    FaUsers,
    FaStore,
    FaCog
} from "react-icons/fa"

import { useState } from "react"

import CadastrarBarbeiro from "./CadastrarBarbeiro"

import { signOut } from "firebase/auth"
import { auth } from "../fireBaseConfig"

import "./PainelAdmin.css"


const PainelAdmin = () => {

    const [mostrarCadastroBarbeiro, setMostrarCadastroBarbeiro] =
        useState(false)


    if (mostrarCadastroBarbeiro) {

        return (
            <CadastrarBarbeiro
                voltarPainel={() =>
                    setMostrarCadastroBarbeiro(false)
                }
            />
        )

    }


    const sair = async () => {

        try {

            await signOut(auth)

            console.log("Usuário saiu do sistema")

        } catch (erro) {

            console.log("Erro ao sair:", erro)

        }

    }


    return (
        <main className="painel-page">

            <div className="painel-container">

                <div className="painel-topo">

                    <div>

                        <span className="painel-subtitulo">
                            SISTEMA DE BARBEARIA
                        </span>

                        <h1>
                            Painel Administrativo
                        </h1>

                        <p>
                            Gerencie sua barbearia em um só lugar.
                        </p>

                    </div>


                    <button
                        className="botao-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>

                </div>


                <section className="painel-conteudo">

                    <div className="painel-titulo-secao">

                        <h2>
                            Minha Barbearia
                        </h2>

                        <p>
                            Escolha uma opção para continuar.
                        </p>

                    </div>


                    <div className="painel-grid">

                        <button
                            className="painel-card"
                            onClick={() =>
                                setMostrarCadastroBarbeiro(true)
                            }
                        >
                            <span className="card-icone">
                                <FaCut />
                            </span>

                            <div>
                                <h3>
                                    Cadastrar Barbeiro
                                </h3>

                                <p>
                                    Adicione um novo profissional.
                                </p>
                            </div>

                        </button>


                        <button className="painel-card">

                            <span className="card-icone">
                                <FaUser />
                            </span>

                            <div>
                                <h3>
                                    Gerenciar Barbeiros
                                </h3>

                                <p>
                                    Consulte, edite ou remova profissionais.
                                </p>
                            </div>

                        </button>


                        <button className="painel-card">

                            <span className="card-icone">
                                <FaCut />
                            </span>

                            <div>
                                <h3>
                                    Agendamentos
                                </h3>

                                <p>
                                    Consulte os horários agendados da barbearia.
                                </p>
                            </div>

                        </button>


                        <button className="painel-card">

                            <span className="card-icone">
                                <FaUsers />
                            </span>

                            <div>
                                <h3>
                                    Clientes
                                </h3>

                                <p>
                                    Consulte clientes e históricos de atendimento.
                                </p>
                            </div>

                        </button>


                        <button className="painel-card">

                            <span className="card-icone">
                                <FaStore />
                            </span>

                            <div>
                                <h3>
                                    Serviços
                                </h3>

                                <p>
                                    Cadastre serviços, preços e duração.
                                </p>
                            </div>

                        </button>


                        <button className="painel-card">

                            <span className="card-icone">
                                <FaCog />
                            </span>

                            <div>
                                <h3>
                                    Editar Barbearia
                                </h3>

                                <p>
                                    Atualize os dados do estabelecimento.
                                </p>
                            </div>

                        </button>

                    </div>

                </section>

            </div>

        </main>
    )
}


export default PainelAdmin