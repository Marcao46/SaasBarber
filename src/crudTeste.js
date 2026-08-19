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

    const barbearia = {
        nomeCompleto: "Teste Terminal",
        nomeBarbearia: "Barbearia Terminal",
        quantidadeBarbeiros: "3",
        email: "terminal@gmail.com",
        telefone: "47999999999",
        senha: "123456"
    }

    const documentoCriado = await addDoc(
        collection(db, "barbearias"),
        barbearia
    )

    console.log("===== CREATE =====")
    console.log("Barbearia criada com sucesso!")
    console.log("ID:", documentoCriado.id)
}


async function read() {

    const resultado = await getDocs(
        collection(db, "barbearias")
    )

    console.log("===== READ =====")

    resultado.docs.forEach((documento) => {

        console.log("ID:", documento.id)
        console.log(documento.data())
        console.log("------------------------")

    })
}


async function update(id) {

    if (!id) {
        console.log("Informe o ID da barbearia.")
        return
    }

    const barbeariaRef = doc(
        db,
        "barbearias",
        id
    )

    await updateDoc(
        barbeariaRef,
        {
            nomeCompleto: "Teste Terminal Editado",
            nomeBarbearia: "Barbearia Terminal Editada",
            quantidadeBarbeiros: "5",
            email: "editado@gmail.com",
            telefone: "47988888888",
            senha: "654321"
        }
    )

    console.log("===== UPDATE =====")
    console.log("Barbearia atualizada com sucesso!")
    console.log("ID:", id)
}


async function deletar(id) {

    if (!id) {
        console.log("Informe o ID da barbearia.")
        return
    }

    const barbeariaRef = doc(
        db,
        "barbearias",
        id
    )

    await deleteDoc(barbeariaRef)

    console.log("===== DELETE =====")
    console.log("Barbearia excluída com sucesso!")
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