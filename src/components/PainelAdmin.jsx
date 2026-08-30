import { useState } from "react"
import CadastrarBarbeiro from "./CadastrarBarbeiro"
import { signOut } from "firebase/auth"
import { auth } from "../fireBaseConfig"

const PainelAdmin = () => {

    const [mostrarCadastroBarbeiro, setMostrarCadastroBarbeiro] = useState(false)

    if (mostrarCadastroBarbeiro) {
        return <CadastrarBarbeiro />
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
        <div>
            <h1>Painel Administrativo</h1>

            <h2>Minha Barbearia</h2>

            <button
                onClick={() => setMostrarCadastroBarbeiro(true)}
            >
                Cadastrar Barbeiro
            </button>

            <button>Gerenciar Barbeiros</button>
            <button>Agendamentos</button>
            <button>Editar Barbearia</button>
            <button onClick={sair}>
  Sair
</button>
        </div>
    )
}

export default PainelAdmin