import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportarDocumentacaoDetalhada() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const titulo = 'Documentação Detalhada do Projeto StudyFlow';
  const sumario = [
    '1. Visão Geral do Projeto',
    '2. Estrutura de Pastas e Arquivos',
    '3. Componentes e Funções (detalhamento)',
    '4. Contextos Globais',
    '5. Hooks Customizados',
    '6. Serviços e Integrações',
    '7. Decisões de Implementação',
    '8. Tecnologias Utilizadas',
    '9. Fluxo de Funcionamento',
    '10. Como Rodar o Projeto',
  ];

  doc.setFontSize(18);
  doc.text(titulo, 15, 20);
  doc.setFontSize(12);
  doc.text('Sumário:', 15, 30);
  sumario.forEach((item, i) => {
    doc.text(item, 20, 38 + i * 7);
  });

  let y = 38 + sumario.length * 7 + 8;
  doc.setFontSize(14);
  doc.text('1. Visão Geral do Projeto', 15, y);
  doc.setFontSize(11);
  doc.text('O StudyFlow é um assistente de estudos inteligente, focado em ajudar estudantes a organizar sua vida acadêmica, recuperar conteúdos perdidos e manter a motivação. Ele oferece geração automática de planos de estudo personalizados, dashboard de progresso, área de cursos, anotações contextuais, painel administrativo e interface moderna com suporte a temas.', 15, y + 8, { maxWidth: 180 });

  y += 28;
  doc.setFontSize(14);
  doc.text('2. Estrutura de Pastas e Arquivos', 15, y);
  doc.setFontSize(11);
  doc.text('- components/: Páginas e componentes visuais (Dashboard, Planner, Navbar, etc).', 15, y + 8);
  doc.text('- contexts/: Contextos globais (tema, autenticação).', 15, y + 14);
  doc.text('- hooks/: Hooks customizados (ex: verificação de admin).', 15, y + 20);
  doc.text('- services/: Serviços utilitários (acesso a dados, PDF, IA, etc).', 15, y + 26);
  doc.text('- public/: Arquivos estáticos e imagens.', 15, y + 32);
  doc.text('- types.ts: Tipos TypeScript globais.', 15, y + 38);
  doc.text('- App.tsx / index.tsx: Entradas principais da aplicação.', 15, y + 44);
  doc.text('- vite.config.ts: Configuração do Vite.', 15, y + 50);

  // ...continuação: para não estourar a página, adicionar novas páginas e continuar o texto detalhado
  // O conteúdo completo será montado a partir do arquivo DOCUMENTACAO_STUDYFLOW.md

  // Exemplo de continuação:
  doc.addPage();
  doc.setFontSize(14);
  doc.text('3. Componentes e Funções (detalhamento)', 15, 20);
  doc.setFontSize(11);
  doc.text('App.tsx: Centraliza o roteamento e provê os contextos globais de tema e autenticação. Usa HashRouter e Routes do React Router para navegação.', 15, 28, { maxWidth: 180 });
  doc.text('DashboardPage: Exibe o plano de estudos do usuário, progresso, notas rápidas e permite exportar o plano em PDF. Busca dados do usuário via dataService e monta o plano com planCalculator. Permite salvar notas rápidas e baixar o plano em PDF usando pdfService.', 15, 38, { maxWidth: 180 });
  // ...e assim por diante para todos os tópicos

  // Ao final, salvar o PDF
  doc.save('DOCUMENTACAO_STUDYFLOW.pdf');
}
