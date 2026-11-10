
import { useState } from "react";

import {
  collection,
  addDoc
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import { auth, db } from "../fireBaseConfig";

import "./Cadastrar.css";

const Cadastrar = ({ voltarHome }) => {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const limparCampos = () => {
    setNomeCompleto("");
    setNomeBarbearia("");
    setEmail("");
    setTelefone("");
    setSenha("");
    setConfirmarSenha("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem. Confira e tente novamente.");
      return;
    }

    try {
      const usuarioCriado =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      await addDoc(collection(db, "barbearias"), {
        nomeCompleto,
        nomeBarbearia,
        email,
        telefone,
        donoId: usuarioCriado.user.uid
      });

      alert("Barbearia cadastrada com sucesso!");

      limparCampos();

    } catch (erro) {
      console.error("Erro ao cadastrar barbearia:", erro);

      if (erro.code === "auth/email-already-in-use") {
        alert("Este e-mail já está cadastrado.");
      } else if (erro.code === "auth/weak-password") {
        alert("A senha deve ter pelo menos 6 caracteres.");
      } else if (erro.code === "auth/invalid-email") {
        alert("Informe um e-mail válido.");
      } else {
        alert("Erro ao cadastrar barbearia. Tente novamente.");
      }
    }
  };

  return (
    <main className="cadastro-page">

      <header className="cadastro-barra-topo">

        <div className="cadastro-marca">
          <span className="cadastro-marca-icone">✂</span>
          <strong>SaaSBarber</strong>
        </div>

        <button
          className="cadastro-home"
          type="button"
          onClick={voltarHome}
        >
          <span aria-hidden="true">←</span>
          Voltar ao Login
        </button>

      </header>

      <div className="cadastro-layout">

        <section className="cadastro-apresentacao">

          <p className="cadastro-boas-vindas">
            Bem-vindo ao
          </p>

          <h1>
            SaaS<span>Barber</span>
          </h1>

          <p className="cadastro-chamada">
            Faça parte de uma plataforma completa
            <br />
            e gerencie sua barbearia com praticidade.
          </p>

          <ul className="cadastro-beneficios">

            <li>
              <span>▦</span>
              Gerencie sua barbearia
            </li>

            <li>
              <span>◷</span>
              Receba agendamentos
            </li>

            <li>
              <span>✓</span>
              Organize sua equipe
            </li>

          </ul>

        </section>

        <section className="cadastro-cartao">

          <div className="cadastro-cartao-topo">

            <div className="cadastro-cartao-icone">
              ✂
            </div>

            <div>
              <h2>Cadastro de Barbearia</h2>
              <p>Cadastre os dados do estabelecimento.</p>
            </div>

          </div>

          <form
            className="cadastro-form"
            onSubmit={handleSubmit}
          >

            <div className="campo-cadastro">
              <label htmlFor="nomeCompleto">
                Nome completo
              </label>

              <input
                id="nomeCompleto"
                type="text"
                placeholder="Digite seu nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="nomeBarbearia">
                Nome da barbearia
              </label>

              <input
                id="nomeBarbearia"
                type="text"
                placeholder="Digite o nome da barbearia"
                value={nomeBarbearia}
                onChange={(e) => setNomeBarbearia(e.target.value)}
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="telefone">
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                placeholder="(47) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="senha">
                Senha
              </label>

              <input
                id="senha"
                type="password"
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="confirmarSenha">
                Confirmar senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="botao-salvar"
            >
              ✂&nbsp; Cadastrar Barbearia
            </button>

          </form>

        </section>

      </div>

    </main>
  );
};

export default Cadastrar;
