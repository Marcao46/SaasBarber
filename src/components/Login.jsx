
import { useState, useEffect } from "react";
import { FaCut, FaUserTie, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

import Cadastrar from "./Cadastrar";
import PainelAdmin from "./PainelAdmin";
import PainelBarbeiro from "./PainelBarbeiro";
import CadastrarCliente from "./CadastrarCliente";
import PainelCliente from "./PainelCliente";
import PainelSaasAdmin from "./PainelSaasAdmin";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../fireBaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState("");
  const [painelUsuario, setPainelUsuario] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [entrando, setEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [mensagemLogin, setMensagemLogin] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  // Identificar o usuário no Firestore
  const identificarUsuario = async (uid) => {
    const consultaSaas = query(
      collection(db, "adminsSaas"),
      where("usuarioId", "==", uid)
    );

    const adminsSaas = await getDocs(consultaSaas);

    if (!adminsSaas.empty) {
      const administradorAtivo = adminsSaas.docs.some(
        (documento) => documento.data().ativo === true
      );

      if (!administradorAtivo) {
        throw new Error("ADMIN_SAAS_INATIVO");
      }

      return "saasadmin";
    }

    const consultaDono = query(
      collection(db, "barbearias"),
      where("donoId", "==", uid)
    );

    const donos = await getDocs(consultaDono);

    if (!donos.empty) {
      return "dono";
    }

    const consultaBarbeiro = query(
      collection(db, "barbeiros"),
      where("usuarioId", "==", uid)
    );

    const barbeiros = await getDocs(consultaBarbeiro);

    if (!barbeiros.empty) {
      return "barbeiro";
    }

    const cliente = await getDoc(doc(db, "clientes", uid));

    if (cliente.exists()) {
      return "cliente";
    }

    // Compatibilidade com clientes cadastrados por usuarioId
    const consultaCliente = query(
      collection(db, "clientes"),
      where("usuarioId", "==", uid)
    );

    const clientes = await getDocs(consultaCliente);

    if (!clientes.empty) {
      return "cliente";
    }

    return null;
  };

  // Restaurar sessão ao carregar ou atualizar a página
  useEffect(() => {
    let ativo = true;

    const cancelarObservacao = onAuthStateChanged(
      auth,
      async (usuario) => {
        if (!ativo) return;

        if (!usuario) {
          setPainelUsuario("");
          setCarregando(false);
          return;
        }

        try {
          const perfil = await identificarUsuario(usuario.uid);

          if (!ativo) return;

          setPainelUsuario(perfil || "");
        } catch (erro) {
          console.error("Erro ao restaurar sessão:", erro);

          if (ativo) {
            setPainelUsuario("");
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      },
      (erro) => {
        console.error("Erro de autenticação:", erro);

        if (ativo) {
          setCarregando(false);
        }
      }
    );

    return () => {
      ativo = false;
      cancelarObservacao();
    };
  }, []);

  // Realizar login
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (entrando) return;

    setEntrando(true);
    setErroLogin("");
    setMensagemLogin("");

    try {
      const resultado = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      const perfil = await identificarUsuario(resultado.user.uid);

      if (!perfil) {
        await signOut(auth);
        setPainelUsuario("");

        setErroLogin(
          "Sua conta foi autenticada, mas não encontramos seu cadastro no sistema."
        );

        return;
      }

      setPainelUsuario(perfil);

      console.log("Login realizado. Perfil:", perfil);
    } catch (erro) {
      console.error("Erro no login:", erro);

      if (
        erro.code === "auth/invalid-credential" ||
        erro.code === "auth/wrong-password" ||
        erro.code === "auth/user-not-found"
      ) {
        setErroLogin("E-mail ou senha incorretos.");
      } else if (
        erro.code === "permission-denied" ||
        erro.code === "firestore/permission-denied"
      ) {
        setErroLogin(
          "O Firebase não permitiu consultar seu perfil. Verifique as regras do Firestore."
        );
      } else if (erro.message === "ADMIN_SAAS_INATIVO") {
        setErroLogin(
          "Este administrador SaaS está inativo. Entre em contato com o responsável pelo sistema."
        );
      } else {
        setErroLogin(
          "Não foi possível entrar. Verifique sua conexão e tente novamente."
        );
      }
    } finally {
      setEntrando(false);
    }
  };

  // Recuperar senha por e-mail
  const recuperarSenha = async () => {
    setErroLogin("");
    setMensagemLogin("");

    if (!email.trim()) {
      setErroLogin(
        "Digite seu e-mail no campo acima para recuperar sua senha."
      );
      return;
    }

    setRecuperandoSenha(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setMensagemLogin(
        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
      );
    } catch (erro) {
      console.error("Erro ao recuperar senha:", erro);

      if (erro.code === "auth/invalid-email") {
        setErroLogin("Digite um e-mail válido.");
      } else if (erro.code === "auth/too-many-requests") {
        setErroLogin(
          "Muitas tentativas. Aguarde um pouco e tente novamente."
        );
      } else {
        setErroLogin(
          "Não foi possível solicitar a recuperação. Tente novamente."
        );
      }
    } finally {
      setRecuperandoSenha(false);
    }
  };

  // Voltar ao login e encerrar a sessão
  const voltarParaHome = async () => {
    setPainelUsuario("");
    setTipoCadastro("");
    setEmail("");
    setSenha("");
    setErroLogin("");
    setMensagemLogin("");

    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (erro) {
        console.error("Erro ao sair da conta:", erro);
      }
    }
  };

  if (carregando) {
    return (
      <div className="login-page">
        <div className="login-container login-carregando">
          <div className="logo-circulo">
            <FaCut />
          </div>
          <p>Verificando sua conta...</p>
        </div>
      </div>
    );
  }

  // Cadastro de cliente
  if (tipoCadastro === "cliente") {
    return (
      <CadastrarCliente
        voltarHome={() => setTipoCadastro("")}
      />
    );
  }

  // Cadastro de dono da barbearia
  if (tipoCadastro === "dono") {
    return (
      <Cadastrar
        voltarHome={() => setTipoCadastro("")}
      />
    );
  }

  // Direcionar para o painel correto
  if (painelUsuario === "saasadmin") {
    return <PainelSaasAdmin voltarHome={voltarParaHome} />;
  }

  if (painelUsuario === "dono") {
    return <PainelAdmin voltarHome={voltarParaHome} />;
  }

  if (painelUsuario === "barbeiro") {
    return <PainelBarbeiro voltarHome={voltarParaHome} />;
  }

  if (painelUsuario === "cliente") {
    return <PainelCliente voltarHome={voltarParaHome} />;
  }

  // Formulário de login
  return (
    <main className="login-page">
      <section className="login-container">
        <header className="logo-area">
          <div className="logo-circulo">
            <FaCut />
          </div>

          <h1>SaaSBarber</h1>
          <h2>Sistema de Barbearia</h2>
          <p>Entre na sua conta para continuar</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="login-email">E-mail</label>

            <input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="login-senha">Senha</label>


<div className="login-senha-wrapper">
  <input
    id="login-senha"
    type={mostrarSenha ? "text" : "password"}
    placeholder="Sua senha"
    value={senha}
    onChange={(e) => setSenha(e.target.value)}
    autoComplete="current-password"
    required
  />

  <button
    type="button"
    className="login-senha-olho"
    onClick={() => setMostrarSenha(!mostrarSenha)}
    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
    title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
  >
    {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>

          </div>

          <div className="opcoes-login">
            <button
              type="button"
              className="link-recuperar-senha"
              onClick={recuperarSenha}
              disabled={recuperandoSenha}
            >
              {recuperandoSenha
                ? "Enviando..."
                : "Esqueceu a senha?"}
            </button>
          </div>

          {erroLogin && (
            <p className="mensagem-login erro" role="alert">
              {erroLogin}
            </p>
          )}

          {mensagemLogin && (
            <p className="mensagem-login sucesso" role="status">
              {mensagemLogin}
            </p>
          )}

          <button
            type="submit"
            className="botao-entrar"
            disabled={entrando}
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <footer className="area-criar-conta">
          <p>Ainda não tem uma conta?</p>
          <h3>Criar conta</h3>

          <div className="botoes-cadastro">
            <button
              type="button"
              className="botao-cadastro"
              onClick={() => {
                setErroLogin("");
                setMensagemLogin("");
                setTipoCadastro("dono");
              }}
            >
              <FaUserTie />
              <span>Criar conta Barbearia</span>
            </button>

            <button
              type="button"
              className="botao-cadastro"
              onClick={() => {
                setErroLogin("");
                setMensagemLogin("");
                setTipoCadastro("cliente");
              }}
            >
              <FaUsers />
              <span>Criar conta Cliente</span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default Login;
