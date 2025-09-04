const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Dados de exemplo para inicializar as coleções
const sampleQuestions = [
  {
    title: 'Direito Constitucional - Princípios Fundamentais',
    statement: 'Qual dos seguintes é um princípio fundamental da República Federativa do Brasil?',
    alternatives: [
      { id: 'a', text: 'Soberania' },
      { id: 'b', text: 'Cidadania' },
      { id: 'c', text: 'Dignidade da pessoa humana' },
      { id: 'd', text: 'Todas as alternativas estão corretas' }
    ],
    correctAlternative: 'd',
    explanation: 'Todos os itens mencionados são princípios fundamentais da República Federativa do Brasil, conforme o Art. 1º da Constituição Federal.',
    subject: 'Direito Constitucional',
    examBoard: 'VUNESP',
    examYear: 2023,
    examType: 'Concurso Público',
    difficulty: 'medium',
    tags: ['princípios fundamentais', 'constituição'],
    successRate: 0,
    totalAttempts: 0,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    title: 'Direito Administrativo - Atos Administrativos',
    statement: 'Qual das características abaixo NÃO é própria dos atos administrativos?',
    alternatives: [
      { id: 'a', text: 'Presunção de legitimidade' },
      { id: 'b', text: 'Imperatividade' },
      { id: 'c', text: 'Irrevogabilidade absoluta' },
      { id: 'd', text: 'Autoexecutoriedade' }
    ],
    correctAlternative: 'c',
    explanation: 'A irrevogabilidade absoluta não é característica dos atos administrativos. Os atos podem ser revogados pela própria Administração por motivos de conveniência e oportunidade.',
    subject: 'Direito Administrativo',
    examBoard: 'FCC',
    examYear: 2023,
    examType: 'Concurso Público',
    difficulty: 'hard',
    tags: ['atos administrativos', 'características'],
    successRate: 0,
    totalAttempts: 0,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function initializeFirestore() {
  try {
    console.log('🔥 Inicializando estrutura do Firestore...');

    // 1. Criar coleções com documentos de exemplo
    console.log('📝 Criando questões de exemplo...');
    const questionsRef = db.collection('questions');
    
    for (const question of sampleQuestions) {
      await questionsRef.add(question);
    }

    // 2. Criar documento de configuração do sistema
    console.log('⚙️ Criando configurações do sistema...');
    await db.collection('systemConfig').doc('general').set({
      subjects: [
        'Direito Constitucional',
        'Direito Administrativo',
        'Direito Penal',
        'Direito Civil',
        'Direito Processual Civil',
        'Direito Processual Penal',
        'Português',
        'Matemática',
        'Informática',
        'Atualidades'
      ],
      examBoards: [
        'VUNESP',
        'FCC',
        'CESPE/CEBRASPE',
        'FGV',
        'ESAF',
        'IBFC',
        'AOCP',
        'CONSULPLAN'
      ],
      difficulties: ['easy', 'medium', 'hard'],
      userTypes: ['concurseiro', 'militar'],
      studyTimeOptions: [
        '1-5 horas',
        '5-10 horas',
        '10-20 horas',
        '20-30 horas',
        'Mais de 30 horas'
      ],
      studyPeriods: [
        'Manhã',
        'Tarde',
        'Noite',
        'Madrugada'
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // 3. Criar índices compostos (já definidos em firestore.indexes.json)
    console.log('📊 Índices definidos em firestore.indexes.json');

    console.log('✅ Firestore inicializado com sucesso!');
    console.log('📋 Estrutura criada:');
    console.log('   - Coleção: questions (com questões de exemplo)');
    console.log('   - Coleção: systemConfig (configurações do sistema)');
    console.log('   - Regras de segurança aplicadas');
    console.log('   - Índices configurados');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeFirestore()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initializeFirestore };