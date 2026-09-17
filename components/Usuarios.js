"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { C } from "@/lib/theme";

export default function Usuarios({ usuarios, currentUser, onAtualizar }) {
  const [novo, setNovo] = useState({ nome: "", usuario: "", senha: "", papel: "funcionario" });
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  const adicionar = async () => {
    if (!novo.nome || !novo.usuario || !novo.senha) return;
    setErro("");
    const res = await fetch("/api/usuarios", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.erro || "Não foi possível criar o usuário."); return; }
    setNovo({ nome: "", usuario: "", senha: "", papel: "funcionario" });
    onAtualizar();
  };
  const excluir = async (id) => {
    if (id === currentUser.id) return;
    setErro("");
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); setErro(d.erro || "Não foi possível excluir."); setConfirmarExclusao(null); return; }
    setConfirmarExclusao(null);
    onAtualizar();
  };

  return (
    <div className="space-y-4">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4 max-w-lg">
        <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Novo usuário</h3>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Nome" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none col-span-2" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <input placeholder="Login" value={novo.usuario} onChange={(e) => setNovo({ ...novo, usuario: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <input placeholder="Senha" value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <select value={novo.papel} onChange={(e) => setNovo({ ...novo, papel: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none col-span-2" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
            <option value="funcionario">Funcionário (só vê o caixa/vendas)</option>
            <option value="admin">Administrador (acesso total)</option>
          </select>
        </div>
        {erro && <p className="text-sm mt-2" style={{ color: C.berry }}>{erro}</p>}
        <button onClick={adicionar} style={{ background: C.primary }} className="mt-3 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5">
          <Plus size={15} /> Criar usuário
        </button>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl overflow-hidden max-w-lg">
        {usuarios.map((u) => (
          <div key={u.id} style={{ borderTop: `1px solid ${C.border}` }} className="p-3 flex items-center justify-between text-sm first:border-t-0">
            <div>
              <p style={{ color: C.ink }}>{u.nome} <span style={{ color: C.inkSoft }}>({u.usuario})</span></p>
              <span style={{ background: u.papel === "admin" ? C.primarySoft : C.mangoSoft, color: u.papel === "admin" ? C.primaryDark : "#7A4A18" }} className="text-[11px] px-2 py-0.5 rounded-full">
                {u.papel === "admin" ? "Administrador" : "Funcionário"}
              </span>
            </div>
            {u.id !== currentUser.id && (
              confirmarExclusao === u.id ? (
                <button onClick={() => excluir(u.id)} className="text-xs" style={{ color: C.berry }}>Confirmar?</button>
              ) : (
                <button onClick={() => setConfirmarExclusao(u.id)} style={{ color: C.inkSoft }}><Trash2 size={14} /></button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
