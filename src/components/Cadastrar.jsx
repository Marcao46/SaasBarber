import { useState } from "react"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../fireBaseConfig"
import "./Cadastrar.css"
const Cadastrar = () => {

    const [nome, setNome] = useState("")
    const [endereco, setEndereco] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [profissionais, setProfissionais] = useState([])
    const [idEditando, setIdEditando] = useState(null)




    const handleSubmit = async (event) => {
        event.preventDefault();

        const profissional = {
            nome,
            endereco,
            email,

        }
        if (idEditando) {

            const profissionalRef = doc(
                db,
                "profissionais",
                idEditando
            )
            await updateDoc(
                profissionalRef,
                profissional
            )
            console.log("Profissional Edidato com Sucesso!")
            setIdEditando(null)

        } else {

            await addDoc(
                collection(db, "profissionais"),
                profissional
            )


            console.log("Profissional cadastrado com sucesso!")
        }



    };
    const buscarProfissionais = async () => {

        const resultado = await getDocs(
            collection(db, "profissionais")
        )

        const listaProfissionais = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }))

        setProfissionais(listaProfissionais)

        console.log(listaProfissionais)
    }

    const editarProfissional = (profissional) => {

        setNome(profissional.nome)
        setEndereco(profissional.endereco)
        setEmail(profissional.email)

        setIdEditando(profissional.id)
    }
    const excluirProfissional = async (id) => {

        const profissionalRef = doc(
            db,
            "profissionais",
            id
        )

        await deleteDoc(profissionalRef)
           setProfissionais(
        profissionais.filter((profissional) =>
            profissional.id !== id
        )
    )
        console.log("Profissional excluído com sucesso!")
    }

    return (
        <div className="container">

            <form onSubmit={handleSubmit}>
                <h1>Cadastro de Profissionais!</h1>

                <div>
                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Endereço"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
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
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <button type="submit">
                    Cadastrar
                </button>

            </form>
            <button onClick={buscarProfissionais}>
                Buscar Profissionais
            </button>

            {profissionais.map((profissional) => (
                <div key={profissional.id}>
                    <p>Nome: {profissional.nome}</p>
                    <p>Endereço: {profissional.endereco}</p>
                    <p>E-mail: {profissional.email}</p>

                    <button onClick={() => editarProfissional(profissional)}>
                        Editar
                    </button>
                    <button onClick={() => excluirProfissional(profissional.id)}>
                        Excluir
                    </button>
                    <hr />
                </div>
            ))}

        </div>
    )
}

export default Cadastrar