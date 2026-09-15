"use client";
import { useEffect, useState } from "react";
import { Bell, BellRing, BellOff } from "lucide-react";
import { C } from "@/lib/theme";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function NotificacoesSetup() {
  const [status, setStatus] = useState("verificando"); // verificando | suportado | inscrito | negado | indisponivel

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("indisponivel");
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) setStatus("inscrito");
      else if (Notification.permission === "denied") setStatus("negado");
      else setStatus("suportado");
    });
  }, []);

  const ativar = async () => {
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setStatus("negado");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });
      await fetch("/api/subscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus("inscrito");
    } catch (e) {
      console.error(e);
      setStatus("negado");
    }
  };

  if (status === "indisponivel") {
    return (
      <p className="text-xs flex items-center gap-1.5" style={{ color: C.inkSoft }}>
        <BellOff size={14} /> Notificações não disponíveis neste navegador. No iPhone, adicione o site à Tela de Início primeiro.
      </p>
    );
  }
  if (status === "inscrito") {
    return (
      <p className="text-xs flex items-center gap-1.5" style={{ color: C.primaryDark }}>
        <BellRing size={14} /> Notificações de estoque baixo ativadas neste aparelho.
      </p>
    );
  }
  if (status === "negado") {
    return (
      <p className="text-xs flex items-center gap-1.5" style={{ color: C.berry }}>
        <BellOff size={14} /> Notificações bloqueadas. Ative nas permissões do navegador pra este site.
      </p>
    );
  }
  return (
    <button onClick={ativar} style={{ border: `1px solid ${C.border}`, color: C.primaryDark }}
      className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
      <Bell size={14} /> Ativar notificações de estoque baixo
    </button>
  );
}
