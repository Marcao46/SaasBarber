import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db, secondaryAuth } from "../fireBaseConfig"
import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "firebase/firestore"
import "./CadastrarBarbeiro.css"


const CadastrarBarbeiro = ({ voltarPainel }) => {

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")
    const [especialidade, setEspecialidade] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")


    const handleSubmit = async (event) => {
        event.preventDefault()

        if (senha !== confirmarSenha) {
            alert("As senhas não são iguais")
            return
        }

        try {
            const donoId = auth.currentUser?.uid

            if (!donoId) {
                alert("Nenhum dono está logado")
                return
            }

            const consultaBarbearia = query(
                collection(db, "barbearias"),
                where("donoId", "==", donoId)
            )

            const resultadoBarbearia = await getDocs(consultaBarbearia)

            if (resultadoBarbearia.empty) {
                alert("Barbearia do dono não encontrada")
                return
            }

            const barbeariaId = resultadoBarbearia.docs[0].id

            console.log("Barbearia encontrada:", barbeariaId)

            const usuarioCriado = await createUserWithEmailAndPassword(
                secondaryAuth,
                email,
                senha
            )
            await addDoc(collection(db, "barbeiros"), {
                nome,
                email,
                telefone,
                especialidade,
                usuarioId: usuarioCriado.user.uid,
                tipoUsuario: "barbeiro",
                barbeariaId: barbeariaId
            })

            console.log("Usuário criado:", usuarioCriado.user.uid)

            alert("Acesso do barbeiro criado com sucesso")

        } catch (erro) {

            console.log(erro)

            alert("Erro ao criar acesso do barbeiro")
        }
    }

   return (
    <div className="cadastro-barbeiro-page">

        <div className="cadastro-barbeiro-container">

            <div className="cadastro-barbeiro-topo">

                <div>
                    <span className="cadastro-barbeiro-subtitulo">
                        SISTEMA DE BARBEARIA
                    </span>

                    <h1>Cadastrar Barbeiro</h1>

                    <p>
                        Crie o acesso de um novo profissional.
                    </p>
                </div>

                <button
                    type="button"
                    className="botao-voltar"
                    onClick={voltarPainel}
                >
                    Voltar ao Painel
                </button>

            </div>

            <form
                className="form-barbeiro"
                onSubmit={handleSubmit}
            >

                <div className="campo-barbeiro">
                    <label>Nome completo</label>

                    <input
                        type="text"
                        placeholder="Digite o nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>

                <div className="campo-barbeiro">
                    <label>E-mail</label>

                    <input
                        type="email"
                        placeholder="barbeiro@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="campo-barbeiro">
                    <label>Telefone</label>

                    <input
                        type="text"
                        placeholder="(47) 99999-9999"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        required
                    />
                </div>

                <div className="campo-barbeiro">
                    <label>Especialidade</label>

                    <input
                        type="text"
                        placeholder="Ex: Corte, barba, degradê"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                        required
                    />
                </div>

                <div className="campo-barbeiro">
                    <label>Senha de acesso</label>

                    <input
                        type="password"
                        placeholder="Digite uma senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>

                <div className="campo-barbeiro">
                    <label>Confirmar senha</label>

                    <input
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="botao-cadastrar-barbeiro"
                >
                    Cadastrar Barbeiro
                </button>

            </form>

        </div>

    </div>
)
}

export default CadastrarBarbeiro