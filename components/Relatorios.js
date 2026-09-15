"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarRange } from "lucide-react";
import { C } from "@/lib/theme";

const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Relatorios({ produtos, vendasTotalHistorico }) {
  const hoje = todayStr();
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [vendasPeriodo, setVendasPeriodo] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    fetch(`/api/vendas?inicio=${dataInicio}&fim=${dataFim}`)
      .then((r) => r.json())
      .then((d) => setVendasPeriodo(d.vendas || []))
      .finally(() => setCarregando(false));
  }, [dataInicio, dataFim]);

  const aplicarAtalho = (dias) => {
    if (dias === "tudo") { setDataInicio("2020-01-01"); setDataFim(hoje); return; }
    if (dias === "mes") { setDataInicio(hoje.slice(0, 8) + "01"); setDataFim(hoje); return; }
    const d = new Date();
    d.setDate(d.getDate() - dias);
    setDataInicio(d.toISOString().slice(0, 10));
    setDataFim(hoje);
  };

  const totalPeriodo = vendasPeriodo.reduce((s, v) => s + v.total, 0);
  const baixoEstoque = produtos.filter((p) => p.estoque <= p.estoque_min);
  const rotuloPeriodo = dataInicio === hoje && dataFim === hoje ? "hoje" : "no período";

  const porFormaPagamento = useMemo(() => {
    const m = {};
    vendasPeriodo.forEach((v) => { m[v.forma_pagamento] = (m[v.forma_pagamento] || 0) + v.total; });
    return m;
  }, [vendasPeriodo]);

  const ultimasVendas = [...vendasPeriodo].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 30);

  return (
    <div className="space-y-4">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
        <h3 className="fnt-display font-semibold mb-3 flex items-center gap-1.5" style={{ color: C.ink }}>
          <CalendarRange size={17} /> Período
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {[["Hoje", 0], ["7 dias", 7], ["30 dias", 30], ["Este mês", "mes"], ["Tudo", "tudo"]].map(([label, val]) => (
            <button key={label} onClick={() => aplicarAtalho(val)}
              style={{ border: `1px solid ${C.border}`, color: C.inkSoft }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium">
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label className="text-xs block mb-1" style={{ color: C.inkSoft }}>De</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.inkSoft }}>Até</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label={`Vendas ${rotuloPeriodo}`} value={carregando ? "…" : vendasPeriodo.length} />
        <Kpi label={`Faturado ${rotuloPeriodo}`} value={carregando ? "…" : money(totalPeriodo)} />
        <Kpi label="Faturado total" value={money(vendasTotalHistorico)} />
        <Kpi label="Itens em baixa" value={baixoEstoque.length} destaque={baixoEstoque.length > 0} />
      </div>

      {baixoEstoque.length > 0 && (
        <div style={{ background: C.berrySoft, border: `1px solid ${C.berry}44` }} className="rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: C.berry }}>
            <AlertTriangle size={16} /> Estoque baixo
          </h3>
          <ul className="text-sm space-y-1">
            {baixoEstoque.map((p) => (
              <li key={p.id} style={{ color: C.ink }}>{p.nome} — restam {p.estoque}{p.unidade === "kg" ? "kg" : " un"}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
        <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Recebido {rotuloPeriodo} por forma de pagamento</h3>
        {Object.keys(porFormaPagamento).length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>Nenhuma venda no período selecionado.</p>}
        <div className="space-y-1.5">
          {Object.entries(porFormaPagamento).map(([forma, valor]) => (
            <div key={forma} className="flex justify-between text-sm">
              <span style={{ color: C.inkSoft }}>{forma}</span>
              <span style={{ color: C.ink }} className="font-medium">{money(valor)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
        <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Vendas no período</h3>
        <div className="space-y-2">
          {ultimasVendas.length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>Nenhuma venda no período selecionado.</p>}
          {ultimasVendas.map((v) => (
            <div key={v.id} style={{ borderTop: `1px solid ${C.border}` }} className="pt-2 flex justify-between text-sm">
              <div>
                <p style={{ color: C.ink }}>{v.itens.map((i) => i.nome).join(", ")}</p>
                <p style={{ color: C.inkSoft }} className="text-xs">{new Date(v.data).toLocaleString("pt-BR")} · {v.operador} · {v.forma_pagamento}</p>
              </div>
              <span className="font-medium" style={{ color: C.primaryDark }}>{money(v.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, destaque }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${destaque ? C.berry : C.border}` }} className="rounded-xl p-3">
      <p className="text-xs" style={{ color: C.inkSoft }}>{label}</p>
      <p className="fnt-display text-lg font-semibold" style={{ color: destaque ? C.berry : C.ink }}>{value}</p>
    </div>
  );
}
