
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, secondaryAuth } from "../fireBaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "firebase/firestore";
import {
    FaArrowLeft,
    FaCut,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaCheck,
    FaPlus
} from "react-icons/fa";
import "./CadastrarBarbeiro.css";

const OPCOES_ESPECIALIDADE = [
    "Corte masculino",
    "Barba",
    "Degradê",
    "Corte infantil",
    "Pezinho",
    "Pigmentação",
    "Sobrancelha",
    "Nevou"
];

const CadastrarBarbeiro = ({ voltarPainel }) => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [especialidades, setEspecialidades] = useState([]);
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const alternarEspecialidade = (opcao) => {
        setEspecialidades((atuais) =>
            atuais.includes(opcao)
                ? atuais.filter((item) => item !== opcao)
                : [...atuais, opcao]
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (especialidades.length === 0) {
            alert("Selecione pelo menos uma especialidade.");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não são iguais.");
            return;
        }

        if (senha.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        try {
            setCarregando(true);

            const donoId = auth.currentUser?.uid;

            if (!donoId) {
                alert("Nenhum proprietário está logado.");
                return;
            }

            const consultaBarbearia = query(
                collection(db, "barbearias"),
                where("donoId", "==", donoId)
            );

            const resultadoBarbearia = await getDocs(consultaBarbearia);

            if (resultadoBarbearia.empty) {
                alert("Barbearia do proprietário não encontrada.");
                return;
            }

            const barbeariaId = resultadoBarbearia.docs[0].id;

            const usuarioCriado = await createUserWithEmailAndPassword(
                secondaryAuth,
                email.trim(),
                senha
            );

            await addDoc(collection(db, "barbeiros"), {
                nome: nome.trim(),
                email: email.trim(),
                telefone: telefone.trim(),
                especialidade: especialidades.join(", "),
                especialidades,
                usuarioId: usuarioCriado.user.uid,
                tipoUsuario: "barbeiro",
                donoId,
                barbeariaId
            });

            alert("Acesso do barbeiro criado com sucesso!");

            setNome("");
            setEmail("");
            setTelefone("");
            setEspecialidades([]);
            setSenha("");
            setConfirmarSenha("");

        } catch (erro) {
            console.error("Erro ao cadastrar barbeiro:", erro);

            if (erro.code === "auth/email-already-in-use") {
                alert("Este e-mail já está cadastrado.");
            } else if (erro.code === "auth/invalid-email") {
                alert("Digite um e-mail válido.");
            } else if (erro.code === "auth/weak-password") {
                alert("A senha é muito fraca. Use pelo menos 6 caracteres.");
            } else {
                alert(
                    "Não foi possível cadastrar o barbeiro. Verifique os dados e tente novamente."
                );
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="cadastro-barbeiro-page">
            <div className="cadastro-barbeiro-container">

                <header className="cadastro-barbeiro-topo">
                    <div className="cadastro-barbeiro-titulo">
                        <span className="cadastro-barbeiro-subtitulo">
                            SAASBARBER / PROPRIETÁRIO
                        </span>

                        <h1>Cadastrar barbeiro</h1>

                        <p>
                            Crie o acesso de um novo profissional para sua equipe.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="botao-voltar"
                        onClick={voltarPainel}
                    >
                        <FaArrowLeft />
                        Voltar ao painel
                    </button>
                </header>

                <section className="cadastro-barbeiro-conteudo">

                    <div className="cadastro-barbeiro-introducao">
                        <div className="cadastro-barbeiro-icone-principal">
                            <FaCut />
                        </div>

                        <div>
                            <span className="cadastro-barbeiro-etiqueta">
                                NOVO PROFISSIONAL
                            </span>

                            <h2>Dados do barbeiro</h2>

                            <p>
                                Preencha os dados e selecione as especialidades
                                que ele oferece.
                            </p>
                        </div>
                    </div>

                    <form
                        className="form-barbeiro"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-barbeiro-grid">

                            <div className="campo-barbeiro">
                                <label htmlFor="nome-barbeiro">
                                    <FaUser />
                                    Nome completo
                                </label>

                                <input
                                    id="nome-barbeiro"
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="campo-barbeiro">
                                <label htmlFor="email-barbeiro">
                                    <FaEnvelope />
                                    E-mail
                                </label>

                                <input
                                    id="email-barbeiro"
                                    type="email"
                                    placeholder="barbeiro@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="campo-barbeiro campo-barbeiro-largura">
                                <label htmlFor="telefone-barbeiro">
                                    <FaPhone />
                                    Telefone
                                </label>

                                <input
                                    id="telefone-barbeiro"
                                    type="tel"
                                    placeholder="(47) 99999-9999"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    autoComplete="tel"
                                    required
                                />
                            </div>

                        </div>

                        <div className="campo-barbeiro campo-especialidades">
                            <div className="especialidades-cabecalho">
                                <div>
                                    <label>
                                        <FaCut />
                                        Especialidades
                                    </label>

                                    <p>
                                        Selecione todas as opções que se aplicam.
                                    </p>
                                </div>

                                <span className="especialidades-contador">
                                    {especialidades.length} selecionada(s)
                                </span>
                            </div>

                            <div
                                className="especialidades-pills"
                                role="group"
                                aria-label="Selecionar especialidades do barbeiro"
                            >
                                {OPCOES_ESPECIALIDADE.map((opcao) => {
                                    const selecionada =
                                        especialidades.includes(opcao);

                                    return (
                                        <button
                                            key={opcao}
                                            type="button"
                                            className={`especialidade-pill ${
                                                selecionada ? "selecionada" : ""
                                            }`}
                                            aria-pressed={selecionada}
                                            onClick={() =>
                                                alternarEspecialidade(opcao)
                                            }
                                        >
                                            {selecionada ? (
                                                <FaCheck />
                                            ) : (
                                                <FaPlus />
                                            )}

                                            {opcao}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-barbeiro-grid">

                            <div className="campo-barbeiro">
                                <label htmlFor="senha-barbeiro">
                                    <FaLock />
                                    Senha de acesso
                                </label>

                                <input
                                    id="senha-barbeiro"
                                    type="password"
                                    placeholder="Mínimo de 6 caracteres"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="campo-barbeiro">
                                <label htmlFor="confirmar-senha-barbeiro">
                                    <FaLock />
                                    Confirmar senha
                                </label>

                                <input
                                    id="confirmar-senha-barbeiro"
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={confirmarSenha}
                                    onChange={(e) =>
                                        setConfirmarSenha(e.target.value)
                                    }
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                            </div>

                        </div>

                        <div className="cadastro-barbeiro-acoes">
                            <button
                                type="button"
                                className="botao-cancelar-barbeiro"
                                onClick={voltarPainel}
                                disabled={carregando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="botao-cadastrar-barbeiro"
                                disabled={carregando}
                            >
                                <FaCheck />
                                {carregando
                                    ? "Cadastrando..."
                                    : "Cadastrar barbeiro"}
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="cadastro-barbeiro-rodape">
                    SaaSBarber · Gestão inteligente da sua barbearia
                </footer>
            </div>
        </main>
    );
};

export default CadastrarBarbeiro;
