"use client";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search, Package } from "lucide-react";
import { C } from "@/lib/theme";

const CATEGORIAS = ["Sorvetes", "Açaí", "Milk Shake", "Sobremesas", "Bebidas", "Salgados"];
const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Pdv({ produtos, caixaAberto, operador, onVendaFinalizada }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [carrinho, setCarrinho] = useState([]);
  const [pagamento, setPagamento] = useState("Dinheiro");
  const [cartaoTipo, setCartaoTipo] = useState(null);
  const [valorRecebido, setValorRecebido] = useState("");
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);

  const categoriasComProdutos = ["Todas", ...CATEGORIAS.filter((cat) => produtos.some((p) => p.categoria === cat))];
  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) && (categoria === "Todas" || p.categoria === categoria)
  );
  const total = carrinho.reduce((s, i) => s + i.qtd * i.preco, 0);

  const emDinheiro = pagamento === "Dinheiro";
  const emCartao = pagamento === "Cartão";
  const cartaoPendente = emCartao && !cartaoTipo;
  const troco = emDinheiro && valorRecebido !== "" ? +(Number(valorRecebido) - total).toFixed(2) : null;
  const dinheiroInsuficiente = emDinheiro && (valorRecebido === "" || troco < 0);
  const formaPagamentoFinal = emCartao ? `Cartão ${cartaoTipo || ""}`.trim() : pagamento;

  const addItem = (p) => {
    if (p.estoque <= 0) return;
    setCarrinho((c) => {
      const existe = c.find((i) => i.produtoId === p.id);
      if (existe) {
        const novaQtd = existe.qtd + 1;
        if (novaQtd > p.estoque) return c;
        return c.map((i) => (i.produtoId === p.id ? { ...i, qtd: novaQtd } : i));
      }
      return [...c, { produtoId: p.id, nome: p.nome, preco: p.preco, unidade: p.unidade, qtd: 1 }];
    });
  };
  const alterarQtd = (produtoId, delta) => {
    setCarrinho((c) => c.map((i) => (i.produtoId === produtoId ? { ...i, qtd: i.qtd + delta } : i)).filter((i) => i.qtd > 0));
  };
  const removerItem = (produtoId) => setCarrinho((c) => c.filter((i) => i.produtoId !== produtoId));

  const finalizar = async () => {
    if (!caixaAberto) { setMsg("Abra o caixa antes de vender."); return; }
    if (carrinho.length === 0 || dinheiroInsuficiente || cartaoPendente) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: carrinho, total, formaPagamento: formaPagamentoFinal, caixaId: caixaAberto.id, operador }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMsg(d.erro || "Erro ao registrar venda.");
        return;
      }
      setCarrinho([]);
      setValorRecebido("");
      setCartaoTipo(null);
      setMsg("Venda registrada!");
      onVendaFinalizada();
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 min-w-0">
      <div className="md:col-span-2 min-w-0">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {categoriasComProdutos.map((cat) => (
            <button key={cat} onClick={() => setCategoria(cat)}
              style={categoria === cat ? { background: C.primary, color: "white" } : { border: `1px solid ${C.border}`, color: C.inkSoft }}
              className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap shrink-0">
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Search size={16} color={C.inkSoft} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..." className="w-full outline-none bg-transparent text-sm" style={{ color: C.ink }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtrados.map((p) => (
            <button key={p.id} onClick={() => addItem(p)} disabled={p.estoque <= 0}
              style={{ background: C.surface, border: `1px solid ${C.border}`, opacity: p.estoque <= 0 ? 0.5 : 1 }}
              className="rounded-xl p-3 text-left hover:shadow-sm transition">
              <div style={{ background: C.bg }} className="w-full h-20 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                {p.imagem ? <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" /> : <Package size={22} color={C.inkSoft} />}
              </div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{p.nome}</p>
              <p className="text-xs mt-0.5" style={{ color: C.inkSoft }}>{p.unidade === "kg" ? "por kg" : "unidade"}</p>
              <p className="fnt-display font-semibold mt-1" style={{ color: C.primaryDark }}>{money(p.preco)}</p>
              <p className="text-[11px] mt-1" style={{ color: p.estoque <= p.estoque_min ? C.berry : C.inkSoft }}>
                {p.estoque <= 0 ? "sem estoque" : `estoque: ${p.estoque}${p.unidade === "kg" ? "kg" : ""}`}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4 h-fit md:sticky md:top-4">
        <h3 className="fnt-display font-semibold mb-3 flex items-center gap-2" style={{ color: C.ink }}>
          <ShoppingCart size={17} /> Carrinho
        </h3>
        {carrinho.length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>Toque em um produto para adicionar.</p>}
        <div className="space-y-2 mb-3">
          {carrinho.map((i) => {
            const prod = produtos.find((x) => x.id === i.produtoId);
            return (
              <div key={i.produtoId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div style={{ background: C.bg }} className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    {prod?.imagem ? <img src={prod.imagem} alt={i.nome} className="w-full h-full object-cover" /> : <Package size={13} color={C.inkSoft} />}
                  </div>
                  <div>
                    <p style={{ color: C.ink }}>{i.nome}</p>
                    <p style={{ color: C.inkSoft }} className="text-xs">{money(i.preco)} {i.unidade === "kg" ? "/kg" : "/un"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => alterarQtd(i.produtoId, -1)} style={{ color: C.inkSoft }}><Minus size={15} /></button>
                  <span style={{ color: C.ink }} className="w-8 text-center">{i.qtd}</span>
                  <button onClick={() => alterarQtd(i.produtoId, 1)} style={{ color: C.inkSoft }}><Plus size={15} /></button>
                  <button onClick={() => removerItem(i.produtoId)} style={{ color: C.berry }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }} className="pt-3 mb-3 flex items-center justify-between">
          <span className="text-sm" style={{ color: C.inkSoft }}>Total</span>
          <span className="fnt-display text-lg font-semibold" style={{ color: C.ink }}>{money(total)}</span>
        </div>
        <div className="flex gap-2 mb-3">
          {["Dinheiro", "Cartão", "Pix"].map((f) => (
            <button key={f} onClick={() => { setPagamento(f); setValorRecebido(""); setCartaoTipo(null); }}
              style={pagamento === f ? { background: C.primarySoft, color: C.primaryDark } : { color: C.inkSoft, border: `1px solid ${C.border}` }}
              className="flex-1 text-xs py-1.5 rounded-lg font-medium">
              {f}
            </button>
          ))}
        </div>
        {emCartao && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}` }} className="rounded-xl p-3 mb-3">
            <label className="text-xs" style={{ color: C.inkSoft }}>Qual cartão?</label>
            <div className="flex gap-2 mt-1.5">
              {["Crédito", "Débito"].map((t) => (
                <button key={t} onClick={() => setCartaoTipo(t)}
                  style={cartaoTipo === t ? { background: C.primary, color: "white" } : { border: `1px solid ${C.border}`, color: C.inkSoft, background: C.surface }}
                  className="flex-1 text-xs py-2 rounded-lg font-medium">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        {emDinheiro && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}` }} className="rounded-xl p-3 mb-3">
            <label className="text-xs" style={{ color: C.inkSoft }}>Valor recebido do cliente</label>
            <input type="number" value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg outline-none text-sm" style={{ border: `1px solid ${C.border}`, color: C.ink, background: C.surface }}
              placeholder="0,00" />
            {valorRecebido !== "" && (
              troco >= 0 ? (
                <p className="text-sm mt-2 flex justify-between font-medium" style={{ color: C.primaryDark }}>
                  <span>Troco</span><span>{money(troco)}</span>
                </p>
              ) : (
                <p className="text-xs mt-2" style={{ color: C.berry }}>Valor recebido insuficiente — faltam {money(Math.abs(troco))}</p>
              )
            )}
          </div>
        )}
        <button onClick={finalizar} disabled={carrinho.length === 0 || dinheiroInsuficiente || cartaoPendente || enviando}
          style={{ background: (carrinho.length === 0 || dinheiroInsuficiente || cartaoPendente) ? C.border : C.primary, color: (carrinho.length === 0 || dinheiroInsuficiente || cartaoPendente) ? C.inkSoft : "white" }}
          className="w-full rounded-xl py-2.5 font-medium text-sm">
          {enviando ? "Registrando..." : "Finalizar venda"}
        </button>
        {msg && <p className="text-xs mt-2 text-center" style={{ color: C.primaryDark }}>{msg}</p>}
      </div>
    </div>
  );
}
