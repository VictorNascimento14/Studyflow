import type { Subject } from '../types';

export interface AIStudyPlan {
    title: string;
    description: string;
    summary: {
        totalClasses: number;
        totalSubjects: number;
        hoursPerDay: number;
        daysPerWeek: number;
        estimatedWeeks: number;
    };
    weeklySchedule: {
        day: string;
        topics: {
            subject: string;
            subtopic: string;
            duration: string;
            priority: 'Alta' | 'Média' | 'Baixa';
            tips: string;
            technique: string;
        }[];
    }[];
    motivationalQuote: string;
    generalTips: string[];
    weeklyMilestones: string[];
}

const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const studyTechniques = [
    { name: 'Pomodoro', desc: '25min foco + 5min pausa' },
    { name: 'Feynman', desc: 'Ensine para aprender' },
    { name: 'Active Recall', desc: 'Teste sua memoria' },
    { name: 'Espacamento', desc: 'Revise em intervalos' },
    { name: 'Mapeamento Mental', desc: 'Conecte conceitos' },
    { name: 'Leitura Ativa', desc: 'Anote enquanto le' },
    { name: 'Metodo Cornell', desc: 'Divida suas notas' },
    { name: 'Chunking', desc: 'Divida em partes menores' },
    { name: 'Elaboracao', desc: 'Conecte com o que sabe' },
    { name: 'Interleaving', desc: 'Misture topicos' },
];

const studyTips = [
    'Comece pelo mais dificil quando sua energia esta alta.',
    'Faca resumos escritos a mao para melhor retencao.',
    'Explique o conteudo em voz alta como se ensinasse alguem.',
    'Use flashcards para conceitos-chave e formulas.',
    'Faca exercicios praticos apos cada sessao de teoria.',
    'Revise o conteudo do dia anterior antes de comecar.',
    'Alterne entre materias para manter o foco.',
    'Defina metas especificas para cada sessao de estudo.',
    'Elimine distracoes: celular no modo aviao.',
    'Faca pausas ativas: caminhe, alongue-se.',
    'Estude no mesmo horario todos os dias para criar habito.',
    'Use cores diferentes para destacar tipos de informacao.',
    'Crie acronimos ou frases para memorizar listas.',
    'Associe conceitos novos com imagens mentais.',
    'Faca perguntas sobre o material antes de estudar.',
    'Teste-se antes de olhar as respostas.',
    'Reescreva suas anotacoes com suas proprias palavras.',
    'Ensine o conteudo para um colega ou familiar.',
    'Use diagramas e graficos para visualizar conceitos.',
    'Grave audio explicando o conteudo e ouca depois.',
    'Estude em blocos de 45-50 minutos com pausas.',
    'Revise erros de provas anteriores antes de estudar.',
    'Conecte o conteudo com situacoes do dia a dia.',
    'Use apps de flashcard como Anki para revisao espacada.',
    'Faca simulados cronometrados para treinar pressao.',
    'Identifique seu horario de pico de concentracao.',
    'Varie o local de estudo para melhorar memorizacao.',
    'Use a tecnica do palacio da memoria para listas.',
    'Leia os titulos e subtitulos antes de ler o texto.',
    'Faca perguntas "por que" e "como" sobre o conteudo.',
    'Crie mapas conceituais conectando ideias principais.',
    'Use post-its para revisar enquanto anda pela casa.',
    'Pratique a escrita ativa: resuma cada paragrafo.',
    'Durma apos estudar para consolidar a memoria.',
    'Use a tecnica SQ3R: Survey, Question, Read, Recite, Review.',
    'Mantenha um diario de estudos para acompanhar progresso.',
];

const generalTips = [
    'Mantenha-se hidratado - beba agua a cada hora de estudo.',
    'Durma 7-8 horas - o sono consolida a memoria.',
    'Defina metas SMART: Especificas, Mensuraveis e com Prazo.',
    'Desative notificacoes durante os blocos de estudo.',
    'Exercicio fisico melhora a concentracao e memoria.',
    'Alimentacao leve ajuda na concentracao.',
    'Revise seu progresso no fim de cada dia.',
    'Musica instrumental pode ajudar na concentracao.',
    'A luz natural melhora o foco e o humor.',
    'Evite estudar deitado - associe a cama ao descanso.',
    'Organize seu espaco de estudo antes de comecar.',
    'Tenha todos os materiais prontos antes de iniciar.',
    'Use o metodo 2-minutos: se leva 2min, faca agora.',
    'Celebre pequenas conquistas para manter motivacao.',
    'Faca alongamentos a cada hora de estudo.',
    'Evite cafeina excessiva - pode atrapalhar o sono.',
    'Pratique respiracao profunda antes de comecar.',
    'Use apps de bloqueio de sites durante o estudo.',
    'Estude em grupo ocasionalmente para novas perspectivas.',
    'Tenha um parceiro de estudos para accountability.',
    'Recompense-se apos completar sessoes dificeis.',
    'Planeje seu dia na noite anterior.',
    'Identifique e elimine seus maiores desperdicadores de tempo.',
    'Use o principio 80/20: foque no que da mais resultado.',
];

const motivationalQuotes = [
    '"O sucesso e a soma de pequenos esforcos repetidos dia apos dia." - Robert Collier',
    '"A educacao e a arma mais poderosa que voce pode usar para mudar o mundo." - Nelson Mandela',
    '"O unico lugar onde o sucesso vem antes do trabalho e no dicionario." - Vidal Sassoon',
    '"Nao importa quao devagar voce va, desde que nao pare." - Confucio',
    '"A persistencia e o caminho do exito." - Charles Chaplin',
    '"Estudar e como remar contra a correnteza: parar e retroceder." - Proverbio Chines',
    '"O conhecimento e a unica coisa que ninguem pode tirar de voce." - B.B. King',
    '"Voce nao precisa ser perfeito para comecar, mas precisa comecar para ser excelente." - Zig Ziglar',
    '"O futuro pertence aqueles que acreditam na beleza de seus sonhos." - Eleanor Roosevelt',
    '"Cada dia e uma nova oportunidade de aprender algo novo." - Anonimo',
    '"A disciplina e a ponte entre metas e realizacoes." - Jim Rohn',
    '"O segredo para avancar e comecar." - Mark Twain',
    '"Nao espere por oportunidades, crie-as." - George Bernard Shaw',
    '"A unica maneira de fazer um otimo trabalho e amar o que voce faz." - Steve Jobs',
    '"Acredite que voce pode e voce ja esta no meio do caminho." - Theodore Roosevelt',
    '"O sucesso nao e definitivo, o fracasso nao e fatal: o que conta e a coragem de continuar." - Winston Churchill',
    '"A mente que se abre a uma nova ideia jamais volta ao seu tamanho original." - Albert Einstein',
    '"Educacao nao e preparacao para a vida; educacao e a propria vida." - John Dewey',
    '"O maior inimigo do conhecimento nao e a ignorancia, e a ilusao do conhecimento." - Stephen Hawking',
    '"Voce e o que voce faz repetidamente. Excelencia, portanto, nao e um ato, mas um habito." - Aristoteles',
    '"A diferenca entre o ordinario e o extraordinario e aquele pequeno extra." - Jimmy Johnson',
    '"Nunca e tarde demais para ser o que voce poderia ter sido." - George Eliot',
    '"O sucesso e ir de fracasso em fracasso sem perder o entusiasmo." - Winston Churchill',
    '"A melhor maneira de prever o futuro e cria-lo." - Peter Drucker',
    '"Conhecimento nao e poder. Conhecimento aplicado e poder." - Jim Kwik',
];

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function getPriority(classesLeft: number, maxClasses: number): 'Alta' | 'Média' | 'Baixa' {
    const ratio = classesLeft / maxClasses;
    if (ratio > 0.6) return 'Alta';
    if (ratio > 0.3) return 'Média';
    return 'Baixa';
}

export function generateStudyPlanLocal(
    subjects: Subject[],
    hoursPerDay: number,
    studyDays: number[]
): AIStudyPlan {
    const validSubjects = subjects.filter(s => s.name.trim() !== '');
    const totalMissedClasses = validSubjects.reduce((sum, s) => sum + (s.missedClasses || 0), 0);
    const minutesPerDay = hoursPerDay * 60;
    const maxClasses = Math.max(...validSubjects.map(s => s.missedClasses || 0), 1);

    // Sort subjects by missed classes (highest first = higher priority)
    const sortedSubjects = [...validSubjects].sort((a, b) => (b.missedClasses || 0) - (a.missedClasses || 0));

    // Calculate estimates
    const estimatedMinutesPerClass = 45;
    const totalMinutesNeeded = totalMissedClasses * estimatedMinutesPerClass;
    const daysNeeded = Math.ceil(totalMinutesNeeded / minutesPerDay);
    const weeksNeeded = Math.max(1, Math.ceil(daysNeeded / studyDays.length));

    // Create weekly schedule
    const weeklySchedule: AIStudyPlan['weeklySchedule'] = [];
    let techniqueIndex = 0;
    let tipIndex = 0;

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        if (!studyDays.includes(dayIdx)) continue;

        const dayTopics: AIStudyPlan['weeklySchedule'][0]['topics'] = [];
        let remainingMinutes = minutesPerDay;

        // Distribute subjects across the day (max 3-4 subjects per day for focus)
        const subjectsToday = Math.min(sortedSubjects.length, 3);
        const minutesPerSubject = Math.floor(remainingMinutes / subjectsToday);

        for (let i = 0; i < subjectsToday && remainingMinutes >= 30; i++) {
            const subject = sortedSubjects[i % sortedSubjects.length];
            const classesToCover = Math.ceil(minutesPerSubject / estimatedMinutesPerClass);
            const sessionMinutes = Math.min(minutesPerSubject, remainingMinutes);

            const technique = studyTechniques[techniqueIndex % studyTechniques.length];
            techniqueIndex++;

            dayTopics.push({
                subject: subject.name,
                subtopic: `Módulo ${i + 1}: Revisão de ${classesToCover} aula${classesToCover > 1 ? 's' : ''}`,
                duration: formatDuration(sessionMinutes),
                priority: getPriority(subject.missedClasses || 0, maxClasses),
                tips: studyTips[tipIndex % studyTips.length],
                technique: `${technique.name}: ${technique.desc}`,
            });

            tipIndex++;
            remainingMinutes -= sessionMinutes;
        }

        if (dayTopics.length > 0) {
            weeklySchedule.push({
                day: dayNames[dayIdx],
                topics: dayTopics,
            });
        }
    }

    // Create weekly milestones
    const weeklyMilestones = sortedSubjects.slice(0, 4).map((s, i) =>
        `Semana ${i + 1}: Dominar os conceitos fundamentais de ${s.name}`
    );

    return {
        title: `Operação Recuperação: ${totalMissedClasses} Aulas em ${weeksNeeded} Semana${weeksNeeded > 1 ? 's' : ''}`,
        description: `Este plano personalizado foi elaborado para você recuperar ${totalMissedClasses} aulas atrasadas em ${validSubjects.length} disciplina${validSubjects.length > 1 ? 's' : ''}, dedicando ${hoursPerDay}h por dia durante ${studyDays.length} dias por semana. Siga o cronograma com disciplina e você alcançará seu objetivo!`,
        summary: {
            totalClasses: totalMissedClasses,
            totalSubjects: validSubjects.length,
            hoursPerDay: hoursPerDay,
            daysPerWeek: studyDays.length,
            estimatedWeeks: weeksNeeded,
        },
        weeklySchedule,
        motivationalQuote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
        generalTips: generalTips.slice(0, 6),
        weeklyMilestones,
    };
}
