"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarRange, Download, Trash2 } from "lucide-react";
import { C } from "@/lib/theme";

const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Relatorios({ produtos, vendasTotalHistorico, onAtualizar }) {
  const hoje = todayStr();
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [atalhoAtivo, setAtalhoAtivo] = useState("Hoje");
  const [todasVendas, setTodasVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  const carregarVendasPeriodo = () => {
    setCarregando(true);
    return fetch("/api/vendas", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setTodasVendas(d.vendas || []))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarVendasPeriodo();
  }, []);

  // Filtra pelo horário local do navegador (o do Brasil), em vez de mandar
  // a data pro servidor — evita qualquer confusão de fuso horário.
  const vendasPeriodo = useMemo(() => {
    const ini = new Date(`${dataInicio}T00:00:00`);
    const fimD = new Date(`${dataFim}T23:59:59.999`);
    return todasVendas.filter((v) => {
      const d = new Date(v.data);
      return d >= ini && d <= fimD;
    });
  }, [todasVendas, dataInicio, dataFim]);

  const excluirVenda = async (id) => {
    const res = await fetch(`/api/vendas/${id}`, { method: "DELETE" });
    setConfirmarExclusao(null);
    if (res.ok) {
      carregarVendasPeriodo();
      onAtualizar && onAtualizar();
    }
  };

  const aplicarAtalho = (label, dias) => {
    setAtalhoAtivo(label);
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

  const linhasDetalhadas = useMemo(() => {
    return vendasPeriodo
      .flatMap((v) =>
        (v.itens || []).map((it, idx) => ({
          vendaId: v.id,
          chave: `${v.id}-${idx}`,
          data: v.data,
          produto: it.nome,
          qtd: it.qtd,
          valor: it.preco * it.qtd,
          forma: v.forma_pagamento,
          responsavel: v.operador,
        }))
      )
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [vendasPeriodo]);

  const exportarExcel = () => {
    const cabecalho = ["Data da venda", "Produto vendido", "Quantidade", "Valor", "Forma de pagamento", "Responsável"];
    const linhas = linhasDetalhadas.map((l) => [
      new Date(l.data).toLocaleString("pt-BR"),
      l.produto,
      l.qtd,
      l.valor.toFixed(2).replace(".", ","),
      l.forma,
      l.responsavel,
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaskinha-vendas_${dataInicio}_a_${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
        <h3 className="fnt-display font-semibold mb-3 flex items-center gap-1.5" style={{ color: C.ink }}>
          <CalendarRange size={17} /> Período
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {[["Hoje", 0], ["7 dias", 7], ["30 dias", 30], ["Este mês", "mes"], ["Tudo", "tudo"]].map(([label, val]) => (
            <button key={label} onClick={() => aplicarAtalho(label, val)}
              style={atalhoAtivo === label
                ? { background: C.primary, color: "white", border: `1px solid ${C.primary}` }
                : { border: `1px solid ${C.border}`, color: C.inkSoft, background: C.surface }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition">
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label className="text-xs block mb-1" style={{ color: C.inkSoft }}>De</label>
            <input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setAtalhoAtivo(null); }}
              className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.inkSoft }}>Até</label>
            <input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setAtalhoAtivo(null); }}
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
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="fnt-display font-semibold" style={{ color: C.ink }}>Detalhamento de vendas {rotuloPeriodo}</h3>
          <button onClick={exportarExcel} disabled={linhasDetalhadas.length === 0}
            style={{ background: linhasDetalhadas.length === 0 ? C.border : C.primary, color: linhasDetalhadas.length === 0 ? C.inkSoft : "white" }}
            className="text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1.5">
            <Download size={14} /> Exportar Excel
          </button>
        </div>
        {linhasDetalhadas.length === 0 ? (
          <p className="text-sm" style={{ color: C.inkSoft }}>Nenhuma venda no período selecionado.</p>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Data</th>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Produto</th>
                  <th className="text-right py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Qtd</th>
                  <th className="text-right py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Valor</th>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Pagamento</th>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: C.inkSoft }}>Responsável</th>
                  <th className="text-right py-2 font-medium" style={{ color: C.inkSoft }}></th>
                </tr>
              </thead>
              <tbody>
                {linhasDetalhadas.map((l) => (
                  <tr key={l.chave} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: C.ink }}>{new Date(l.data).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-3" style={{ color: C.ink }}>{l.produto}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: C.ink }}>{l.qtd}</td>
                    <td className="py-2 pr-3 text-right font-medium" style={{ color: C.primaryDark }}>{money(l.valor)}</td>
                    <td className="py-2 pr-3" style={{ color: C.ink }}>{l.forma}</td>
                    <td className="py-2 pr-3" style={{ color: C.ink }}>{l.responsavel}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {confirmarExclusao === l.vendaId ? (
                        <button onClick={() => excluirVenda(l.vendaId)} className="text-xs font-medium" style={{ color: C.berry }}>Confirmar?</button>
                      ) : (
                        <button onClick={() => setConfirmarExclusao(l.vendaId)} style={{ color: C.inkSoft }} title="Excluir esta venda"><Trash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
