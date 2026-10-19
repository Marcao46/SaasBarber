
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  deleteUser
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../fireBaseConfig";

import "./CadastrarCliente.css";

const CadastrarCliente = ({ voltarHome }) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validações dos campos
    if (!nome.trim()) {
      alert("Digite seu nome completo.");
      return;
    }

    if (!telefone.trim()) {
      alert("Digite seu telefone.");
      return;
    }

    if (!email.trim()) {
      alert("Digite seu e-mail.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    // Confere se as senhas são iguais antes de acessar o Firebase
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem. Confira e tente novamente.");
      return;
    }

    let usuarioCriado = null;

    try {
      // Cria a conta no Firebase Authentication
      const resultado = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      usuarioCriado = resultado.user;

      const uid = usuarioCriado.uid;

      // Salva os dados do cliente no Firestore
      try {
        await setDoc(doc(db, "clientes", uid), {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          usuarioId: uid,
          tipoUsuario: "cliente",
          criadoEm: serverTimestamp()
        });

        alert("Cliente cadastrado com sucesso!");

        // Limpa os campos após o cadastro
        setNome("");
        setTelefone("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
      } catch (erroFirestore) {
        console.error("Erro ao salvar cliente:", erroFirestore);

        // Tenta remover a conta se não conseguir salvar os dados
        try {
          await deleteUser(usuarioCriado);
        } catch (erroDelete) {
          console.error("Erro ao remover usuário:", erroDelete);
        }

        alert(
          "Não foi possível salvar o cliente.\n\n" +
          erroFirestore.message
        );
      }
    } catch (erro) {
      console.error("Erro ao criar cliente:", erro);

      if (erro.code === "auth/email-already-in-use") {
        alert("Este e-mail já está cadastrado.");
      } else if (erro.code === "auth/invalid-email") {
        alert("Digite um e-mail válido.");
      } else if (erro.code === "auth/weak-password") {
        alert("A senha precisa ter pelo menos 6 caracteres.");
      } else {
        alert("Erro ao cadastrar cliente:\n\n" + erro.message);
      }
    }
  };

  return (
    <div className="cliente-page">
      <div className="cliente-container">
        <div className="cliente-topo">
          <div>
            <span className="cliente-subtitulo">
              SISTEMA DE BARBEARIA
            </span>

            <h1>Cadastro de Cliente</h1>

            <p>
              Crie sua conta para realizar agendamentos.
            </p>
          </div>

          <button
            type="button"
            className="cliente-voltar"
            onClick={voltarHome}
          >
            Voltar ao Login
          </button>
        </div>

        <form
          className="cliente-form"
          onSubmit={handleSubmit}
        >
          <div className="cliente-campo">
            <label htmlFor="cliente-nome">
              Nome completo
            </label>

            <input
              id="cliente-nome"
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="cliente-campo">
            <label htmlFor="cliente-telefone">
              Telefone
            </label>

            <input
              id="cliente-telefone"
              type="tel"
              placeholder="(47) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <div className="cliente-campo">
            <label htmlFor="cliente-email">
              E-mail
            </label>

            <input
              id="cliente-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="cliente-campo">
            <label htmlFor="cliente-senha">
              Senha
            </label>

            <input
              id="cliente-senha"
              type="password"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="cliente-campo">
            <label htmlFor="cliente-confirmar-senha">
              Confirmar senha
            </label>

            <input
              id="cliente-confirmar-senha"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="cliente-cadastrar"
          >
            Cadastrar Cliente
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastrarCliente;
