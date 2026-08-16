import { FaUser, FaLock } from 'react-icons/fa'
import { useState } from "react"
import './login.css'



const Login = () => {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Dados Enviados:  " + email+"----"+ senha);

  };

  return (
    <div className="container">

      <form onSubmit={handleSubmit}>  
        <h1>Acesse o Sistema</h1>
        <div>
          <input type="email" placeholder="E-mail Usuario" 
          onChange={(e)=>setEmail(e.target.value)}/>
          <FaUser className="icon" />
        </div>

        <div>
          <input type="" placeholder="Senha" 
          onChange={(e)=>setSenha(e.target.value)}/>
          <FaLock className="icon" />
        </div>


        <div className="lembreme">

          <label >
            <input type="checkbox" />
            Lembrar-me
          </label>
          <a href="#">Esqueceu a senha? </a>


        </div>

        <button type="submit">Entrar</button>
        <div>
          <p>Nao tem uma conta? <a href="#">Cadastre-se</a>  </p>
        </div>
      </form>
    </div>
  )
}

export default Login