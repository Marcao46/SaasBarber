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


const CadastrarBarbeiro = () => {

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
        <div>
            <h1>Cadastrar Barbeiro</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <input
                        type="text"
                        placeholder="Nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Especialidade"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Senha de acesso"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                </div>

                <button type="submit">
                    Cadastrar Barbeiro
                </button>

            </form>
        </div>
    )
}

export default CadastrarBarbeiro