// Seletores principais
const micBtn  = document.getElementById("microphone-btn");
const userIn  = document.getElementById("user-question");
const sendBtn = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");

const voiceToggle    = document.getElementById("voice-toggle");
const contrastToggle = document.getElementById("contrast-toggle");
const themeToggle    = document.getElementById("theme-toggle");

// Estados globais 
let voiceEnabled   = false;  // leitura em voz
let contrasteAtivo = false;  // alto contraste
let temaClaro      = false;  // modo claro

// Alternador de classes (modo visual)
function setMode(className, on) {
  document.body.classList.toggle(className, on);
  document.documentElement.classList.toggle(className, on);
}

// Envio de mensagem (usuário -> servidor)
async function sendMessage() {
  const text = userIn.value.trim();
  if (!text) return;

  appendUserMessage(text);
  userIn.value = "";

  // Mostra indicador "digitando..."
  const botTyping = document.createElement("div");
  botTyping.classList.add("typing");
  chatBox.appendChild(botTyping);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // Envia a mensagem ao backend
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        userEmail: localStorage.getItem("userEmail") || "anon"
      }),
    });

    const data = await response.json();
    botTyping.remove();

    if (data.reply) appendBotMessage(data.reply);
    else appendBotMessage("Resposta inválida da IA.");
  } catch (err) {
    botTyping.remove();
    appendBotMessage("Erro ao conectar com o servidor.");
    console.error(err);
  }
}

// Eventos de envio
sendBtn.addEventListener("click", sendMessage);
userIn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Reconhecimento de voz
if ("webkitSpeechRecognition" in window) {
  const recog = new webkitSpeechRecognition();
  recog.lang = "pt-BR";
  recog.continuous = false;
  recog.interimResults = false;

  micBtn.addEventListener("click", () => recog.start());
  recog.onresult = e => userIn.value = e.results[0][0].transcript;
  recog.onerror = e => console.error("Erro de voz:", e.error);
}

// Mensagens
function appendUserMessage(msg) {
  const el = document.createElement("div");
  el.className = "user-message";
  el.textContent = msg;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotMessage(msg) {
  const el = document.createElement("div");
  el.className = "bot-message";
  el.textContent = msg;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (voiceEnabled) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(msg);
    utter.lang = "pt-BR";
    synth.speak(utter);
  }
}

// Acessibilidade
voiceToggle.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.setAttribute("aria-pressed", String(voiceEnabled));
  voiceToggle.style.opacity = voiceEnabled ? "1" : "0.5";
});

contrastToggle.addEventListener("click", () => {
  if (temaClaro) return;
  contrasteAtivo = !contrasteAtivo;
  setMode("high-contrast", contrasteAtivo);
  contrastToggle.querySelector("img").src =
    contrasteAtivo ? "img/olho-aberto.png" : "img/olho-fechado.png";
  themeToggle.disabled = contrasteAtivo;
});

themeToggle.addEventListener("click", () => {
  if (contrasteAtivo) return;
  temaClaro = !temaClaro;
  setMode("light-mode", temaClaro);
  themeToggle.querySelector("img").src =
    temaClaro ? "img/modo-claro.png" : "img/modo-escuro.png";
  contrastToggle.disabled = temaClaro;
});
