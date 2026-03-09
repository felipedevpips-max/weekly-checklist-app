function getTechs(req, res) {
  res.json([
    {
      id: 1,
      name: "React",
      description: "Biblioteca para construção de interfaces",
      icon: "react.svg",
    },
    {
      id: 2,
      name: "TypeScript",
      description: "Superset do JavaScript com tipagem estática",
      icon: "typescript.svg",
    },
    {
      id: 3,
      name: "Node.js",
      description: "Ambiente de execução JavaScript no servidor",
      icon: "nodejs.svg",
    },
    {
      id: 4,
      name: "Express",
      description: "Framework minimalista para APIs Node",
      icon: "express.svg",
    },
    {
      id: 5,
      name: "PostgreSQL",
      description: "Banco de dados relacional utilizado no projeto",
      icon: "postgresql.svg",
    },
    {
      id: 6,
      name: "Axios",
      description: "Cliente HTTP usado para comunicação com a API",
      icon: "axios.svg",
    },
    {
      id: 7,
      name: "React Router",
      description: "Gerenciamento de rotas no frontend",
      icon: "reactrouter.svg",
    },
    {
      id: 7,
      name: "Docker",
      description: "Ambiente de Desenvolvimento",
      icon: "docker.svg",
    },
  ]);
}

module.exports = { getTechs };