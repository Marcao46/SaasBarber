import { useState, useEffect } from "react"
import { FaCut, FaUserTie, FaUsers } from "react-icons/fa"
import "./login.css"

import Cadastrar from "./Cadastrar"
import PainelAdmin from "./PainelAdmin"
import PainelBarbeiro from "./PainelBarbeiro"
import CadastrarCliente from "./CadastrarCliente"
import PainelCliente from "./PainelCliente"

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"

import { auth } from "../fireBaseConfig"


const Login = () => {

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [tipoLogin, setTipoLogin] = useState("dono")

  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [mostrarPainel, setMostrarPainel] = useState(false)
  const [painelUsuario, setPainelUsuario] = useState("")


  useEffect(() => {

    const cancelarObservacao = onAuthStateChanged(
      auth,
      (usuario) => {

        if (usuario) {

          console.log(
            "Usuário continua logado:",
            usuario.email
          )

        } else {

          setMostrarPainel(false)
          setPainelUsuario("")

        }

      }
    )

    return () => cancelarObservacao()

  }, [])

if (mostrarCadastro) {

    if (tipoLogin === "cliente") {

        return (
            <CadastrarCliente
                voltarHome={() => setMostrarCadastro(false)}
            />
        )

    }

    return (
        <Cadastrar
            voltarHome={() => setMostrarCadastro(false)}
        />
    )
}


  const handleSubmit = async (event) => {

    event.preventDefault()

    try {

      const usuarioLogado =
        await signInWithEmailAndPassword(
          auth,
          email,
          senha
        )

      console.log(
        "Usuário logado:",
        usuarioLogado.user.uid
      )

      console.log(
        "Tipo de login selecionado:",
        tipoLogin
      )

      // Guarda qual painel deverá abrir
      setPainelUsuario(tipoLogin)

      // Abre o painel
      setMostrarPainel(true)

    } catch (erro) {

      console.log(erro)

      alert("E-mail ou senha incorretos")

    }

  }


  
  // ESCOLHA DO PAINEL
 

if (mostrarPainel) {

  if (painelUsuario === "barbeiro") {
    return <PainelBarbeiro />
  }

  if (painelUsuario === "cliente") {
    return <PainelCliente />
  }

  if (painelUsuario === "dono") {
    return <PainelAdmin />
  }

}


  const nomesLogin = {

    barbeiro: "Barbeiro",
    dono: "Dono barbearia",
    cliente: "Cliente"

  }


  return (

    <div className="login-page">

      <div className="login-container">


        {/* LOGO */}

        <div className="logo-area">

          <div className="logo-circulo">
            ✕
          </div>

          <h1>
            Sistema de Barbearia
          </h1>

          <h2>
            Sistema Barbearia
          </h2>

          <p>
            Gestão completa para profissionais
          </p>

        </div>


        {/* FORMULÁRIO */}

        <form onSubmit={handleSubmit}>

          <span className="titulo-tipo">
            TIPO DE LOGIN
          </span>


          {/* TIPOS DE LOGIN */}

          <div className="tipo-login">


            {/* BARBEIRO */}

            <button
              type="button"
              className={
                tipoLogin === "barbeiro"
                  ? "tipo ativo"
                  : "tipo"
              }
              onClick={() =>
                setTipoLogin("barbeiro")
              }
            >

              <FaCut />

              Barbeiro

            </button>


            {/* DONO */}

            <button
              type="button"
              className={
                tipoLogin === "dono"
                  ? "tipo ativo"
                  : "tipo"
              }
              onClick={() =>
                setTipoLogin("dono")
              }
            >

              <FaUserTie />

              Dono barbearia

            </button>


            {/* CLIENTE */}

            <button
              type="button"
              className={
                tipoLogin === "cliente"
                  ? "tipo ativo"
                  : "tipo"
              }
              onClick={() =>
                setTipoLogin("cliente")
              }
            >

              <FaUsers />

              Cliente

            </button>

          </div>


          {/* EMAIL */}

          <div className="campo">

            <label>

              E-mail do {nomesLogin[tipoLogin]}

            </label>

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

            <label>
              Senha
            </label>

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

            <label className="lembrar">

              <input
                type="checkbox"
              />

              Lembrar-me

            </label>

            <a href="#">
              Esqueceu a senha?
            </a>

          </div>


          {/* BOTÕES */}

          <div className="acoes-login">

            <button
              type="submit"
              className="botao-entrar"
            >

              Entrar como {nomesLogin[tipoLogin]}

            </button>


            {tipoLogin !== "barbeiro" && (
              <button
                type="button"
                className="botao-cadastro"
                onClick={() => setMostrarCadastro(true)}
              >
                Solicitar Cadastro
              </button>
            )}

          </div>

        </form>

      </div>

    </div>

  )

}


export default Login