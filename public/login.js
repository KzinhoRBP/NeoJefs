document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const senha = e.target.senha.value;

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const result = await response.json();

  if (response.ok) {
    alert("Login bem-sucedido!");
    window.location.href = "index.html"; // Redireciona para o chat
  } else {
    alert(result.erro || "Erro ao fazer login");
  }
});
