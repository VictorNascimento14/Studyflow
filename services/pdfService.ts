import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AIStudyPlan } from './planCalculator';

export const exportPlanToPDF = (plan: AIStudyPlan) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor: [number, number, number] = [37, 99, 235];
    const successColor: [number, number, number] = [34, 197, 94];
    const dangerColor: [number, number, number] = [239, 68, 68];
    const warningColor: [number, number, number] = [234, 179, 8];
    const darkText: [number, number, number] = [30, 30, 30];
    const grayText: [number, number, number] = [100, 100, 100];
    const lightBg: [number, number, number] = [248, 250, 252];

    // ===== PAGE 1: COVER =====

    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');

    // Logo/Title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('StudyFlow', 20, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Seu Plano de Estudos Personalizado', 20, 35);

    // Main Title
    doc.setFontSize(22);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(plan.title, 20, 65);

    // Description
    doc.setFontSize(11);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(plan.description, 170);
    doc.text(splitDesc, 20, 78);

    let currentY = 85 + (splitDesc.length * 6);

    // Summary Box
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(20, currentY, 170, 50, 3, 3, 'F');

    // Summary Header with colored accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, currentY, 170, 12, 'F');

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DO PLANO', 25, currentY + 8);

    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('helvetica', 'normal');

    const summaryItems = [
        `> ${plan.summary.totalClasses} aulas para recuperar`,
        `> ${plan.summary.totalSubjects} disciplina${plan.summary.totalSubjects > 1 ? 's' : ''}`,
        `> ${plan.summary.hoursPerDay}h por dia`,
        `> ${plan.summary.daysPerWeek} dias por semana`,
        `> ~${plan.summary.estimatedWeeks} semana${plan.summary.estimatedWeeks > 1 ? 's' : ''} estimada${plan.summary.estimatedWeeks > 1 ? 's' : ''}`,
    ];

    let summaryY = currentY + 22;
    summaryItems.forEach((item, i) => {
        const col = i < 3 ? 25 : 110;
        const row = i < 3 ? i : i - 3;
        doc.text(item, col, summaryY + (row * 7));
    });

    currentY += 60;

    // Motivational Quote
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.rect(20, currentY, 4, 25, 'F');

    doc.setFontSize(11);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('helvetica', 'italic');
    const splitQuote = doc.splitTextToSize(plan.motivationalQuote, 160);
    doc.text(splitQuote, 30, currentY + 10);

    currentY += 40;

    // Weekly Milestones
    if (plan.weeklyMilestones.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('MARCOS SEMANAIS', 20, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'normal');
        plan.weeklyMilestones.forEach((milestone) => {
            doc.text(`> ${milestone}`, 25, currentY);
            currentY += 7;
        });
    }

    // ===== PAGE 2+: SCHEDULE =====
    doc.addPage();
    currentY = 20;

    // Schedule Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA SEMANAL DETALHADO', 20, 13);

    currentY = 30;

    // Weekly Schedule
    plan.weeklySchedule.forEach((day) => {
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }

        // Day Header
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(20, currentY - 5, 170, 12, 2, 2, 'F');

        // Colored accent for day
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(20, currentY - 5, 4, 12, 'F');

        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(day.day.toUpperCase(), 28, currentY + 3);
        currentY += 12;

        const tableRows = day.topics.map(t => {
            return [
                t.subject,
                t.subtopic,
                t.duration,
                t.priority,
                t.technique,
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [['Matéria', 'Conteúdo', 'Tempo', 'Prior.', 'Técnica']],
            body: tableRows,
            margin: { left: 20, right: 20 },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [250, 251, 252] },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 38 },
                2: { cellWidth: 18 },
                3: { cellWidth: 18 },
                4: { cellWidth: 55 },
            },
            didParseCell: function (data) {
                // Color code priorities
                if (data.column.index === 3 && data.section === 'body') {
                    const priority = data.cell.raw as string;
                    if (priority === 'Alta') {
                        data.cell.styles.textColor = dangerColor;
                        data.cell.styles.fontStyle = 'bold';
                    } else if (priority === 'Media') {
                        data.cell.styles.textColor = warningColor;
                    } else {
                        data.cell.styles.textColor = successColor;
                    }
                }
            },
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;

        // Study tips for the day
        if (day.topics.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(grayText[0], grayText[1], grayText[2]);
            doc.setFont('helvetica', 'italic');
            doc.text(`Dica: ${day.topics[0].tips}`, 20, currentY);
            currentY += 12;
        }
    });

    // ===== LAST PAGE: TIPS =====
    doc.addPage();

    // Tips Header
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DICAS DE OURO PARA O SUCESSO', 20, 13);

    currentY = 35;

    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    plan.generalTips.forEach((tip) => {
        doc.setFont('helvetica', 'normal');
        // Remove apenas emojis, mantendo acentuação
        const cleanTip = tip.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').trim();
        const splitTip = doc.splitTextToSize(`> ${cleanTip}`, 165);
        doc.text(splitTip, 25, currentY);
        currentY += (splitTip.length * 6) + 4;
    });

    // Techniques Section
    currentY += 10;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TÉCNICAS DE ESTUDO RECOMENDADAS', 20, currentY);
    currentY += 10;

    const techniques = [
        ['Pomodoro', '25 min de foco intenso + 5 min de pausa. Após 4 ciclos, faça uma pausa maior de 15-30 min.'],
        ['Feynman', 'Explique o conceito como se ensinasse a uma criança. Se não conseguir, estude mais.'],
        ['Active Recall', 'Teste sua memória ativamente em vez de apenas reler. Use flashcards.'],
        ['Espaçamento', 'Revise o conteúdo em intervalos crescentes: 1 dia, 3 dias, 1 semana, 2 semanas.'],
    ];

    techniques.forEach(([name, desc]) => {
        doc.setFontSize(10);

                // ===== PAGE: ALL SUBJECTS =====
                if (plan.summary.totalSubjects > 0 && plan.weeklySchedule.length > 0) {
                    doc.addPage();
                    let y = 25;
                    doc.setFontSize(14);
                    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.text('TODAS AS MATÉRIAS DO PLANO', 20, y);
                    y += 10;
                    doc.setFontSize(10);
                    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
                    doc.setFont('helvetica', 'normal');
                    // Extrai todas as matérias únicas do cronograma
                    const allSubjects = Array.from(new Set(plan.weeklySchedule.flatMap(day => day.topics.map(t => t.subject))));
                    allSubjects.forEach((subject, idx) => {
                        doc.text(`- ${subject}`, 25, y + idx * 7);
                    });
                    y += allSubjects.length * 7 + 5;
                }
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${name}:`, 25, currentY);

        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(desc, 145);
        doc.text(splitDesc, 50, currentY);
        currentY += (splitDesc.length * 5) + 8;
    });

    // Final CTA Box
    currentY = 240;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(20, currentY, 170, 30, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Quer salvar seu progresso e ter mais recursos?', 30, currentY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('Crie sua conta gratuita em studyflow.com', 30, currentY + 22);

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`StudyFlow - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`StudyFlow-Plano-${new Date().toISOString().split('T')[0]}.pdf`);
};
