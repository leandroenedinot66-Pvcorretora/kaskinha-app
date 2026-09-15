-- Rode este script inteiro no Supabase: seu projeto > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  usuario text not null unique,
  senha text not null,
  papel text not null default 'funcionario' check (papel in ('admin', 'funcionario')),
  criado_em timestamptz not null default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default 'Sorvetes',
  unidade text not null default 'un' check (unidade in ('un', 'kg')),
  preco numeric not null default 0,
  estoque numeric not null default 0,
  estoque_min numeric not null default 0,
  imagem text,
  criado_em timestamptz not null default now()
);

create table if not exists caixas (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'aberto' check (status in ('aberto', 'fechado')),
  aberto_por text not null,
  aberto_em timestamptz not null default now(),
  valor_inicial numeric not null default 0,
  fechado_por text,
  fechado_em timestamptz,
  valor_informado numeric
);

create table if not exists vendas (
  id uuid primary key default gen_random_uuid(),
  data timestamptz not null default now(),
  itens jsonb not null,
  total numeric not null,
  forma_pagamento text not null,
  caixa_id uuid references caixas(id),
  operador text not null
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  criado_em timestamptz not null default now()
);

-- usuário admin inicial (login: admin / senha: admin123 — troque depois de entrar!)
insert into usuarios (nome, usuario, senha, papel)
values ('Administrador', 'admin', 'admin123', 'admin')
on conflict (usuario) do nothing;

-- Como todas as leituras/escritas passam pelas rotas de API do servidor
-- (que usam a service role key, não a chave pública), deixamos o RLS
-- ativado sem policies: ninguém consegue acessar essas tabelas direto
-- pelo navegador, só através do seu próprio site.
alter table usuarios enable row level security;
alter table produtos enable row level security;
alter table caixas enable row level security;
alter table vendas enable row level security;
alter table push_subscriptions enable row level security;
