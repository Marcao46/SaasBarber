
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verifica se as senhas são iguais antes de cadastrar
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

      await addDoc(
        collection(db, "barbearias"),
        {
          nomeCompleto,
          nomeBarbearia,
          email,
          telefone,
          donoId: usuarioCriado.user.uid
        }
      );

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

  const limparCampos = () => {
    setNomeCompleto("");
    setNomeBarbearia("");
    setEmail("");
    setTelefone("");
    setSenha("");
    setConfirmarSenha("");
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <div className="cadastro-topo">
          <div>
            <span className="cadastro-subtitulo">
              SISTEMA DE BARBEARIA
            </span>

            <h1>Cadastro da Barbearia</h1>

            <p>
              Cadastre os dados do estabelecimento.
            </p>
          </div>

          <button
            className="cadastro-home"
            type="button"
            onClick={voltarHome}
          >
            Voltar ao Login
          </button>
        </div>

        <div className="cadastro-conteudo">
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
                onChange={(e) =>
                  setNomeCompleto(e.target.value)
                }
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
                onChange={(e) =>
                  setNomeBarbearia(e.target.value)
                }
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
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                onChange={(e) =>
                  setTelefone(e.target.value)
                }
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
                onChange={(e) =>
                  setSenha(e.target.value)
                }
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
                onChange={(e) =>
                  setConfirmarSenha(e.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="botao-salvar"
            >
              Cadastrar Barbearia
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastrar;
