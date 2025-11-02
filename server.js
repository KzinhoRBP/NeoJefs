//Importação de módulos principais
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { OpenAI } from 'openai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Configuração de ambiente e caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, './apikey.env') });

// Inicialização das APIs externas (substitua no arquivo .env pela sua chave de api)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

// Configuração do servidor Express
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicialização do banco SQLite
let db;
const initDB = async () => {
  db = await open({
    filename: path.join(__dirname, 'banco.db'),
    driver: sqlite3.Database
  });

  // Cria tabela de usuários, caso não exista
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    );
  `);
};
initDB();

// Rota principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cadastro de usuários
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await db.run(`INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`, [nome, email, senha]);
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ erro: "E-mail já cadastrado." });
    } else {
      console.error("Erro no cadastro:", err);
      res.status(500).json({ erro: "Erro interno ao cadastrar." });
    }
  }
});

// Login de usuário
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await db.get(`SELECT * FROM usuarios WHERE email = ? AND senha = ?`, [email, senha]);
    if (usuario) {
      res.json({ mensagem: "Login realizado com sucesso!", nome: usuario.nome });
    } else {
      res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno ao fazer login." });
  }
});

// Função auxiliar: busca notícias recentes
async function buscarNoticiasRecentes() {
  try {
    const response = await fetch(`https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}`);
    const data = await response.json();
    if (!data || !data.results) return null;

    // Formata até 5 notícias
    return data.results
      .slice(0, 5)
      .map(n => `- ${n.title} (${n.pubDate ? n.pubDate.split('T')[0] : 'sem data'})`)
      .join('\n');
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return null;
  }
}

// Armazena histórico de conversas (memória temporária)
const chatSessions = {};

// Rota de chat principal
app.post('/chat', async (req, res) => {
  const { message, userEmail } = req.body;

  // Evita requisições vazias
  if (!message) return res.json({ reply: "Por favor, envie uma mensagem para eu responder." });

  // Cria ID de sessão (email ou 'anon')
  const sessionId = userEmail || 'anon';

  // Cria histórico se não existir
  if (!chatSessions[sessionId]) chatSessions[sessionId] = [];

  // Adiciona a nova mensagem do usuário ao histórico
  chatSessions[sessionId].push({ role: 'user', content: message });

  // Mantém apenas as últimas 8 mensagens (4 trocas completas)
  chatSessions[sessionId] = chatSessions[sessionId].slice(-8);

  // Captura data/hora para mensagens contextuais
  const agora = new Date();
  const dataBrasil = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const horaBrasil = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  try {
    const userInput = message.trim().toLowerCase();

    // Respostas simples: data/hora
    if (/(que\s+dia|data\s+de\s+hoje|hoje\s+é)/i.test(userInput))
      return res.json({ reply: `📅 Hoje é ${dataBrasil}.` });

    if (/(que\s+horas|hora\s+atual|agora\s+são)/i.test(userInput))
      return res.json({ reply: `⏰ Agora são ${horaBrasil} (horário de Brasília).` });

    // Detecta pedidos sobre clima
    const climaRegex = /(?:clima|tempo|previsão).*?em\s+([a-zA-ZÀ-ú\s]+)/i;
    const match = message.match(climaRegex);
    if (match) {
      const city = match[1].replace(/hoje|agora/gi, '').trim();
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

      const weatherResponse = await fetch(url);
      if (!weatherResponse.ok) return res.json({ reply: `Não consegui encontrar o clima para "${city}".` });

      const weatherData = await weatherResponse.json();
      const temp = weatherData.main.temp;
      const desc = weatherData.weather[0].description;
      const humidity = weatherData.main.humidity;

      return res.json({ reply: `🌤️ O clima em ${city} está ${desc} com ${temp}°C e umidade de ${humidity}%.` });
    }

    // Detecta pedidos de notícias
    let noticiasContexto = '';
    if (/not[ií]cias|últimas|jornal|aconteceu|novidade/i.test(userInput)) {
      const noticias = await buscarNoticiasRecentes();
      if (noticias) noticiasContexto = `📰 Aqui estão algumas notícias recentes (${dataBrasil}):\n${noticias}`;
    }

    // System Prompt (contexto fixo + histórico)
    const systemPrompt = `
Você é o NeoJefs, assistente virtual simpático, educativo e moderno criado como TCC por Khaled Pereira (ETEC Botucatu - 2025).
Regras:
- Seja descontraído e educativo 😄
- Use linguagem natural e jovem
${noticiasContexto ? '\n' + noticiasContexto : ''}
    `.trim();

    // Cria contexto com histórico + nova pergunta
    const contextMessages = [
      { role: 'system', content: systemPrompt },
      ...chatSessions[sessionId],
      { role: 'user', content: message }
    ];

    // Chamada à OpenAI
    const response = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: contextMessages,
      max_completion_tokens: 1500
    });

    let botReply = "Desculpe, não consegui responder agora.";
    if (response?.choices?.[0]?.message?.content)
      botReply = response.choices[0].message.content.trim();

    // Salva resposta no histórico
    chatSessions[sessionId].push({ role: 'assistant', content: botReply });
    chatSessions[sessionId] = chatSessions[sessionId].slice(-8);

    // Retorna resposta
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    res.json({ reply: "Ops, algo deu errado ao gerar a resposta." });
  }
});

// Inicializa servidor
app.listen(port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
