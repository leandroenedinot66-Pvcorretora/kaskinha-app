"use client";
import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Wallet, Package, BarChart3, Users, LogOut, AlertTriangle } from "lucide-react";
import { C, FONT_STYLE } from "@/lib/theme";
import Login from "@/components/Login";
import Pdv from "@/components/Pdv";
import Caixa from "@/components/Caixa";
import Estoque from "@/components/Estoque";
import Relatorios from "@/components/Relatorios";
import Usuarios from "@/components/Usuarios";
import NotificacoesSetup from "@/components/NotificacoesSetup";

export default function AppClient() {
  const [currentUser, setCurrentUser] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [tab, setTab] = useState("pdv");
  const [produtos, setProdutos] = useState([]);
  const [caixas, setCaixas] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const salvo = typeof window !== "undefined" && localStorage.getItem("kaskinha_user");
    if (salvo) setCurrentUser(JSON.parse(salvo));
    setCarregandoSessao(false);
  }, []);

  const carregarProdutos = useCallback(async () => {
    const r = await fetch("/api/produtos"); const d = await r.json(); setProdutos(d.produtos || []);
  }, []);
  const carregarCaixas = useCallback(async () => {
    const r = await fetch("/api/caixas"); const d = await r.json(); setCaixas(d.caixas || []);
  }, []);
  const carregarVendas = useCallback(async () => {
    const r = await fetch("/api/vendas"); const d = await r.json(); setVendas(d.vendas || []);
  }, []);
  const carregarUsuarios = useCallback(async () => {
    const r = await fetch("/api/usuarios"); const d = await r.json(); setUsuarios(d.usuarios || []);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    carregarProdutos();
    carregarCaixas();
    carregarVendas();
    if (currentUser.papel === "admin") carregarUsuarios();
  }, [currentUser, carregarProdutos, carregarCaixas, carregarVendas, carregarUsuarios]);

  // Mantém o status do caixa em dia entre aparelhos diferentes: reconsulta
  // periodicamente e sempre que a pessoa volta pra essa aba/janela.
  useEffect(() => {
    if (!currentUser) return;
    const intervalo = setInterval(() => {
      carregarCaixas();
      carregarVendas();
    }, 15000);
    const aoFocar = () => { carregarCaixas(); carregarVendas(); carregarProdutos(); };
    window.addEventListener("focus", aoFocar);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) aoFocar(); });
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
    };
  }, [currentUser, carregarCaixas, carregarVendas, carregarProdutos]);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem("kaskinha_user", JSON.stringify(user));
  };
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kaskinha_user");
  };

  if (carregandoSessao) return null;
  if (!currentUser) return <Login onLogin={login} />;

  const isAdmin = currentUser.papel === "admin";
  const caixaAberto = caixas.find((c) => c.status === "aberto") || null;
  const totalHistorico = vendas.reduce((s, v) => s + v.total, 0);

  const tabsAdmin = [
    { id: "pdv", label: "Vender", icon: ShoppingCart },
    { id: "caixa", label: "Caixa", icon: Wallet },
    { id: "estoque", label: "Estoque", icon: Package },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "usuarios", label: "Usuários", icon: Users },
  ];
  const tabsFuncionario = [
    { id: "pdv", label: "Vender", icon: ShoppingCart },
    { id: "caixa", label: "Caixa", icon: Wallet },
  ];
  const tabs = isAdmin ? tabsAdmin : tabsFuncionario;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }} className="fnt-body flex flex-col md:flex-row">
      <style>{FONT_STYLE}</style>

      <div style={{ background: C.surface, borderRight: `1px solid ${C.border}` }} className="hidden md:flex md:flex-col w-56 shrink-0 p-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div style={{ background: C.primarySoft }} className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Kaskinha" className="w-full h-full object-cover" />
          </div>
          <span className="fnt-display font-semibold" style={{ color: C.ink }}>Kaskinha</span>
        </div>
        {isAdmin && (
          <div className="mb-4 px-1">
            <NotificacoesSetup />
          </div>
        )}
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); carregarCaixas(); carregarVendas(); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
              style={tab === t.id ? { background: C.primarySoft, color: C.primaryDark } : { color: C.inkSoft }}>
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: `1px solid ${C.border}` }} className="pt-3 mt-3">
          <p className="text-xs" style={{ color: C.inkSoft }}>{currentUser.nome}</p>
          <p className="text-xs mb-2" style={{ color: C.inkSoft }}>{isAdmin ? "Administrador" : "Funcionário"}</p>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm" style={{ color: C.berry }}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }} className="flex md:hidden items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div style={{ background: C.primarySoft }} className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Kaskinha" className="w-full h-full object-cover" />
          </div>
          <span className="fnt-display font-semibold text-sm" style={{ color: C.ink }}>{currentUser.nome}</span>
        </div>
        <button onClick={logout} style={{ color: C.berry }}><LogOut size={18} /></button>
      </div>
      {isAdmin && (
        <div className="md:hidden px-3 pt-2">
          <NotificacoesSetup />
        </div>
      )}

      <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto min-w-0">
        {!caixaAberto && tab !== "caixa" && (
          <div style={{ background: C.mangoSoft, color: "#6B4718", border: `1px solid ${C.mango}55` }} className="rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> Nenhum caixa aberto. Abra o caixa na aba "Caixa" para começar a vender.
          </div>
        )}

        {tab === "pdv" && (
          <Pdv produtos={produtos} caixaAberto={caixaAberto} operador={currentUser.nome}
            onVendaFinalizada={() => { carregarProdutos(); carregarVendas(); }} />
        )}
        {tab === "caixa" && (
          <Caixa isAdmin={isAdmin} caixaAberto={caixaAberto} caixas={caixas} vendas={vendas} nomeUsuario={currentUser.nome}
            onAtualizar={() => { carregarCaixas(); carregarVendas(); }} />
        )}
        {tab === "estoque" && isAdmin && (
          <Estoque produtos={produtos} onAtualizar={carregarProdutos} />
        )}
        {tab === "relatorios" && isAdmin && (
          <Relatorios produtos={produtos} vendasTotalHistorico={totalHistorico} />
        )}
        {tab === "usuarios" && isAdmin && (
          <Usuarios usuarios={usuarios} currentUser={currentUser} onAtualizar={carregarUsuarios} />
        )}
      </div>

      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}` }} className="flex md:hidden fixed bottom-0 left-0 right-0 justify-around p-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); carregarCaixas(); carregarVendas(); }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium"
            style={tab === t.id ? { color: C.primaryDark } : { color: C.inkSoft }}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

