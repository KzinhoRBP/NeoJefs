document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = e.target.nome.value;
  const email = e.target.email.value;
  const senha = e.target.senha.value;

  const response = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  const result = await response.json();

  if (response.ok) {
    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html"; // Redireciona para login
  } else {
    alert(result.erro || "Erro ao cadastrar");
  }
});
