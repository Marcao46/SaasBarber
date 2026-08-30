import { FaUser, FaLock } from 'react-icons/fa'
import { useState, useEffect } from "react"
import './login.css'
import Cadastrar from "./Cadastrar"
import PainelAdmin from "./PainelAdmin"
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"
import { auth } from "../fireBaseConfig"



const Login = () => {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [mostrarPainel, setMostrarPainel] = useState(false)

  useEffect(() => {

  const cancelarObservacao = onAuthStateChanged(
    auth,
    (usuario) => {

      if (usuario) {
        console.log("Usuário continua logado:", usuario.email)
        setMostrarPainel(true)
      } else {
        setMostrarPainel(false)
      }

    }
  )

  return () => cancelarObservacao()

}, [])
  if (mostrarCadastro) {
    return <Cadastrar voltarHome={() => setMostrarCadastro(false)} />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const usuarioLogado = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      )

      console.log(
        "Usuário logado:",
        usuarioLogado.user.uid
      )

      setMostrarPainel(true)

    } catch (erro) {
      console.log(erro)
      alert("E-mail ou senha incorretos")
    }
  }

  if (mostrarPainel) {
    return <PainelAdmin />
  }

  return (
    <div className="container">

      <form onSubmit={handleSubmit}>
        <h1>Acesse o Sistema</h1>
        <div>
          <input type="email" placeholder="E-mail Usuario"
            onChange={(e) => setEmail(e.target.value)} />
          <FaUser className="icon" />
        </div>

        <div>
          <input type="password" placeholder="Senha"
           onChange={(e) => setSenha(e.target.value)} />
          <FaLock className="icon" />
        </div>


        <div className="lembreme">

          <label >
            <input type="checkbox" />
            Lembrar-me
          </label>
          <a href="#">Esqueceu a senha? </a>


        </div>

        <button type="submit">
          Entrar
        </button>
        <div>
          <a href="#" onClick={() => setMostrarCadastro(true)}>
            Cadastre-se
          </a>
        </div>
      </form>
    </div>
  )
}

export default Login