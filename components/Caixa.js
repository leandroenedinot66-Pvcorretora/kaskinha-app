"use client";
import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { C } from "@/lib/theme";

const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Caixa({ isAdmin, caixaAberto, caixas, vendas, nomeUsuario, onAtualizar }) {
  const [valorInicial, setValorInicial] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");
  const [enviando, setEnviando] = useState(false);

  const vendasDoCaixa = caixaAberto ? vendas.filter((v) => v.caixa_id === caixaAberto.id) : [];
  const totalVendasCaixa = vendasDoCaixa.reduce((s, v) => s + v.total, 0);
  const dinheiroEsperado = caixaAberto
    ? Number(caixaAberto.valor_inicial) + vendasDoCaixa.filter((v) => v.forma_pagamento === "Dinheiro").reduce((s, v) => s + v.total, 0)
    : 0;

  const historico = [...caixas].sort((a, b) => new Date(b.aberto_em) - new Date(a.aberto_em));

  const abrir = async () => {
    setEnviando(true);
    try {
      await fetch("/api/caixas/abrir", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorInicial: Number(valorInicial) || 0, abertoPor: nomeUsuario }),
      });
      setValorInicial("");
      onAtualizar();
    } finally {
      setEnviando(false);
    }
  };
  const fechar = async () => {
    setEnviando(true);
    try {
      await fetch("/api/caixas/fechar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caixaId: caixaAberto.id, valorInformado: Number(valorFechamento) || 0, fechadoPor: nomeUsuario }),
      });
      setValorFechamento("");
      onAtualizar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      {!caixaAberto ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5 max-w-sm">
          <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Abrir caixa</h3>
          <label className="text-xs" style={{ color: C.inkSoft }}>Valor inicial (troco)</label>
          <input type="number" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)}
            className="w-full mt-1 mb-3 px-3 py-2 rounded-xl outline-none text-sm" style={{ border: `1px solid ${C.border}`, color: C.ink }}
            placeholder="0,00" />
          <button onClick={abrir} disabled={enviando} style={{ background: C.primary }}
            className="w-full text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60">
            {enviando ? "Abrindo..." : "Abrir caixa"}
          </button>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5 max-w-sm">
          <h3 className="fnt-display font-semibold mb-1 flex items-center gap-2" style={{ color: C.ink }}>
            <ArrowUpCircle size={17} color={C.primary} /> Caixa aberto
          </h3>
          <p className="text-xs mb-3" style={{ color: C.inkSoft }}>
            Aberto por {caixaAberto.aberto_por} às {new Date(caixaAberto.aberto_em).toLocaleTimeString("pt-BR")}
          </p>
          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between"><span style={{ color: C.inkSoft }}>Valor inicial</span><span style={{ color: C.ink }}>{money(caixaAberto.valor_inicial)}</span></div>
            <div className="flex justify-between"><span style={{ color: C.inkSoft }}>Vendas no caixa</span><span style={{ color: C.ink }}>{vendasDoCaixa.length}</span></div>
            <div className="flex justify-between"><span style={{ color: C.inkSoft }}>Total vendido</span><span style={{ color: C.ink }}>{money(totalVendasCaixa)}</span></div>
            <div className="flex justify-between font-medium"><span style={{ color: C.inkSoft }}>Dinheiro esperado</span><span style={{ color: C.primaryDark }}>{money(dinheiroEsperado)}</span></div>
          </div>
          <label className="text-xs" style={{ color: C.inkSoft }}>Valor contado ao fechar</label>
          <input type="number" value={valorFechamento} onChange={(e) => setValorFechamento(e.target.value)}
            className="w-full mt-1 mb-3 px-3 py-2 rounded-xl outline-none text-sm" style={{ border: `1px solid ${C.border}`, color: C.ink }}
            placeholder="0,00" />
          <button onClick={fechar} disabled={enviando} style={{ background: C.berry }}
            className="w-full text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60">
            <ArrowDownCircle size={16} /> {enviando ? "Fechando..." : "Fechar caixa"}
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
          <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Histórico de caixas</h3>
          <div className="space-y-2">
            {historico.length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>Nenhum caixa registrado ainda.</p>}
            {historico.map((c) => {
              const vs = vendas.filter((v) => v.caixa_id === c.id);
              const tv = vs.reduce((s, v) => s + v.total, 0);
              return (
                <div key={c.id} style={{ borderTop: `1px solid ${C.border}` }} className="pt-2 text-sm flex items-center justify-between">
                  <div>
                    <p style={{ color: C.ink }}>{new Date(c.aberto_em).toLocaleDateString("pt-BR")} — {c.aberto_por}</p>
                    <p style={{ color: C.inkSoft }} className="text-xs">
                      {c.status === "aberto" ? "em aberto" : `fechado às ${new Date(c.fechado_em).toLocaleTimeString("pt-BR")}`} · {vs.length} vendas
                    </p>
                  </div>
                  <span className="font-medium" style={{ color: C.primaryDark }}>{money(tv)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
