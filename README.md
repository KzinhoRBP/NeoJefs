# 🤖 NeoJefs – Chatbot Inteligente com Node.js + OpenAI + Banco de Dados

**NeoJefs é um assistente virtual inteligente desenvolvido como projeto de TCC na ETEC de Botucatu. Ele possui integração com a API GPT-4o da OpenAI, coleta dados de clima via OpenWeather e notícias via NewsData.io. O projeto inclui interface moderna em HTML/CSS, backend em Node.js (Express) e um banco de dados SQLite com autenticação de usuários.**

---

# ✅ Requisitos do Sistema

- Node.js (versão LTS) → [https://nodejs.org](https://nodejs.org)
- Navegador atualizado (Chrome, Firefox, Edge, etc.)
- Acesso à internet (para uso das APIs)
- Editor de código (VS Code recomendado)
- Git (opcional para versionamento)

---

# 📦 Tecnologias Utilizadas

| Tecnologia      | Descrição                                                                 |
|----------------|---------------------------------------------------------------------------|
| Node.js         | Ambiente de execução JavaScript no backend                               |
| Express         | Framework para criar servidor HTTP simples e rápido                      |
| SQLite          | Banco de dados local, leve e fácil de usar                               |
| HTML/CSS/JS     | Interface do usuário moderna e responsiva                                |
| OpenAI GPT-4o   | Inteligência artificial para interpretar e responder às mensagens         |
| OpenWeatherMap  | Consulta de clima em tempo real                                           |
| NewsData.io     | Consulta de notícias recentes do Brasil                                  |

---

# 🔐 Criação das Chaves de API

O projeto utiliza três serviços externos. Você precisará criar contas e gerar suas chaves:

| Serviço          | Link para gerar a chave                                                   |
|------------------|---------------------------------------------------------------------------|
| OpenAI           | [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) |
| OpenWeatherMap   | [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)         |
| NewsData.io      | [https://newsdata.io/register](https://newsdata.io/register)                             |

**Crie um arquivo `.env` chamado `apikey.env` dentro da pasta `server/` com o seguinte conteúdo:**

OPENAI_API_KEY=coloque_sua_chave_aqui
OPENWEATHER_API_KEY=coloque_sua_chave_aqui
NEWSDATA_API_KEY=coloque_sua_chave_aqui

⚠️ **Nunca compartilhe esse arquivo publicamente** e certifique-se de adicioná-lo ao `.gitignore` se usar GitHub.


# 🛠️ Instalação e Execução do Projeto

# 1. Baixar ou clonar o repositório

git clone https://github.com/seu-usuario/neojefs.git

# 2. Acessar a pasta do projeto

cd C:\Users\User\Documents\TCC\NeoJefs

# 3. Instalar as dependências

npm install express dotenv openai cors sqlite3

# 4. Criar o banco de dados (automático)

O banco banco.db será criado automaticamente ao rodar o servidor.

# 5. Iniciar o servidor

npm start (node.js)

Se estiver tudo certo, verá a mensagem:

✅ Servidor rodando em http://localhost:3000

# 6. Acessar o projeto

Abra no navegador:
http://localhost:3000

👤 **Funcionalidades Principais**

Chat Inteligente: IA responde perguntas diversas com bom humor e informação.
Consulta de Clima: Digite “Como está o clima em [cidade]?” para obter a previsão.
Últimas Notícias: Pergunte sobre “notícias” ou “atualidades” e receba respostas atualizadas.
Sistema de Login e Cadastro: Registre-se e faça login para ter uma experiência personalizada.
Reconhecimento de voz: Use o microfone para enviar mensagens por fala.

📋 **Exemplos de Uso**

"Como está o clima em Botucatu?"
"Quem é o presidente atual do Brasil?"
"Me fale as últimas notícias."
"O que você pode fazer, NeoJefs?"

🧠 **Detalhes da IA**
A IA é configurada com:

model: 'o4-mini',
messages: contextMessages,
max_completion_tokens: 1500

Isso garante respostas equilibradas, informativas e personalizadas com base no prompt pré-programado, que inclui contexto e instruções específicas sobre comportamento.

🛑 **Como parar o servidor**

No terminal, pressione:
CTRL + C ou só feche o terminal

📢 **Observações Finais**

O projeto não armazena o histórico de conversas.
As senhas dos usuários não estão criptografadas (por simplicidade e fins didáticos).
Em produção real, seria necessário usar HTTPS, hashing de senhas (bcrypt), JWT para autenticação e deploy em nuvem.

👨‍💻 **Autor**
Khaled Pereira
Técnico em Desenvolvimento de Sistemas
ETEC Dr. Domingos Minicucci Filho – Botucatu/SP
Ano: 2025

📜 **Licença**
Este projeto é didático e faz parte de um Trabalho de Conclusão de Curso. Pode ser utilizado livremente para fins educacionais.
