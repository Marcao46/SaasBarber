
import { useState, useEffect } from "react"
import { FaCut, FaUserTie, FaUsers } from "react-icons/fa"
import "./login.css"

import Cadastrar from "./Cadastrar"
import PainelAdmin from "./PainelAdmin"
import PainelBarbeiro from "./PainelBarbeiro"
import CadastrarCliente from "./CadastrarCliente"
import PainelCliente from "./PainelCliente"
import PainelSaasAdmin from "./PainelSaasAdmin"

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth"

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore"

import { auth, db } from "../fireBaseConfig"


const Login = () => {

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

  useEffect(() => {

    let ativo = true

    const cancelarObservacao = onAuthStateChanged(
      auth,
      async (usuario) => {

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
        }

      }
    )

    return () => {
      ativo = false
      cancelarObservacao()
    }

  }, [])


  // REALIZAR LOGIN AUTOMÁTICO

  const handleSubmit = async (event) => {

    event.preventDefault()

    if (entrando) return

    setEntrando(true)
    setErroLogin("")

    try {

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

    } catch (erro) {

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

    }

  }


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

    return (
      <CadastrarCliente
        voltarHome={() => setTipoCadastro("")}
      />
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
  }

  if (painelUsuario === "cliente") {
    return <PainelCliente />
  }


  // FORMULÁRIO DE LOGIN

  return (

    <div className="login-page">

      <div className="login-container">

        {/* LOGO */}

        <div className="logo-area">

          <div className="logo-circulo">
            <FaCut />
          </div>

          <h1>SaasBarber</h1>

          <h2>Sistema de Barbearia</h2>

          <p>
            Entre na sua conta para continuar
          </p>

        </div>


        {/* FORMULÁRIO */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="campo">

            <label>E-mail</label>

            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>


          {/* SENHA */}

          <div className="campo">

            <label>Senha</label>

            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              required
            />

          </div>


          {/* OPÇÕES */}

          <div className="opcoes-login">

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

          </div>

        </form>


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

    </div>

  )

}

export default Login
