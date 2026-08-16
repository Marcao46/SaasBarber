import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore"

import { db } from "./fireBaseConfig.js"


const operacao = process.argv[2]
const id = process.argv[3]


async function create() {

    const profissional = {
        nome: "Teste Terminal",
        endereco: "Rua Terminal",
        email: "terminal@gmail.com"
    }

    const documentoCriado = await addDoc(
        collection(db, "profissionais"),
        profissional
    )

    console.log("===== CREATE =====")
    console.log("Profissional criado com sucesso!")
    console.log("ID:", documentoCriado.id)
}


async function read() {

    const resultado = await getDocs(
        collection(db, "profissionais")
    )

    console.log("===== READ =====")

    resultado.docs.forEach((documento) => {

        console.log(
            documento.id,
            documento.data()
        )

    })
}


async function update(id) {

    if (!id) {
        console.log("Informe o ID do profissional.")
        return
    }

    const profissionalRef = doc(
        db,
        "profissionais",
        id
    )

    await updateDoc(
        profissionalRef,
        {
            nome: "Teste Terminal Editado"
        }
    )

    console.log("===== UPDATE =====")
    console.log("Profissional atualizado com sucesso!")
    console.log("ID:", id)
}


async function deletar(id) {

    if (!id) {
        console.log("Informe o ID do profissional.")
        return
    }

    const profissionalRef = doc(
        db,
        "profissionais",
        id
    )

    await deleteDoc(profissionalRef)

    console.log("===== DELETE =====")
    console.log("Profissional excluído com sucesso!")
    console.log("ID:", id)
}


async function executar() {

    if (operacao === "create") {
        await create()
    }

    else if (operacao === "read") {
        await read()
    }

    else if (operacao === "update") {
        await update(id)
    }

    else if (operacao === "delete") {
        await deletar(id)
    }

    else {
        console.log("Operação inválida.")
        console.log("Use:")
        console.log("node src/crudTeste.js create")
        console.log("node src/crudTeste.js read")
        console.log("node src/crudTeste.js update ID")
        console.log("node src/crudTeste.js delete ID")
    }
}


executar()