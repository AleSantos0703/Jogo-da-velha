export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 45%, #cbd5e1 100%)",
        padding: "24px"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          padding: "28px"
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "28px",
            color: "#0f172a"
          }}
        >
          Entrar
        </h1>
        <p style={{ margin: "0 0 24px", color: "#475569" }}>
          Modelo de tela de login (nao funcional).
        </p>

        <form onSubmit={(event) => event.preventDefault()}>
          <label
            htmlFor="email"
            style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "16px",
              fontSize: "15px"
            }}
          />

          <label
            htmlFor="senha"
            style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}
          >
            Senha
          </label>
          <input
            id="senha"
            type="password"
            placeholder="********"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "20px",
              fontSize: "15px"
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "12px 14px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
