<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
import { useEffect, useMemo, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../fireBaseConfig"

import {
  FaCut,
  FaSignInAlt,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaStore,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaMobileAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSearch,
  FaStar,
  FaMapMarkerAlt
} from "react-icons/fa"

import Login from "./Login"
import Cadastrar from "./Cadastrar"

import fotoDegrade from "../assets/Degrade.jpg"
import fotoCorte from "../assets/Corte.jpg"
import fotoBarba from "../assets/Barba.jpg"

import "./Home.css"

// ==========================================
// FOTO PADRÃO DAS BARBEARIAS
// ==========================================

const fotoBarbeariaPadrao = fotoCorte

// ==========================================
// RECURSOS DA PLATAFORMA
// ==========================================

const recursos = [
  {
    icone: <FaCalendarAlt />,
    titulo: "Agendamentos online",
    descricao:
      "Organize horários e facilite o agendamento dos seus clientes."
  },
  {
    icone: <FaUsers />,
    titulo: "Gestão de profissionais",
    descricao:
      "Cadastre seus barbeiros e organize sua equipe."
  },
  {
    icone: <FaChartBar />,
    titulo: "Controle administrativo",
    descricao:
      "Tenha uma visão organizada das atividades da barbearia."
  },
  {
    icone: <FaStore />,
    titulo: "Gestão da barbearia",
    descricao:
      "Centralize informações importantes do seu negócio."
  },
  {
    icone: <FaClock />,
    titulo: "Mais praticidade",
    descricao:
      "Reduza tarefas manuais e economize tempo."
  },
  {
    icone: <FaMobileAlt />,
    titulo: "Acesso pelo celular",
    descricao:
      "Utilize a plataforma no celular, tablet ou computador."
  }
]

// ==========================================
// ESTILOS DE CORTE
// ==========================================

const estilos = [
  {
    nome: "Degradê",
    imagem: fotoDegrade,
    descricao: "Um clássico moderno."
  },
  {
    nome: "Corte moderno",
    imagem: fotoCorte,
    descricao: "Estilo e personalidade."
  },
  {
    nome: "Barba",
    imagem: fotoBarba,
    descricao: "Visual sempre alinhado."
  }
]

// ==========================================
// PERGUNTAS FREQUENTES
// ==========================================

const perguntas = [
  {
    pergunta: "O que é o SaaSBarber?",
    resposta:
      "É uma plataforma que conecta a gestão das barbearias à experiência dos clientes."
  },
  {
    pergunta: "Como cadastrar minha barbearia?",
    resposta:
      "Clique em Sou dono de barbearia e preencha o cadastro."
  },
  {
    pergunta: "Sou cliente. Posso criar uma conta?",
    resposta:
      "Sim. Clique em Entrar e escolha Criar conta Cliente."
  },
  {
    pergunta: "Como os barbeiros acessam o sistema?",
    resposta:
      "Todos utilizam o mesmo login. O sistema identifica o perfil cadastrado."
  },
  {
    pergunta: "Posso acessar pelo celular?",
    resposta:
      "Sim. A interface foi desenvolvida para diferentes tamanhos de tela."
  }
]

// ==========================================
// FORMATAR PREÇO
// ==========================================

const formatarPreco = (valor) => {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return "Preço indisponível"
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
<<<<<<< Updated upstream
=======
}

// ==========================================
// FOTO DE CAPA DA BARBEARIA
// ==========================================

const obterFotoBarbearia = (barbearia) => {
  const primeiraFoto = Array.isArray(barbearia.galeria)
    ? barbearia.galeria[0]
    : null

  const fotoGaleria =
    typeof primeiraFoto === "string"
      ? primeiraFoto
      : primeiraFoto?.url

  return (
    barbearia.fotoCapa ||
    fotoGaleria ||
    fotoBarbeariaPadrao
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Home = () => {
  const [telaAtual, setTelaAtual] = useState("home")
  const [menuAberto, setMenuAberto] = useState(false)
  const [perguntaAberta, setPerguntaAberta] = useState(null)

  const [busca, setBusca] = useState("")
  const [barbearias, setBarbearias] = useState([])
  const [carregandoBarbearias, setCarregandoBarbearias] =
    useState(true)
  const [erroBarbearias, setErroBarbearias] = useState("")
  const [barbeariaSelecionada, setBarbeariaSelecionada] =
    useState(null)
  const [paginaRolada, setPaginaRolada] = useState(false)

  // ==========================================
  // CARREGAR BARBEARIAS PÚBLICAS DO FIREBASE
  // ==========================================

  useEffect(() => {
    let ativo = true

    const carregarBarbearias = async () => {
      try {
        const resultado = await getDocs(
          collection(db, "barbeariasPublicas")
        )

        if (!ativo) return

        const lista = resultado.docs
          .map((documento) => ({
            ...documento.data(),
            id: documento.id
          }))
          .filter((item) => item.publicada === true)

        setBarbearias(lista)
      } catch (erro) {
        console.error(
          "Erro ao carregar barbearias públicas:",
          erro
        )

        if (ativo) {
          setErroBarbearias(
            "Não foi possível carregar as barbearias. Verifique as permissões da vitrine pública no Firebase."
          )
        }
      } finally {
        if (ativo) {
          setCarregandoBarbearias(false)
        }
      }
    }

    carregarBarbearias()

    return () => {
      ativo = false
    }
  }, [])

  // ==========================================
  // PESQUISA DAS BARBEARIAS
  // ==========================================

  const barbeariasFiltradas = useMemo(() => {
    const termo = busca
      .trim()
      .toLocaleLowerCase("pt-BR")

    if (!termo) {
      return barbearias
    }

    return barbearias.filter((item) => {
      const campos = [
        item.nomeBarbearia,
        item.cidade,
        item.bairro
      ]

      return campos.some((campo) =>
        String(campo || "")
          .toLocaleLowerCase("pt-BR")
          .includes(termo)
      )
    })
  }, [barbearias, busca])

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  const abrirLogin = () => {
    setMenuAberto(false)
    setTelaAtual("login")
    window.scrollTo(0, 0)
  }

  const abrirCadastro = () => {
    setMenuAberto(false)
    setTelaAtual("cadastro")
    window.scrollTo(0, 0)
  }

  const voltarHome = () => {
    setTelaAtual("home")
    window.scrollTo(0, 0)
  }

  const navegarPara = (id) => {
    setMenuAberto(false)

    const elemento = document.getElementById(id)

    if (elemento) {
      elemento.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }

  const pesquisarBarbearias = (event) => {
    event.preventDefault()
    navegarPara("barbearias-destaque")
  }

  const selecionarBarbearia = (barbearia) => {
    setBarbeariaSelecionada(barbearia)
  }

  useEffect(() => {
    const verificarRolagem = () => {
      setPaginaRolada(window.scrollY > 70)
    }

    verificarRolagem()

    window.addEventListener("scroll", verificarRolagem, {
      passive: true
    })

    return () => {
      window.removeEventListener("scroll", verificarRolagem)
    }
  }, [])

  // ==========================================
  // TELA DE LOGIN — BOTÃO DUPLICADO REMOVIDO
  // ==========================================

  if (telaAtual === "login") {
    return (
      <div className="home-tela-acesso">
        <Login />
      </div>
    )
  }

  // ==========================================
  // TELA DE CADASTRO — BOTÃO DUPLICADO REMOVIDO
  // ==========================================

  if (telaAtual === "cadastro") {
    return (
      <div className="home-tela-acesso">
        <Cadastrar voltarHome={voltarHome} />
      </div>
    )
  }

  // ==========================================
  // HOME
  // ==========================================

  return (
    <div className="home-page">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <header
        className={`home-header ${
          paginaRolada ? "home-header-rolado" : ""
        }`}
      >
        <div
          className="home-logo"
          role="button"
          tabIndex={0}
          onClick={() => navegarPara("inicio")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navegarPara("inicio")
            }
          }}
        >
          <div className="home-logo-icone">
            <FaCut />
          </div>

          <div>
            <h1>
              SaaS<span>Barber</span>
            </h1>
            <p>Gestão inteligente para barbearias</p>
          </div>
        </div>

        <nav
          className={`home-menu ${
            menuAberto ? "menu-aberto" : ""
          }`}
          aria-label="Menu principal"
        >
          <button onClick={() => navegarPara("inicio")}>
            Início
          </button>

          <button onClick={() => navegarPara("para-clientes")}>
            Para clientes
          </button>

          <button onClick={() => navegarPara("recursos")}>
            Recursos
          </button>

          <button onClick={() => navegarPara("como-funciona")}>
            Como funciona
          </button>

          <button onClick={() => navegarPara("planos")}>
            Planos
          </button>

          <button onClick={() => navegarPara("contato")}>
            Contato
          </button>
        </nav>

        <div className="home-header-acoes">
          <button
            type="button"
            className="botao-login-premium"
            onClick={abrirLogin}
          >
            <FaSignInAlt />
            <span>Entrar</span>
            <FaArrowRight className="login-seta" />
          </button>

          <button
            type="button"
            className="home-menu-toggle"
            aria-label={
              menuAberto ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>
            {/* ======================================
          APRESENTAÇÃO PRINCIPAL
      ====================================== */}

      <main className="home-principal" id="inicio">
        <div className="home-apresentacao">

          <div className="home-selo">
            <FaCheckCircle />
            Tecnologia para sua barbearia
          </div>

          <h2>
            Sua barbearia
            <br />
            mais organizada.
            <br />
            <strong>Seu negócio crescendo.</strong>
          </h2>

          <p className="home-descricao">
            Agendamentos, profissionais, clientes
            e gestão do seu negócio em um só lugar.
            Simplifique sua rotina e tenha mais
            tempo para o que realmente importa.
          </p>

          <div className="home-botoes-principais">
            <button
              className="home-botao-comecar"
              onClick={abrirCadastro}
            >
              Sou dono de barbearia
              <FaArrowRight />
            </button>

            <button
              className="home-botao-conhecer"
              onClick={() => navegarPara("para-clientes")}
            >
              Quero agendar um corte
            </button>
          </div>

          <div className="home-beneficios-rapidos">
            <span>
              <FaCheckCircle />
              Gestão centralizada
            </span>

            <span>
              <FaCheckCircle />
              Fácil de utilizar
            </span>

            <span>
              <FaCheckCircle />
              Acesso online
            </span>
          </div>

        </div>
      </main>

      {/* ======================================
          ÁREA PARA CLIENTES
      ====================================== */}

      <section
        className="home-secao home-secao-clientes"
        id="para-clientes"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            PARA QUEM VALORIZA O ESTILO
          </span>

          <h2>
            Seu próximo corte
            <br />
            <strong>começa aqui.</strong>
          </h2>

          <p>
            Inspire-se com novos estilos,
            descubra barbearias e encontre
            profissionais para cuidar do seu visual.
          </p>
        </div>

        {/* ESTILOS DE CORTE */}

        <div className="home-grid-estilos">
          {estilos.map((estilo) => (
            <div
              className="home-card-estilo"
              key={estilo.nome}
            >
              <img
                src={estilo.imagem}
                alt={estilo.nome}
                loading="lazy"
              />

              <div className="home-card-estilo-info">
                <h3>{estilo.nome}</h3>
                <p>{estilo.descricao}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================
            BUSCA DE BARBEARIAS
        ================================== */}

        <div className="home-busca-container">
          <div className="home-busca-texto">
            <span className="home-etiqueta">
              ENCONTRE SUA BARBEARIA
            </span>

            <h3>
              Procurando um lugar para
              <strong> renovar o visual?</strong>
            </h3>

            <p>
              Pesquise estabelecimentos por nome,
              cidade ou bairro e consulte os serviços
              e preços disponíveis.
            </p>
          </div>

          <form
            className="home-form-busca"
            onSubmit={pesquisarBarbearias}
          >
            <FaSearch className="home-icone-busca" />

            <input
              type="search"
              placeholder="Nome, cidade ou bairro..."
              aria-label="Buscar barbearias"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button type="submit">
              Buscar
            </button>
          </form>
        </div>

        {/* ==================================
            BARBEARIAS EM DESTAQUE
        ================================== */}

        <div
          className="home-barbearias-area"
          id="barbearias-destaque"
        >
          <div className="home-barbearias-cabecalho">
            <div>
              <span className="home-etiqueta">
                DESCUBRA NOVOS LUGARES
              </span>

              <h3>
                Barbearias <strong>em destaque</strong>
              </h3>
            </div>

            <div className="home-localizacao">
              <FaMapMarkerAlt />
              Pesquise sua região
            </div>
          </div>

          {carregandoBarbearias ? (
            <div className="home-barbearias-vazio">
              <p>Carregando barbearias...</p>
            </div>
          ) : erroBarbearias ? (
            <div className="home-barbearias-vazio">
              <p role="alert">{erroBarbearias}</p>
            </div>
          ) : barbeariasFiltradas.length > 0 ? (

            <div className="home-grid-barbearias">
              {barbeariasFiltradas.map((barbearia) => {

                const servicos = Array.isArray(
                  barbearia.servicos
                )
                  ? barbearia.servicos.filter(
                    (servico) => servico.ativo !== false
                  )
                  : []

                const localizacao = [
                  barbearia.bairro,
                  barbearia.cidade
                ]
                  .filter(Boolean)
                  .join(" - ")

                const precosValidos = servicos
                  .map((servico) => Number(servico.preco))
                  .filter(
                    (valor) =>
                      Number.isFinite(valor) && valor >= 0
                  )

                const menorPreco =
                  precosValidos.length > 0
                    ? Math.min(...precosValidos)
                    : null

                return (
                  <article
                    className="home-card-barbearia"
                    key={barbearia.id}
                  >

                    {/* FOTO DA BARBEARIA */}

                    <div className="home-card-barbearia-capa">
                      <img
                        src={obterFotoBarbearia(barbearia)}
                        alt={`Foto da barbearia ${
                          barbearia.nomeBarbearia || "Barbearia"
                        }`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src =
                            fotoBarbeariaPadrao
                        }}
                      />

                      <span className="home-card-barbearia-status">
                        {servicos.length > 0
                          ? "Serviços disponíveis"
                          : "Conheça a barbearia"}
                      </span>
                    </div>

                    {/* INFORMAÇÕES DO CARD */}

                    <div className="home-card-barbearia-conteudo">

                      <h4>
                        {barbearia.nomeBarbearia || "Barbearia"}
                      </h4>

                      <p className="home-card-barbearia-local">
                        <FaMapMarkerAlt />
                        {localizacao ||
                          "Localização não informada"}
                      </p>

                      <p className="home-card-barbearia-descricao">
                        Conheça os serviços oferecidos
                        por este estabelecimento.
                      </p>

                      {menorPreco !== null && (
                        <div className="home-card-barbearia-preco">
                          A partir de

                          <strong>
                            {formatarPreco(menorPreco)}
                          </strong>
                        </div>
                      )}

                      <button
                        type="button"
                        className="home-card-barbearia-botao"
                        onClick={() =>
                          selecionarBarbearia(barbearia)
                        }
                      >
                        Ver serviços e preços
                        <FaArrowRight />
                      </button>

                    </div>
                  </article>
                )
              })}
            </div>

          ) : (

            <div className="home-barbearias-vazio">
              <div className="home-vazio-icone">
                <FaStore />
              </div>

              <h4>
                {busca.trim()
                  ? "Nenhuma barbearia encontrada"
                  : "As barbearias aparecerão aqui!"}
              </h4>

              <p>
                {busca.trim()
                  ? "Tente pesquisar outro nome, cidade ou bairro."
                  : "Estamos preparando a vitrine de estabelecimentos. Em breve você poderá conhecer os serviços e preços publicados."}
              </p>

              <div className="home-avaliacoes-previa">
                <span>
                  <FaStar />
                  Avaliações futuras
                </span>

                <span>
                  <FaMapMarkerAlt />
                  Busca por região
                </span>

                <span>
                  <FaCalendarAlt />
                  Agendamentos futuros
                </span>
              </div>

              <button
                className="home-botao-conhecer"
                onClick={abrirLogin}
              >
                Já tenho uma conta
                <FaArrowRight />
              </button>
            </div>

          )}
        </div>
      </section>

      {/* ======================================
          RECURSOS
      ====================================== */}

      <section
        className="home-secao home-secao-recursos"
        id="recursos"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            RECURSOS
          </span>

          <h2>
            Tudo que sua barbearia precisa
            <br />
            <strong>em um só lugar</strong>
          </h2>

          <p>
            Ferramentas para facilitar a rotina,
            organizar sua equipe e melhorar
            a gestão do seu negócio.
          </p>
        </div>

        <div className="home-grid-recursos">
          {recursos.map((recurso, index) => (
            <div
              className="home-card-recurso"
              key={index}
            >
              <div className="home-card-icone">
                {recurso.icone}
              </div>

              <h3>{recurso.titulo}</h3>
              <p>{recurso.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================
          COMO FUNCIONA
      ====================================== */}

      <section
        className="home-secao home-secao-passos"
        id="como-funciona"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            SIMPLES DE COMEÇAR
          </span>

          <h2>
            Comece em apenas
            <strong> 3 passos</strong>
          </h2>

          <p>
            Uma experiência simples
            desde o primeiro acesso.
          </p>
        </div>

        <div className="home-grid-passos">

          <div className="home-card-passo">
            <div className="home-numero-passo">
              01
            </div>

            <h3>Crie sua conta</h3>

            <p>
              Cadastre-se como dono de barbearia
              e comece a configurar seu negócio.
            </p>
          </div>

          <div className="home-card-passo">
            <div className="home-numero-passo">
              02
            </div>

            <h3>Configure sua barbearia</h3>

            <p>
              Organize os dados e cadastre
              os profissionais conforme
              as funcionalidades disponíveis.
            </p>
          </div>

          <div className="home-card-passo">
            <div className="home-numero-passo">
              03
            </div>

            <h3>Comece a gerenciar</h3>

            <p>
              Acesse seu painel e utilize
              as ferramentas da plataforma.
            </p>
          </div>

        </div>

        <div className="home-centralizar">
          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Criar minha conta
            <FaArrowRight />
          </button>
        </div>
      </section>
            {/* ======================================
          PLANOS
      ====================================== */}

      <section
        className="home-secao home-secao-planos"
        id="planos"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            PLANOS
          </span>

          <h2>
            Uma solução para
            <strong> seu negócio</strong>
          </h2>

          <p>
            Conheça a plataforma e acompanhe
            as novidades sobre nossos planos.
          </p>
        </div>

        <div className="home-plano-card">
          <div className="home-plano-icone">
            <FaStore />
          </div>

          <h3>SaaSBarber</h3>

          <p className="home-plano-subtitulo">
            Gestão inteligente para barbearias
          </p>

          <div className="home-plano-status">
            Planos em preparação
          </div>

          <div className="home-plano-beneficios">
            <p>
              <FaCheckCircle />
              Gestão de profissionais
            </p>

            <p>
              <FaCheckCircle />
              Organização de clientes
            </p>

            <p>
              <FaCheckCircle />
              Recursos de agendamento
            </p>

            <p>
              <FaCheckCircle />
              Painéis por tipo de usuário
            </p>
          </div>

          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Conhecer a plataforma
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* ======================================
          PERGUNTAS FREQUENTES
      ====================================== */}

      <section
        className="home-secao home-secao-faq"
        id="perguntas"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            DÚVIDAS FREQUENTES
          </span>

          <h2>
            Perguntas <strong>frequentes</strong>
          </h2>

          <p>
            Encontre respostas para as principais
            dúvidas sobre a plataforma.
          </p>
        </div>

        <div className="home-faq-lista">
          {perguntas.map((item, index) => (
            <div
              className="home-faq-item"
              key={index}
            >
              <button
                className="home-faq-pergunta"
                aria-expanded={perguntaAberta === index}
                onClick={() =>
                  setPerguntaAberta(
                    perguntaAberta === index
                      ? null
                      : index
                  )
                }
              >
                <span>{item.pergunta}</span>

                <FaChevronDown
                  className={
                    perguntaAberta === index
                      ? "faq-icone-aberto"
                      : ""
                  }
                />
              </button>

              {perguntaAberta === index && (
                <div className="home-faq-resposta">
                  <p>{item.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================
          CHAMADA FINAL
      ====================================== */}

      <section className="home-chamada-final">
        <div>
          <span className="home-etiqueta">
            PRONTO PARA COMEÇAR?
          </span>

          <h2>
            Dê o próximo passo na
            <strong> gestão da sua barbearia</strong>
          </h2>

          <p>
            Crie sua conta e conheça
            as ferramentas do SaaSBarber.
          </p>

          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Criar conta
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* ======================================
          RODAPÉ
      ====================================== */}

      <footer className="home-footer" id="contato">
        <div className="home-footer-conteudo">

          <div className="home-footer-marca">
            <div className="home-footer-logo">
              <FaCut />

              <h3>
                SaaS<span>Barber</span>
              </h3>
            </div>

            <p>
              Tecnologia e praticidade
              para a gestão de barbearias.
            </p>
          </div>

          <div className="home-footer-links">
            <h4>Navegação</h4>

            <button onClick={() => navegarPara("inicio")}>
              Início
            </button>

            <button
              onClick={() => navegarPara("para-clientes")}
            >
              Para clientes
            </button>

            <button onClick={() => navegarPara("recursos")}>
              Recursos
            </button>

            <button onClick={() => navegarPara("planos")}>
              Planos
            </button>
          </div>

          <div className="home-footer-links">
            <h4>Sua conta</h4>

            <button onClick={abrirLogin}>
              Fazer login
            </button>

            <button onClick={abrirCadastro}>
              Criar conta
            </button>
          </div>

          <div className="home-footer-links">
            <h4>Informações</h4>

            <p>
              Plataforma de gestão
              para barbearias.
            </p>

            <p>
              Canais oficiais de atendimento
              serão disponibilizados aqui.
            </p>
          </div>

        </div>

        <div className="home-footer-inferior">
          <p>
            © {new Date().getFullYear()} SaaSBarber.
            Todos os direitos reservados.
          </p>

          <p>
            Desenvolvido para modernizar
            a gestão de barbearias.
          </p>
        </div>
      </footer>

      {/* ======================================
          MODAL DE SERVIÇOS E PREÇOS
      ====================================== */}

      {barbeariaSelecionada && (
        <div
          className="home-modal-fundo"
          onClick={() => setBarbeariaSelecionada(null)}
        >
          <section
            className="home-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Serviços e preços da barbearia"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="home-modal-fechar"
              aria-label="Fechar"
              onClick={() =>
                setBarbeariaSelecionada(null)
              }
            >
              <FaTimes />
            </button>

            <span className="home-etiqueta">
              SERVIÇOS E PREÇOS
            </span>

            <h2>
              {barbeariaSelecionada.nomeBarbearia}
            </h2>

            <p className="home-modal-local">
              <FaMapMarkerAlt />

              {[
                barbeariaSelecionada.bairro,
                barbeariaSelecionada.cidade
              ]
                .filter(Boolean)
                .join(" - ") ||
                "Localização não informada"}
            </p>

            <div className="home-modal-servicos">
              {Array.isArray(
                barbeariaSelecionada.servicos
              ) &&
                barbeariaSelecionada.servicos.filter(
                  (servico) => servico.ativo !== false
                ).length > 0 ? (

                barbeariaSelecionada.servicos
                  .filter(
                    (servico) =>
                      servico.ativo !== false
                  )
                  .map((servico, index) => (
                    <div
                      className="home-modal-servico"
                      key={servico.id || index}
                    >
                      <div>
                        <h3>{servico.nome}</h3>

                        <p>
                          <FaClock />
                          {servico.duracao} minutos
                        </p>
                      </div>

                      <strong>
                        {formatarPreco(servico.preco)}
                      </strong>
                    </div>
                  ))

              ) : (
                <p>
                  Esta barbearia ainda não publicou
                  serviços e preços.
                </p>
              )}
            </div>

            <div className="home-modal-rodape">
              <p>
                O agendamento online será disponibilizado
                em uma próxima etapa.
              </p>

              <button
                type="button"
                className="home-botao-comecar"
                onClick={() => {
                  setBarbeariaSelecionada(null)
                  abrirLogin()
                }}
              >
                Entrar na minha conta
                <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
>>>>>>> Stashed changes
}

// ==========================================
// FOTO DE CAPA DA BARBEARIA
// ==========================================

const obterFotoBarbearia = (barbearia) => {
  const primeiraFoto = Array.isArray(barbearia.galeria)
    ? barbearia.galeria[0]
    : null

  const fotoGaleria =
    typeof primeiraFoto === "string"
      ? primeiraFoto
      : primeiraFoto?.url

  return (
    barbearia.fotoCapa ||
    fotoGaleria ||
    fotoBarbeariaPadrao
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Home = () => {
  const [telaAtual, setTelaAtual] = useState("home")
  const [menuAberto, setMenuAberto] = useState(false)
  const [perguntaAberta, setPerguntaAberta] = useState(null)

  const [busca, setBusca] = useState("")
  const [barbearias, setBarbearias] = useState([])
  const [carregandoBarbearias, setCarregandoBarbearias] =
    useState(true)
  const [erroBarbearias, setErroBarbearias] = useState("")
  const [barbeariaSelecionada, setBarbeariaSelecionada] =
    useState(null)
  const [paginaRolada, setPaginaRolada] = useState(false)
  // ==========================================
  // CARREGAR BARBEARIAS PÚBLICAS DO FIREBASE
  // ==========================================

  useEffect(() => {
    let ativo = true

    const carregarBarbearias = async () => {
      try {
        const resultado = await getDocs(
          collection(db, "barbeariasPublicas")
        )

        if (!ativo) return

        const lista = resultado.docs
          .map((documento) => ({
            ...documento.data(),
            id: documento.id
          }))
          .filter((item) => item.publicada === true)

        setBarbearias(lista)
      } catch (erro) {
        console.error(
          "Erro ao carregar barbearias públicas:",
          erro
        )

        if (ativo) {
          setErroBarbearias(
            "Não foi possível carregar as barbearias. Verifique as permissões da vitrine pública no Firebase."
          )
        }
      } finally {
        if (ativo) {
          setCarregandoBarbearias(false)
        }
      }
    }

    carregarBarbearias()

    return () => {
      ativo = false
    }
  }, [])

  // ==========================================
  // PESQUISA DAS BARBEARIAS
  // ==========================================

  const barbeariasFiltradas = useMemo(() => {
    const termo = busca
      .trim()
      .toLocaleLowerCase("pt-BR")

    if (!termo) {
      return barbearias
    }

    return barbearias.filter((item) => {
      const campos = [
        item.nomeBarbearia,
        item.cidade,
        item.bairro
      ]

      return campos.some((campo) =>
        String(campo || "")
          .toLocaleLowerCase("pt-BR")
          .includes(termo)
      )
    })
  }, [barbearias, busca])

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  const abrirLogin = () => {
    setMenuAberto(false)
    setTelaAtual("login")
    window.scrollTo(0, 0)
  }

  const abrirCadastro = () => {
    setMenuAberto(false)
    setTelaAtual("cadastro")
    window.scrollTo(0, 0)
  }

  const voltarHome = () => {
    setTelaAtual("home")
    window.scrollTo(0, 0)
  }

  const navegarPara = (id) => {
    setMenuAberto(false)

    const elemento = document.getElementById(id)

    if (elemento) {
      elemento.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }

  const pesquisarBarbearias = (event) => {
    event.preventDefault()
    navegarPara("barbearias-destaque")
  }

  const selecionarBarbearia = (barbearia) => {
    setBarbeariaSelecionada(barbearia)
  }


  useEffect(() => {
    const verificarRolagem = () => {
      setPaginaRolada(window.scrollY > 70)
    }

    verificarRolagem()

    window.addEventListener("scroll", verificarRolagem, {
      passive: true
    })

    return () => {
      window.removeEventListener("scroll", verificarRolagem)
    }
  }, [])


  // ==========================================
  // TELA DE LOGIN
  // ==========================================

  if (telaAtual === "login") {
    return (
      <div className="home-tela-acesso">
        <button
          type="button"
          className="home-botao-voltar"
          onClick={voltarHome}
        >
          ← Voltar para Home
        </button>

        <Login />
      </div>
    )
  }

  // ==========================================
  // TELA DE CADASTRO
  // ==========================================

  if (telaAtual === "cadastro") {
    return (
      <div className="home-tela-acesso">
        <button
          type="button"
          className="home-botao-voltar"
          onClick={voltarHome}
        >
          ← Voltar para Home
        </button>

        <Cadastrar voltarHome={voltarHome} />
      </div>
    )
  }

  // ==========================================
  // HOME
  // ==========================================

  return (
    <div className="home-page">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <header
        className={`home-header ${paginaRolada ? "home-header-rolado" : ""}`}
      >
        <div
          className="home-logo"
          role="button"
          tabIndex={0}
          onClick={() => navegarPara("inicio")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navegarPara("inicio")
            }
          }}
        >
          <div className="home-logo-icone">
            <FaCut />
          </div>

          <div>
            <h1>
              SaaS<span>Barber</span>
            </h1>
            <p>Gestão inteligente para barbearias</p>
          </div>
        </div>

        <nav
          className={`home-menu ${menuAberto ? "menu-aberto" : ""
            }`}
          aria-label="Menu principal"
        >
          <button onClick={() => navegarPara("inicio")}>
            Início
          </button>

          <button onClick={() => navegarPara("para-clientes")}>
            Para clientes
          </button>

          <button onClick={() => navegarPara("recursos")}>
            Recursos
          </button>

          <button onClick={() => navegarPara("como-funciona")}>
            Como funciona
          </button>

          <button onClick={() => navegarPara("planos")}>
            Planos
          </button>

          <button onClick={() => navegarPara("contato")}>
            Contato
          </button>
        </nav>

        <div className="home-header-acoes">
          <button
            type="button"
            className="botao-login-premium"
            onClick={abrirLogin}
          >
            <FaSignInAlt />
            <span>Entrar</span>
            <FaArrowRight className="login-seta" />
          </button>

          <button
            type="button"
            className="home-menu-toggle"
            aria-label={
              menuAberto ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* ======================================
          APRESENTAÇÃO PRINCIPAL
      ====================================== */}

      <main className="home-principal" id="inicio">
        <div className="home-apresentacao">

          <div className="home-selo">
            <FaCheckCircle />
            Tecnologia para sua barbearia
          </div>

          <h2>
            Sua barbearia
            <br />
            mais organizada.
            <br />
            <strong>Seu negócio crescendo.</strong>
          </h2>

          <p className="home-descricao">
            Agendamentos, profissionais, clientes
            e gestão do seu negócio em um só lugar.
            Simplifique sua rotina e tenha mais
            tempo para o que realmente importa.
          </p>

          <div className="home-botoes-principais">
            <button
              className="home-botao-comecar"
              onClick={abrirCadastro}
            >
              Sou dono de barbearia
              <FaArrowRight />
            </button>

            <button
              className="home-botao-conhecer"
              onClick={() => navegarPara("para-clientes")}
            >
              Quero agendar um corte
            </button>
          </div>

          <div className="home-beneficios-rapidos">
            <span>
              <FaCheckCircle />
              Gestão centralizada
            </span>

            <span>
              <FaCheckCircle />
              Fácil de utilizar
            </span>

            <span>
              <FaCheckCircle />
              Acesso online
            </span>
          </div>

        </div>
      </main>

      {/* ======================================
          ÁREA PARA CLIENTES
      ====================================== */}

      <section
        className="home-secao home-secao-clientes"
        id="para-clientes"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            PARA QUEM VALORIZA O ESTILO
          </span>

          <h2>
            Seu próximo corte
            <br />
            <strong>começa aqui.</strong>
          </h2>

          <p>
            Inspire-se com novos estilos,
            descubra barbearias e encontre
            profissionais para cuidar do seu visual.
          </p>
        </div>

        {/* ESTILOS DE CORTE */}

        <div className="home-grid-estilos">
          {estilos.map((estilo) => (
            <div
              className="home-card-estilo"
              key={estilo.nome}
            >
              <img
                src={estilo.imagem}
                alt={estilo.nome}
                loading="lazy"
              />

              <div className="home-card-estilo-info">
                <h3>{estilo.nome}</h3>
                <p>{estilo.descricao}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================
            BUSCA DE BARBEARIAS
        ================================== */}

        <div className="home-busca-container">
          <div className="home-busca-texto">
            <span className="home-etiqueta">
              ENCONTRE SUA BARBEARIA
            </span>

            <h3>
              Procurando um lugar para
              <strong> renovar o visual?</strong>
            </h3>

            <p>
              Pesquise estabelecimentos por nome,
              cidade ou bairro e consulte os serviços
              e preços disponíveis.
            </p>
          </div>

          <form
            className="home-form-busca"
            onSubmit={pesquisarBarbearias}
          >
            <FaSearch className="home-icone-busca" />

            <input
              type="search"
              placeholder="Nome, cidade ou bairro..."
              aria-label="Buscar barbearias"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button type="submit">
              Buscar
            </button>
          </form>
        </div>

        {/* ==================================
            BARBEARIAS EM DESTAQUE
        ================================== */}

        <div
          className="home-barbearias-area"
          id="barbearias-destaque"
        >
          <div className="home-barbearias-cabecalho">
            <div>
              <span className="home-etiqueta">
                DESCUBRA NOVOS LUGARES
              </span>

              <h3>
                Barbearias <strong>em destaque</strong>
              </h3>
            </div>

            <div className="home-localizacao">
              <FaMapMarkerAlt />
              Pesquise sua região
            </div>
          </div>

          {carregandoBarbearias ? (
            <div className="home-barbearias-vazio">
              <p>Carregando barbearias...</p>
            </div>
          ) : erroBarbearias ? (
            <div className="home-barbearias-vazio">
              <p role="alert">{erroBarbearias}</p>
            </div>
          ) : barbeariasFiltradas.length > 0 ? (

            <div className="home-grid-barbearias">
              {barbeariasFiltradas.map((barbearia) => {

                const servicos = Array.isArray(
                  barbearia.servicos
                )
                  ? barbearia.servicos.filter(
                    (servico) => servico.ativo !== false
                  )
                  : []

                const localizacao = [
                  barbearia.bairro,
                  barbearia.cidade
                ]
                  .filter(Boolean)
                  .join(" - ")

                const precosValidos = servicos
                  .map((servico) => Number(servico.preco))
                  .filter(
                    (valor) =>
                      Number.isFinite(valor) && valor >= 0
                  )

                const menorPreco =
                  precosValidos.length > 0
                    ? Math.min(...precosValidos)
                    : null

                return (
                  <article
                    className="home-card-barbearia"
                    key={barbearia.id}
                  >

                    {/* FOTO DA BARBEARIA */}

                    <div className="home-card-barbearia-capa">
                      <img
                        src={obterFotoBarbearia(barbearia)}
                        alt={`Foto da barbearia ${barbearia.nomeBarbearia || "Barbearia"
                          }`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src =
                            fotoBarbeariaPadrao
                        }}
                      />

                      <span className="home-card-barbearia-status">
                        {servicos.length > 0
                          ? "Serviços disponíveis"
                          : "Conheça a barbearia"}
                      </span>
                    </div>

                    {/* INFORMAÇÕES DO CARD */}

                    <div className="home-card-barbearia-conteudo">

                      <h4>
                        {barbearia.nomeBarbearia || "Barbearia"}
                      </h4>

                      <p className="home-card-barbearia-local">
                        <FaMapMarkerAlt />
                        {localizacao ||
                          "Localização não informada"}
                      </p>

                      <p className="home-card-barbearia-descricao">
                        Conheça os serviços oferecidos
                        por este estabelecimento.
                      </p>

                      {menorPreco !== null && (
                        <div className="home-card-barbearia-preco">
                          A partir de

                          <strong>
                            {formatarPreco(menorPreco)}
                          </strong>
                        </div>
                      )}

                      <button
                        type="button"
                        className="home-card-barbearia-botao"
                        onClick={() =>
                          selecionarBarbearia(barbearia)
                        }
                      >
                        Ver serviços e preços
                        <FaArrowRight />
                      </button>

                    </div>
                  </article>
                )
              })}
            </div>

          ) : (

            <div className="home-barbearias-vazio">
              <div className="home-vazio-icone">
                <FaStore />
              </div>

              <h4>
                {busca.trim()
                  ? "Nenhuma barbearia encontrada"
                  : "As barbearias aparecerão aqui!"}
              </h4>

              <p>
                {busca.trim()
                  ? "Tente pesquisar outro nome, cidade ou bairro."
                  : "Estamos preparando a vitrine de estabelecimentos. Em breve você poderá conhecer os serviços e preços publicados."}
              </p>

              <div className="home-avaliacoes-previa">
                <span>
                  <FaStar />
                  Avaliações futuras
                </span>

                <span>
                  <FaMapMarkerAlt />
                  Busca por região
                </span>

                <span>
                  <FaCalendarAlt />
                  Agendamentos futuros
                </span>
              </div>

              <button
                className="home-botao-conhecer"
                onClick={abrirLogin}
              >
                Já tenho uma conta
                <FaArrowRight />
              </button>
            </div>

          )}
        </div>
      </section>

      {/* ======================================
          RECURSOS
      ====================================== */}

      <section
        className="home-secao home-secao-recursos"
        id="recursos"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            RECURSOS
          </span>

          <h2>
            Tudo que sua barbearia precisa
            <br />
            <strong>em um só lugar</strong>
          </h2>

          <p>
            Ferramentas para facilitar a rotina,
            organizar sua equipe e melhorar
            a gestão do seu negócio.
          </p>
        </div>

        <div className="home-grid-recursos">
          {recursos.map((recurso, index) => (
            <div
              className="home-card-recurso"
              key={index}
            >
              <div className="home-card-icone">
                {recurso.icone}
              </div>

              <h3>{recurso.titulo}</h3>
              <p>{recurso.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================
          COMO FUNCIONA
      ====================================== */}

      <section
        className="home-secao home-secao-passos"
        id="como-funciona"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            SIMPLES DE COMEÇAR
          </span>

          <h2>
            Comece em apenas
            <strong> 3 passos</strong>
          </h2>

          <p>
            Uma experiência simples
            desde o primeiro acesso.
          </p>
        </div>

        <div className="home-grid-passos">

          <div className="home-card-passo">
            <div className="home-numero-passo">
              01
            </div>

            <h3>Crie sua conta</h3>

            <p>
              Cadastre-se como dono de barbearia
              e comece a configurar seu negócio.
            </p>
          </div>

          <div className="home-card-passo">
            <div className="home-numero-passo">
              02
            </div>

            <h3>Configure sua barbearia</h3>

            <p>
              Organize os dados e cadastre
              os profissionais conforme
              as funcionalidades disponíveis.
            </p>
          </div>

          <div className="home-card-passo">
            <div className="home-numero-passo">
              03
            </div>

            <h3>Comece a gerenciar</h3>

            <p>
              Acesse seu painel e utilize
              as ferramentas da plataforma.
            </p>
          </div>

        </div>

        <div className="home-centralizar">
          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Criar minha conta
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* ======================================
          PLANOS
      ====================================== */}

      <section
        className="home-secao home-secao-planos"
        id="planos"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            PLANOS
          </span>

          <h2>
            Uma solução para
            <strong> seu negócio</strong>
          </h2>

          <p>
            Conheça a plataforma e acompanhe
            as novidades sobre nossos planos.
          </p>
        </div>

        <div className="home-plano-card">
          <div className="home-plano-icone">
            <FaStore />
          </div>

          <h3>SaaSBarber</h3>

          <p className="home-plano-subtitulo">
            Gestão inteligente para barbearias
          </p>

          <div className="home-plano-status">
            Planos em preparação
          </div>

          <div className="home-plano-beneficios">
            <p>
              <FaCheckCircle />
              Gestão de profissionais
            </p>

            <p>
              <FaCheckCircle />
              Organização de clientes
            </p>

            <p>
              <FaCheckCircle />
              Recursos de agendamento
            </p>

            <p>
              <FaCheckCircle />
              Painéis por tipo de usuário
            </p>
          </div>

          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Conhecer a plataforma
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* ======================================
          PERGUNTAS FREQUENTES
      ====================================== */}

      <section
        className="home-secao home-secao-faq"
        id="perguntas"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">
            DÚVIDAS FREQUENTES
          </span>

          <h2>
            Perguntas <strong>frequentes</strong>
          </h2>

          <p>
            Encontre respostas para as principais
            dúvidas sobre a plataforma.
          </p>
        </div>

        <div className="home-faq-lista">
          {perguntas.map((item, index) => (
            <div
              className="home-faq-item"
              key={index}
            >
              <button
                className="home-faq-pergunta"
                aria-expanded={perguntaAberta === index}
                onClick={() =>
                  setPerguntaAberta(
                    perguntaAberta === index
                      ? null
                      : index
                  )
                }
              >
                <span>{item.pergunta}</span>

                <FaChevronDown
                  className={
                    perguntaAberta === index
                      ? "faq-icone-aberto"
                      : ""
                  }
                />
              </button>

              {perguntaAberta === index && (
                <div className="home-faq-resposta">
                  <p>{item.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================
          CHAMADA FINAL
      ====================================== */}

      <section className="home-chamada-final">
        <div>
          <span className="home-etiqueta">
            PRONTO PARA COMEÇAR?
          </span>

          <h2>
            Dê o próximo passo na
            <strong> gestão da sua barbearia</strong>
          </h2>

          <p>
            Crie sua conta e conheça
            as ferramentas do SaaSBarber.
          </p>

          <button
            className="home-botao-comecar"
            onClick={abrirCadastro}
          >
            Criar conta
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* ======================================
          RODAPÉ
      ====================================== */}

      <footer className="home-footer" id="contato">
        <div className="home-footer-conteudo">

          <div className="home-footer-marca">
            <div className="home-footer-logo">
              <FaCut />

              <h3>
                SaaS<span>Barber</span>
              </h3>
            </div>

            <p>
              Tecnologia e praticidade
              para a gestão de barbearias.
            </p>
          </div>

          <div className="home-footer-links">
            <h4>Navegação</h4>

            <button onClick={() => navegarPara("inicio")}>
              Início
            </button>

            <button
              onClick={() => navegarPara("para-clientes")}
            >
              Para clientes
            </button>

            <button onClick={() => navegarPara("recursos")}>
              Recursos
            </button>

            <button onClick={() => navegarPara("planos")}>
              Planos
            </button>
          </div>

          <div className="home-footer-links">
            <h4>Sua conta</h4>

            <button onClick={abrirLogin}>
              Fazer login
            </button>

            <button onClick={abrirCadastro}>
              Criar conta
            </button>
          </div>

          <div className="home-footer-links">
            <h4>Informações</h4>

            <p>
              Plataforma de gestão
              para barbearias.
            </p>

            <p>
              Canais oficiais de atendimento
              serão disponibilizados aqui.
            </p>
          </div>

        </div>

        <div className="home-footer-inferior">
          <p>
            © {new Date().getFullYear()} SaaSBarber.
            Todos os direitos reservados.
          </p>

          <p>
            Desenvolvido para modernizar
            a gestão de barbearias.
          </p>
        </div>
      </footer>

      {/* ======================================
          MODAL DE SERVIÇOS E PREÇOS
      ====================================== */}

      {barbeariaSelecionada && (
        <div
          className="home-modal-fundo"
          onClick={() => setBarbeariaSelecionada(null)}
        >
          <section
            className="home-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Serviços e preços da barbearia"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="home-modal-fechar"
              aria-label="Fechar"
              onClick={() =>
                setBarbeariaSelecionada(null)
              }
            >
              <FaTimes />
            </button>

            <span className="home-etiqueta">
              SERVIÇOS E PREÇOS
            </span>

            <h2>
              {barbeariaSelecionada.nomeBarbearia}
            </h2>

            <p className="home-modal-local">
              <FaMapMarkerAlt />

              {[
                barbeariaSelecionada.bairro,
                barbeariaSelecionada.cidade
              ]
                .filter(Boolean)
                .join(" - ") ||
                "Localização não informada"}
            </p>

            <div className="home-modal-servicos">
              {Array.isArray(
                barbeariaSelecionada.servicos
              ) &&
                barbeariaSelecionada.servicos.filter(
                  (servico) => servico.ativo !== false
                ).length > 0 ? (

                barbeariaSelecionada.servicos
                  .filter(
                    (servico) =>
                      servico.ativo !== false
                  )
                  .map((servico, index) => (
                    <div
                      className="home-modal-servico"
                      key={servico.id || index}
                    >
                      <div>
                        <h3>{servico.nome}</h3>

                        <p>
                          <FaClock />
                          {servico.duracao} minutos
                        </p>
                      </div>

                      <strong>
                        {formatarPreco(servico.preco)}
                      </strong>
                    </div>
                  ))

              ) : (
                <p>
                  Esta barbearia ainda não publicou
                  serviços e preços.
                </p>
              )}
            </div>

            <div className="home-modal-rodape">
              <p>
                O agendamento online será disponibilizado
                em uma próxima etapa.
              </p>

              <button
                type="button"
                className="home-botao-comecar"
                onClick={() => {
                  setBarbeariaSelecionada(null)
                  abrirLogin()
                }}
              >
                Entrar na minha conta
                <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
}

export default Home
