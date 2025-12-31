# Documentação Detalhada do Projeto StudyFlow

## Sumário
1. Visão Geral do Projeto
2. Estrutura de Pastas e Arquivos
3. Componentes e Funções (detalhamento)
4. Contextos Globais
5. Hooks Customizados
6. Serviços e Integrações
7. Decisões de Implementação
8. Tecnologias Utilizadas
9. Fluxo de Funcionamento
10. Como Rodar o Projeto

---

## 1. Visão Geral do Projeto
O StudyFlow é um assistente de estudos inteligente, focado em ajudar estudantes a organizar sua vida acadêmica, recuperar conteúdos perdidos e manter a motivação. Ele oferece geração automática de planos de estudo personalizados, dashboard de progresso, área de cursos, anotações contextuais, painel administrativo e interface moderna com suporte a temas.

## 2. Estrutura de Pastas e Arquivos
- **components/**: Páginas e componentes visuais (Dashboard, Planner, Navbar, etc).
- **contexts/**: Contextos globais (tema, autenticação).
- **hooks/**: Hooks customizados (ex: verificação de admin).
- **services/**: Serviços utilitários (acesso a dados, PDF, IA, etc).
- **public/**: Arquivos estáticos e imagens.
- **types.ts**: Tipos TypeScript globais.
- **App.tsx / index.tsx**: Entradas principais da aplicação.
- **vite.config.ts**: Configuração do Vite.

## 3. Componentes e Funções (detalhamento)
### App.tsx
- Centraliza o roteamento e provê os contextos globais de tema e autenticação.
- Usa `HashRouter` e `Routes` do React Router para navegação.

### DashboardPage
- Exibe o plano de estudos do usuário, progresso, notas rápidas e permite exportar o plano em PDF.
- Busca dados do usuário via `dataService` e monta o plano com `planCalculator`.
- Permite salvar notas rápidas e baixar o plano em PDF usando `pdfService`.

### PlannerPage
- Permite ao usuário montar um plano de estudos personalizado, escolhendo disciplinas, horários e dias.
- Gera o plano localmente e pode exportar para PDF.
- Salva o plano no banco via `dataService`.

### CoursePage
- Gerencia cursos, unidades e notas do usuário.
- Permite navegação entre módulos, marcar progresso e fazer anotações coloridas por aula.
- Usa Supabase para buscar cursos e salvar progresso/notas.

### LinksPage
- Lista de links úteis, com CRUD para administradores.
- Busca e salva links no Supabase.

### AdminPage
- Gerenciamento de cursos e conteúdos, acesso restrito a administradores.
- Permite criar, editar e excluir cursos.

### Layout, Navbar, PrivateRoute
- Layout: Estrutura visual padrão das páginas protegidas.
- Navbar: Navegação principal, mostra links conforme permissão do usuário.
- PrivateRoute: Protege rotas que exigem autenticação.

## 4. Contextos Globais
### AuthContext
- Gerencia autenticação do usuário (login, logout, sessão) usando Supabase.
- Disponibiliza o usuário atual e funções de login/logout para toda a aplicação.

### ThemeContext
- Gerencia tema claro/escuro, persistindo preferência no localStorage.
- Permite alternar tema em qualquer parte da aplicação.

## 5. Hooks Customizados
### useAdmin
- Verifica se o usuário logado é administrador, baseado no e-mail.
- Facilita controle de permissões em componentes e páginas.

## 6. Serviços e Integrações
### dataService
- CRUD de planos, perfis, notas e links no Supabase.
- Funções como `saveUserFullPlan`, `getUserFullPlan`, `getProfile`, etc.

### planCalculator
- Gera planos de estudo locais, com técnicas e dicas.
- Organiza matérias, horários e técnicas de estudo para o usuário.

### pdfService
- Exporta planos de estudo para PDF usando jsPDF e autoTable.
- Cria um documento visualmente organizado, pronto para impressão.

### geminiService
- Integração com Google Gemini para geração de planos de estudo via IA.
- Recebe disciplinas, horas disponíveis e objetivo, retorna plano detalhado.

### supabaseClient
- Inicializa o cliente Supabase com variáveis de ambiente.
- Permite acesso ao banco de dados e autenticação.

## 7. Decisões de Implementação
- **React + TypeScript:** Tipagem forte, produtividade e escalabilidade.
- **Vite:** Build rápido e moderno.
- **Supabase:** Backend as a Service para autenticação e banco de dados.
- **Google Gemini:** Geração de planos inteligentes via IA.
- **jsPDF:** Exportação de planos em PDF.
- **Context API:** Compartilhamento de estado global.
- **Componentização:** Separação clara de responsabilidades.

## 8. Tecnologias Utilizadas
- React 19, Vite, TypeScript, Tailwind CSS, React Router 7
- Supabase, Google Gemini AI, jsPDF, autoTable

## 9. Fluxo de Funcionamento
1. Usuário acessa o site e escolhe entre login ou uso gratuito.
2. Ao logar, tem acesso ao dashboard, planner, cursos e links úteis.
3. Pode montar plano de estudos, salvar, exportar em PDF e acompanhar progresso.
4. Admins podem gerenciar cursos e links.

## 10. Como Rodar o Projeto
1. Clone o repositório e instale as dependências.
2. Configure as variáveis de ambiente (.env).
3. Rode o servidor de desenvolvimento com `npm run dev`.
4. Acesse `http://localhost:5173`.

---

Este documento pode ser exportado em PDF pelo próprio sistema ou usando ferramentas como o jsPDF.
