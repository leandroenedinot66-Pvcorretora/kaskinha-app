# Kaskinha — Sistema de Vendas, Caixa e Estoque

Site completo (Next.js + Supabase) com login por perfil (admin/funcionário),
PDV com carrinho e troco, controle de caixa, estoque com fotos e categorias,
relatórios por período, e **notificação push no celular quando um produto
atinge o estoque mínimo**.

## Passo 1 — Criar o banco (Supabase)

1. Crie uma conta grátis em https://supabase.com e um novo projeto.
2. No painel do projeto, vá em **SQL Editor > New query**, cole o conteúdo
   do arquivo `supabase/schema.sql` deste projeto e clique em **Run**.
   Isso cria as tabelas e já deixa um usuário admin pronto (login `admin`,
   senha `admin123` — troque depois de entrar).
3. Vá em **Project Settings > API** e anote:
   - `Project URL` → vai virar `SUPABASE_URL`
   - `service_role` key (a secreta, não a `anon`) → vira `SUPABASE_SERVICE_ROLE_KEY`

## Passo 2 — Gerar as chaves de notificação push

No seu computador, dentro da pasta do projeto:

```
npx web-push generate-vapid-keys
```

Isso gera duas chaves: uma pública e uma privada. Guarde as duas.

## Passo 3 — Configurar as variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com os valores dos
passos 1 e 2.

## Passo 4 — Rodar local pra testar

```
npm install
npm run dev
```

Abra http://localhost:3000, entre com `admin` / `admin123`.

## Passo 5 — Publicar na Vercel

1. Suba esta pasta pra um repositório no GitHub (ou use `vercel` CLI direto).
2. Em https://vercel.com, clique em **Add New Project** e importe o repositório.
3. Em **Environment Variables**, adicione as mesmas 5 variáveis do `.env.local`.
4. Clique em **Deploy**. Em ~1 minuto o site estará no ar com uma URL tipo
   `https://kaskinha.vercel.app`.

## Passo 6 — Ativar as notificações no celular

1. Abra o site publicado no navegador do celular (Chrome no Android, Safari no iPhone).
2. **No iPhone**: primeiro adicione o site à Tela de Início (compartilhar >
   "Adicionar à Tela de Início") e abra por esse ícone — o iOS só permite
   notificação push em sites instalados assim (a partir do iOS 16.4).
   **No Android**: não precisa instalar, já funciona direto no Chrome.
3. Faça login como admin e clique em **"Ativar notificações de estoque
   baixo"** no menu. Aceite a permissão que o navegador pedir.

Pronto — sempre que uma venda fizer o estoque de um produto cruzar o
mínimo cadastrado, todo aparelho inscrito recebe a notificação.

## Limitações importantes (pra você saber o que esperar)

- As senhas ficam salvas em texto simples no banco — funcional pro uso
  interno da loja, mas sem o nível de segurança de sistemas comerciais.
  Se quiser, dá pra evoluir depois para hash de senha ou Supabase Auth.
- A notificação de estoque baixo hoje dispara **na hora da venda** (quando
  o estoque cruza o mínimo). Uma edição manual de estoque no admin não
  dispara notificação — é possível adicionar isso depois se fizer falta.
- As fotos dos produtos ficam salvas como texto (base64) direto no banco.
  Funciona bem pra um catálogo pequeno; se o catálogo crescer muito, vale
  migrar para o Supabase Storage.
