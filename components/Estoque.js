"use client";
import { useState } from "react";
import { Plus, Trash2, ImagePlus, Package } from "lucide-react";
import { C } from "@/lib/theme";

const CATEGORIAS = ["Sorvetes", "Açaí", "Milk Shake", "Sobremesas", "Bebidas", "Salgados"];
const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function resizeImageFile(file, maxSize = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        else if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Estoque({ produtos, onAtualizar }) {
  const [novo, setNovo] = useState({ nome: "", categoria: CATEGORIAS[0], unidade: "un", preco: "", estoque: "", estoqueMin: "", imagem: null });
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  const adicionar = async () => {
    if (!novo.nome || !novo.preco) return;
    await fetch("/api/produtos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    setNovo({ nome: "", categoria: CATEGORIAS[0], unidade: "un", preco: "", estoque: "", estoqueMin: "", imagem: null });
    onAtualizar();
  };
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  const enviarFoto = async (file) => {
    const dataUrl = await resizeImageFile(file);
    setEnviandoFoto(true);
    setErroFoto("");
    try {
      const res = await fetch("/api/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setErroFoto(data.erro || "Não foi possível enviar a foto."); return null; }
      return data.url;
    } catch {
      setErroFoto("Erro de conexão ao enviar a foto.");
      return null;
    } finally {
      setEnviandoFoto(false);
    }
  };

  const escolherImagemNovo = async (file) => {
    if (!file) return;
    const url = await enviarFoto(file);
    if (url) setNovo((n) => ({ ...n, imagem: url }));
  };
  const atualizarCampo = async (id, campo, valor) => {
    await fetch(`/api/produtos/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  };
  const escolherImagemExistente = async (id, file) => {
    if (!file) return;
    const url = await enviarFoto(file);
    if (!url) return;
    await fetch(`/api/produtos/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagem: url }),
    });
    onAtualizar();
  };
  const excluir = async (id) => {
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    setConfirmarExclusao(null);
    onAtualizar();
  };

  return (
    <div className="space-y-4">
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-4">
        <h3 className="fnt-display font-semibold mb-3" style={{ color: C.ink }}>Novo produto</h3>
        <div className="flex items-center gap-3 mb-3">
          <div style={{ background: C.bg, border: `1px solid ${C.border}` }} className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            {novo.imagem ? <img src={novo.imagem} alt="" className="w-full h-full object-cover" /> : <Package size={20} color={C.inkSoft} />}
          </div>
          <label style={{ color: C.primaryDark, border: `1px solid ${C.border}` }} className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1.5">
            <ImagePlus size={14} /> {enviandoFoto ? "Enviando..." : "Escolher foto"}
            <input type="file" accept="image/*" className="hidden" disabled={enviandoFoto} onChange={(e) => escolherImagemNovo(e.target.files?.[0])} />
          </label>
        </div>
        {erroFoto && <p className="text-xs mb-3" style={{ color: C.berry }}>{erroFoto}</p>}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input placeholder="Nome" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            className="col-span-2 md:col-span-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <select value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
            {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={novo.unidade} onChange={(e) => setNovo({ ...novo, unidade: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
            <option value="un">unidade</option>
            <option value="kg">quilo</option>
          </select>
          <input placeholder="Preço" type="number" value={novo.preco} onChange={(e) => setNovo({ ...novo, preco: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <input placeholder="Estoque" type="number" value={novo.estoque} onChange={(e) => setNovo({ ...novo, estoque: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
          <input placeholder="Estoque mín." type="number" value={novo.estoqueMin} onChange={(e) => setNovo({ ...novo, estoqueMin: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${C.border}`, color: C.ink }} />
        </div>
        <button onClick={adicionar} style={{ background: C.primary }} className="mt-3 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5">
          <Plus size={15} /> Adicionar produto
        </button>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: C.bg }}>
            <tr style={{ color: C.inkSoft }}>
              <th className="text-left p-3 font-medium">Foto</th>
              <th className="text-left p-3 font-medium">Produto</th>
              <th className="text-left p-3 font-medium">Categoria</th>
              <th className="text-left p-3 font-medium">Unid.</th>
              <th className="text-left p-3 font-medium">Preço</th>
              <th className="text-left p-3 font-medium">Estoque</th>
              <th className="text-left p-3 font-medium">Mín.</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => {
              const baixo = p.estoque <= p.estoque_min;
              const editando = editandoId === p.id;
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div style={{ background: C.bg }} className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {p.imagem ? <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" /> : <Package size={16} color={C.inkSoft} />}
                      </div>
                      <label style={{ color: C.primaryDark }} className="text-xs cursor-pointer">
                        <ImagePlus size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => escolherImagemExistente(p.id, e.target.files?.[0])} />
                      </label>
                    </div>
                  </td>
                  <td className="p-3">
                    {editando ? (
                      <input defaultValue={p.nome} onBlur={(e) => atualizarCampo(p.id, "nome", e.target.value)}
                        className="px-2 py-1 rounded text-sm outline-none w-full" style={{ border: `1px solid ${C.border}` }} />
                    ) : <span style={{ color: C.ink }}>{p.nome}</span>}
                  </td>
                  <td className="p-3">
                    {editando ? (
                      <select defaultValue={p.categoria} onChange={(e) => atualizarCampo(p.id, "categoria", e.target.value)}
                        className="px-2 py-1 rounded text-sm outline-none" style={{ border: `1px solid ${C.border}` }}>
                        {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    ) : <span style={{ color: C.inkSoft }}>{p.categoria || "—"}</span>}
                  </td>
                  <td className="p-3" style={{ color: C.inkSoft }}>{p.unidade}</td>
                  <td className="p-3">
                    {editando ? (
                      <input type="number" defaultValue={p.preco} onBlur={(e) => atualizarCampo(p.id, "preco", e.target.value)}
                        className="px-2 py-1 rounded text-sm outline-none w-20" style={{ border: `1px solid ${C.border}` }} />
                    ) : <span style={{ color: C.ink }}>{money(p.preco)}</span>}
                  </td>
                  <td className="p-3">
                    {editando ? (
                      <input type="number" defaultValue={p.estoque} onBlur={(e) => atualizarCampo(p.id, "estoque", e.target.value)}
                        className="px-2 py-1 rounded text-sm outline-none w-20" style={{ border: `1px solid ${C.border}` }} />
                    ) : <span style={{ color: baixo ? C.berry : C.ink }}>{p.estoque}{baixo && " ⚠"}</span>}
                  </td>
                  <td className="p-3">
                    {editando ? (
                      <input type="number" defaultValue={p.estoque_min} onBlur={(e) => atualizarCampo(p.id, "estoqueMin", e.target.value)}
                        className="px-2 py-1 rounded text-sm outline-none w-16" style={{ border: `1px solid ${C.border}` }} />
                    ) : <span style={{ color: C.inkSoft }}>{p.estoque_min}</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => { if (editando) onAtualizar(); setEditandoId(editando ? null : p.id); }}
                      className="text-xs mr-3" style={{ color: C.primaryDark }}>
                      {editando ? "Concluir" : "Editar"}
                    </button>
                    {confirmarExclusao === p.id ? (
                      <button onClick={() => excluir(p.id)} className="text-xs" style={{ color: C.berry }}>Confirmar?</button>
                    ) : (
                      <button onClick={() => setConfirmarExclusao(p.id)} style={{ color: C.inkSoft }}><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
