import { useState } from "react"
import {collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "firebase/firestore"

import { db } from "../fireBaseConfig"
import "./Cadastrar.css"

const Cadastrar = () => {

    const [nomeCompleto, setNomeCompleto] = useState("")
    const [nomeBarbearia, setNomeBarbearia] = useState("")
    const [quantidadeBarbeiros, setQuantidadeBarbeiros] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")

    const [barbearias, setBarbearias] = useState([])
    const [idEditando, setIdEditando] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault()

        const barbearia = {
            nomeCompleto,
            nomeBarbearia,
            quantidadeBarbeiros,
            email,
            telefone,
            senha
        }

        if (idEditando) {

            const barbeariaRef = doc(
                db,
                "barbearias",
                idEditando
            )

            await updateDoc(
                barbeariaRef,
                barbearia
            )

            console.log("Barbearia editada com sucesso!")

            setIdEditando(null)

        } else {

            await addDoc(
                collection(db, "barbearias"),
                barbearia
            )

            console.log("Barbearia cadastrada com sucesso!")
        }

        limparCampos()
    }

    const buscarBarbearias = async () => {

        const resultado = await getDocs(
            collection(db, "barbearias")
        )

        const listaBarbearias = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }))

        setBarbearias(listaBarbearias)

        console.log(listaBarbearias)
    }

    const editarBarbearia = (barbearia) => {

        setNomeCompleto(barbearia.nomeCompleto)
        setNomeBarbearia(barbearia.nomeBarbearia)
        setQuantidadeBarbeiros(barbearia.quantidadeBarbeiros)
        setEmail(barbearia.email)
        setTelefone(barbearia.telefone)
        setSenha(barbearia.senha)

        setIdEditando(barbearia.id)
    }

    const excluirBarbearia = async (id) => {

        const barbeariaRef = doc(
            db,
            "barbearias",
            id
        )

        await deleteDoc(barbeariaRef)

        setBarbearias(
            barbearias.filter(
                (barbearia) => barbearia.id !== id
            )
        )

        console.log("Barbearia excluída com sucesso!")
    }

    const limparCampos = () => {
        setNomeCompleto("")
        setNomeBarbearia("")
        setQuantidadeBarbeiros("")
        setEmail("")
        setTelefone("")
        setSenha("")
    }

    return (
        <div className="container">

            <form onSubmit={handleSubmit}>

                <h2>Cadastro Barbearia</h2>

                <div>
                    <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={nomeCompleto}
                        onChange={(e) =>
                            setNomeCompleto(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Nome da barbearia"
                        value={nomeBarbearia}
                        onChange={(e) =>
                            setNomeBarbearia(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input
                        type="number"
                        placeholder="Quantos barbeiros?"
                        value={quantidadeBarbeiros}
                        onChange={(e) =>
                            setQuantidadeBarbeiros(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input
                        type="tel"
                        placeholder="Telefone"
                        value={telefone}
                        onChange={(e) =>
                            setTelefone(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) =>
                            setSenha(e.target.value)
                        }
                    />
                </div>

                <button type="submit">
                    {idEditando ? "Salvar Alterações" : "Cadastrar"}
                </button>

            </form>

            <button onClick={buscarBarbearias}>
                Buscar Barbearias
            </button>

            {barbearias.map((barbearia) => (

                <div key={barbearia.id}>

                    <p>
                        Nome completo: {barbearia.nomeCompleto}
                    </p>

                    <p>
                        Barbearia: {barbearia.nomeBarbearia}
                    </p>

                    <p>
                        Quantidade de barbeiros:{" "}
                        {barbearia.quantidadeBarbeiros}
                    </p>

                    <p>
                        E-mail: {barbearia.email}
                    </p>

                    <p>
                        Telefone: {barbearia.telefone}
                    </p>

                    <button
                        onClick={() =>
                            editarBarbearia(barbearia)
                        }
                    >
                        Editar
                    </button>

                    <button
                        onClick={() =>
                            excluirBarbearia(barbearia.id)
                        }
                    >
                        Excluir
                    </button>

                    <hr />

                </div>

            ))}

        </div>
    )
}

export default Cadastrar