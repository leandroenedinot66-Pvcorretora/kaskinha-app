"use client";
import { useState } from "react";
import { User, Lock, AlertTriangle } from "lucide-react";
import { C } from "@/lib/theme";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Não foi possível entrar.");
        return;
      }
      onLogin(data.usuario);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-6 fnt-body">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="w-full max-w-sm rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div style={{ background: C.primarySoft }} className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            <img src="/logo.png" alt="Kaskinha" className="w-full h-full object-cover" />
          </div>
          <h1 className="fnt-display text-xl font-semibold" style={{ color: C.ink }}>Kaskinha</h1>
          <p className="text-sm" style={{ color: C.inkSoft }}>Entre com seu usuário e senha</p>
        </div>

        <form onSubmit={entrar} className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: C.inkSoft }}>Usuário</label>
            <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl" style={{ border: `1px solid ${C.border}` }}>
              <User size={16} color={C.inkSoft} />
              <input value={usuario} onChange={(e) => setUsuario(e.target.value)}
                className="w-full outline-none bg-transparent text-sm" style={{ color: C.ink }}
                placeholder="ex: admin" autoFocus />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.inkSoft }}>Senha</label>
            <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl" style={{ border: `1px solid ${C.border}` }}>
              <Lock size={16} color={C.inkSoft} />
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                className="w-full outline-none bg-transparent text-sm" style={{ color: C.ink }}
                placeholder="••••••••" />
            </div>
          </div>

          {erro && (
            <p style={{ color: C.berry }} className="text-sm flex items-center gap-1">
              <AlertTriangle size={14} /> {erro}
            </p>
          )}

          <button type="submit" disabled={carregando} style={{ background: C.primary }}
            className="w-full text-white rounded-xl py-2.5 font-medium text-sm mt-2 hover:opacity-90 transition disabled:opacity-60">
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-center mt-5" style={{ color: C.inkSoft }}>
          Acesso inicial: <b>admin</b> / <b>admin123</b> — troque a senha depois de entrar.
        </p>
      </div>
    </div>
  );
}
