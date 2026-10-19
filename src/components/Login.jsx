<<<<<<< Updated upstream

import { useState, useEffect } from "react"
import { FaCut, FaUserTie, FaUsers } from "react-icons/fa"
import "./login.css"

import Cadastrar from "./Cadastrar"
import PainelAdmin from "./PainelAdmin"
import PainelBarbeiro from "./PainelBarbeiro"
import CadastrarCliente from "./CadastrarCliente"
import PainelCliente from "./PainelCliente"
import PainelSaasAdmin from "./PainelSaasAdmin"
=======

import { useState, useEffect } from "react";
import {
  FaCut,
  FaUserTie,
  FaUsers
} from "react-icons/fa";

import "./login.css";

import Cadastrar from "./Cadastrar";
import PainelAdmin from "./PainelAdmin";
import PainelBarbeiro from "./PainelBarbeiro";
import CadastrarCliente from "./CadastrarCliente";
import PainelCliente from "./PainelCliente";
import PainelSaasAdmin from "./PainelSaasAdmin";
>>>>>>> Stashed changes

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
<<<<<<< Updated upstream
  signOut
} from "firebase/auth"
=======
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
>>>>>>> Stashed changes

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
<<<<<<< Updated upstream
} from "firebase/firestore"

import { auth, db } from "../fireBaseConfig"
=======
} from "firebase/firestore";
>>>>>>> Stashed changes

import { auth, db } from "../fireBaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoCadastro, setTipoCadastro] = useState("");
  const [painelUsuario, setPainelUsuario] = useState("");

<<<<<<< Updated upstream
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  const [tipoCadastro, setTipoCadastro] = useState("")
  const [painelUsuario, setPainelUsuario] = useState("")

  const [carregando, setCarregando] = useState(true)
  const [entrando, setEntrando] = useState(false)
  const [erroLogin, setErroLogin] = useState("")


  // IDENTIFICAR O USUÁRIO NO FIRESTORE

// IDENTIFICAR O USUÁRIO NO FIRESTORE

const identificarUsuario = async (uid) => {

  // ADMINISTRADOR SAAS

  const consultaSaas = query(
    collection(db, "adminsSaas"),
    where("usuarioId", "==", uid)
  )

  const adminsSaas = await getDocs(consultaSaas)

  if (!adminsSaas.empty) {

    const administradorAtivo = adminsSaas.docs.some(
      (documento) => documento.data().ativo === true
    )

    if (!administradorAtivo) {
      throw new Error("ADMIN_SAAS_INATIVO")
    }

    return "saasadmin"
  }


  // DONO DA BARBEARIA

  const consultaDono = query(
    collection(db, "barbearias"),
    where("donoId", "==", uid)
  )

  const donos = await getDocs(consultaDono)

  if (!donos.empty) {
    return "dono"
  }


  // BARBEIRO

  const consultaBarbeiro = query(
    collection(db, "barbeiros"),
    where("usuarioId", "==", uid)
  )

  const barbeiros = await getDocs(consultaBarbeiro)

  if (!barbeiros.empty) {
    return "barbeiro"
  }


  // CLIENTE

  const cliente = await getDoc(
    doc(db, "clientes", uid)
  )

  if (cliente.exists()) {
    return "cliente"
  }

  return null
}

  // RESTAURAR SESSÃO AO ATUALIZAR A PÁGINA
=======
  const [carregando, setCarregando] = useState(true);
  const [entrando, setEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [mensagemLogin, setMensagemLogin] = useState("");
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

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

    const cliente = await getDoc(
      doc(db, "clientes", uid)
    );

    if (cliente.exists()) {
      return "cliente";
    }

    return null;
  };
>>>>>>> Stashed changes

  useEffect(() => {
    let ativo = true;

    let ativo = true

    const cancelarObservacao = onAuthStateChanged(
      auth,
      async (usuario) => {
<<<<<<< Updated upstream

        if (!ativo) return

        if (!usuario) {

          setPainelUsuario("")
          setCarregando(false)
          return

        }

        try {

          const perfil = await identificarUsuario(usuario.uid)

          if (!ativo) return

          setPainelUsuario(perfil || "")

        } catch (erro) {

          console.error(
            "Erro ao restaurar sessão:",
            erro
          )

          if (ativo) {
            setPainelUsuario("")
          }

        } finally {

          if (ativo) {
            setCarregando(false)
          }

        }

      },
      (erro) => {

        console.error("Erro de autenticação:", erro)

        if (ativo) {
          setCarregando(false)
=======
        if (!ativo) return;

        if (!usuario) {
          setPainelUsuario("");
          setCarregando(false);
          return;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    )

    return () => {
      ativo = false
      cancelarObservacao()
    }

  }, [])


  // REALIZAR LOGIN AUTOMÁTICO
=======
    );

    return () => {
      ativo = false;
      cancelarObservacao();
    };
  }, []);
>>>>>>> Stashed changes

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (entrando) return;

    setEntrando(true);
    setErroLogin("");
    setMensagemLogin("");

    if (entrando) return

    setEntrando(true)
    setErroLogin("")

    try {
      const resultado = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

<<<<<<< Updated upstream
      const resultado = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      )

      const uid = resultado.user.uid

      const perfil = await identificarUsuario(uid)

      if (!perfil) {

        await signOut(auth)

        setPainelUsuario("")

        setErroLogin(
          "Sua conta foi autenticada, mas não encontramos seu cadastro no sistema."
        )

        return
      }

      // ABRE AUTOMATICAMENTE O PAINEL CORRETO

      setPainelUsuario(perfil)

      console.log(
        "Login realizado. Perfil:",
        perfil
      )

=======
      const perfil = await identificarUsuario(
        resultado.user.uid
      );

      if (!perfil) {
        await signOut(auth);
        setPainelUsuario("");

        setErroLogin(
          "Sua conta foi autenticada, mas não encontramos seu cadastro no sistema."
        );

        return;
      }

      setPainelUsuario(perfil);
>>>>>>> Stashed changes
    } catch (erro) {
      console.error("Erro no login:", erro);

<<<<<<< Updated upstream
      console.error("Erro no login:", erro)

      if (
        erro.code === "auth/invalid-credential" ||
        erro.code === "auth/wrong-password" ||
        erro.code === "auth/user-not-found"
      ) {

        setErroLogin("E-mail ou senha incorretos.")

      } else if (erro.code === "permission-denied") {

        setErroLogin(
          "O Firebase não permitiu consultar seu perfil. Verifique as regras do Firestore."
        )

      } else {

        setErroLogin(
          "Não foi possível entrar. Tente novamente."
        )

      }

    } finally {

      setEntrando(false)
=======
      if (
        erro.code === "auth/invalid-credential" ||
        erro.code === "auth/wrong-password" ||
        erro.code === "auth/user-not-found"
      ) {
        setErroLogin("E-mail ou senha incorretos.");
      } else if (erro.code === "permission-denied") {
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

  const recuperarSenha = async () => {
    setErroLogin("");
    setMensagemLogin("");
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

  // EXIBIR TELA DE CARREGAMENTO

  if (carregando) {

    return (
      <div className="login-page">
        <div className="login-container">
          <p>Verificando sua conta...</p>
        </div>
      </div>
    )

  }


  // CADASTRO DE CLIENTE

  if (tipoCadastro === "cliente") {

=======
  if (tipoCadastro === "cliente") {
>>>>>>> Stashed changes
    return (
      <CadastrarCliente
        voltarHome={() => setTipoCadastro("")}
      />
<<<<<<< Updated upstream
    )

  }


  // CADASTRO DE DONO

  if (tipoCadastro === "dono") {

    return (
      <Cadastrar
        voltarHome={() => setTipoCadastro("")}
      />
    )

  }


  // DIRECIONAMENTO AUTOMÁTICO
if (painelUsuario === "saasadmin") {
  return <PainelSaasAdmin />
}
  if (painelUsuario === "dono") {
    return <PainelAdmin />
  }

  if (painelUsuario === "barbeiro") {
    return <PainelBarbeiro />
=======
    );
>>>>>>> Stashed changes
  }

  if (tipoCadastro === "dono") {
    return (
      <Cadastrar
        voltarHome={() => setTipoCadastro("")}
      />
    );
  }

  if (painelUsuario === "saasadmin") {
    return <PainelSaasAdmin voltarHome={voltarParaHome} />;
  }

<<<<<<< Updated upstream

  // FORMULÁRIO DE LOGIN

  return (

    <div className="login-page">

      <div className="login-container">

        {/* LOGO */}

        <div className="logo-area">

=======
  if (painelUsuario === "dono") {
    return <PainelAdmin voltarHome={voltarParaHome} />;
  }

  if (painelUsuario === "barbeiro") {
    return <PainelBarbeiro voltarHome={voltarParaHome} />;
  }

  if (painelUsuario === "cliente") {
    return <PainelCliente voltarHome={voltarParaHome} />;
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <header className="logo-area">
>>>>>>> Stashed changes
          <div className="logo-circulo">
            <FaCut />
          </div>

<<<<<<< Updated upstream
          <h1>SaasBarber</h1>

          <h2>Sistema de Barbearia</h2>

          <p>
            Entre na sua conta para continuar
          </p>

        </div>


        {/* FORMULÁRIO */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
=======
          <h1>SaaSBarber</h1>
          <h2>Sistema de Barbearia</h2>

          <p>Entre na sua conta para continuar</p>
        </header>
>>>>>>> Stashed changes

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo">
<<<<<<< Updated upstream

            <label>E-mail</label>
=======
            <label htmlFor="login-email">E-mail</label>
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

            <label>Senha</label>
=======
            <label htmlFor="login-senha">Senha</label>
>>>>>>> Stashed changes

            <input
              id="login-senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="opcoes-login">
<<<<<<< Updated upstream

            <a href="#">
              Esqueceu a senha?
            </a>

          </div>


          {/* MENSAGEM DE ERRO */}

          {erroLogin && (

            <p
              style={{
                color: "#ef4444",
                textAlign: "center",
                marginBottom: "12px"
              }}
            >
              {erroLogin}
            </p>

          )}


          {/* BOTÃO LOGIN */}

          <div className="acoes-login">

            <button
              type="submit"
              className="botao-entrar"
              disabled={entrando}
            >

              {entrando ? "Entrando..." : "Entrar"}

            </button>

=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream

        {/* CRIAR CONTA */}

        <div
          className="area-criar-conta"
          style={{
            marginTop: "25px",
            textAlign: "center"
          }}
        >

          <p>
            Ainda não tem uma conta?
          </p>

          <h3
            style={{
              marginTop: "10px",
              marginBottom: "15px"
            }}
          >
            Criar conta
          </h3>


          <div
            className="acoes-login"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >

            {/* CRIAR CONTA DONO */}

            <button
              type="button"
              className="botao-cadastro"
              onClick={() => setTipoCadastro("dono")}
            >

              <FaUserTie style={{ marginRight: "8px" }} />

              Criar conta Dono Barbearia

            </button>


            {/* CRIAR CONTA CLIENTE */}

            <button
              type="button"
              className="botao-cadastro"
              onClick={() => setTipoCadastro("cliente")}
            >

              <FaUsers style={{ marginRight: "8px" }} />

              Criar conta Cliente

            </button>

          </div>

        </div>

      </div>
=======
        <footer className="area-criar-conta">
          <p>Ainda não tem uma conta?</p>
          <h3>Criar conta</h3>
>>>>>>> Stashed changes

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
              <span>Criar conta Babearia</span>
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

<<<<<<< Updated upstream
}

export default Login
=======
export default Login;
>>>>>>> Stashed changes
