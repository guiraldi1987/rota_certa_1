# Estrutura do Firestore - ROTA CERTA

Este documento descreve a estrutura completa das coleções do Firestore, regras de segurança e índices para o sistema ROTA CERTA.

## 📊 Coleções Principais

### 1. **users** - Dados básicos dos usuários
```typescript
interface User {
  id: string;                    // ID único do usuário (Firebase Auth UID)
  email: string;                 // Email do usuário
  firstName?: string;            // Primeiro nome
  lastName?: string;             // Sobrenome
  profileImageUrl?: string;      // URL da foto de perfil
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Data da última atualização
}
```

**Regras de Segurança:**
- ✅ Usuários podem ler/escrever apenas seus próprios dados
- ❌ Não podem acessar dados de outros usuários

### 2. **userProfiles** - Perfis detalhados dos usuários
```typescript
interface UserProfile {
  id: string;                           // ID único do perfil
  userId: string;                       // Referência ao usuário (users.id)
  userType: "concurseiro" | "militar";  // Tipo de usuário
  goals: string[];                      // Objetivos do usuário
  weeklyHours: string;                  // Horas de estudo por semana
  studyTimes: string[];                 // Períodos de estudo preferidos
  subjects: string[];                   // Matérias de interesse
  onboardingCompleted: boolean;         // Se completou o onboarding
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Regras de Segurança:**
- ✅ Usuários podem acessar apenas seu próprio perfil
- ✅ Podem criar perfil apenas para si mesmos

### 3. **questions** - Banco de questões
```typescript
interface Question {
  id: string;                                    // ID único da questão
  title: string;                                 // Título da questão
  statement: string;                             // Enunciado
  alternatives: { id: string; text: string; }[]; // Alternativas
  correctAlternative: string;                    // ID da alternativa correta
  explanation?: string;                          // Explicação da resposta
  subject: string;                               // Matéria
  examBoard?: string;                            // Banca examinadora
  examYear?: number;                             // Ano do concurso
  examType?: string;                             // Tipo de concurso
  difficulty: "easy" | "medium" | "hard";        // Nível de dificuldade
  tags: string[];                                // Tags para categorização
  successRate: number;                           // Taxa de acerto (0-1)
  totalAttempts: number;                         // Total de tentativas
  isActive: boolean;                             // Se a questão está ativa
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Regras de Segurança:**
- ✅ Usuários autenticados podem ler todas as questões
- ✅ Usuários autenticados podem criar/editar questões
- ❌ Não podem deletar questões (integridade dos dados)

### 4. **simulados** - Simulados dos usuários
```typescript
interface Simulado {
  id: string;                                                    // ID único
  userId: string;                                                // Dono do simulado
  title: string;                                                 // Título
  type: "diagnostic" | "practice" | "mock_exam";                 // Tipo
  subjects: string[];                                            // Matérias
  totalQuestions: number;                                        // Total de questões
  timeLimit?: number;                                            // Tempo limite (min)
  difficulty: "adaptive" | "easy" | "medium" | "hard";           // Dificuldade
  status: "not_started" | "in_progress" | "completed" | "abandoned"; // Status
  score?: number;                                                // Pontuação (%)
  correctAnswers: number;                                        // Acertos
  timeSpent?: number;                                            // Tempo gasto (seg)
  startedAt?: Timestamp;                                         // Início
  completedAt?: Timestamp;                                       // Conclusão
  questionIds: string[];                                         // IDs das questões
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Regras de Segurança:**
- ✅ Usuários podem acessar apenas seus próprios simulados
- ✅ Podem criar simulados apenas para si mesmos

### 5. **userAnswers** - Respostas dos usuários
```typescript
interface UserAnswer {
  id: string;                    // ID único
  userId: string;                // Usuário que respondeu
  questionId: string;            // Questão respondida
  simuladoId?: string;           // Simulado (se aplicável)
  selectedAlternative: string;   // Alternativa selecionada
  isCorrect: boolean;            // Se acertou
  timeSpent?: number;            // Tempo gasto (segundos)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Regras de Segurança:**
- ✅ Usuários podem acessar apenas suas próprias respostas
- ✅ Podem criar respostas apenas para si mesmos

### 6. **userStats** - Estatísticas dos usuários
```typescript
interface UserStats {
  id: string;              // ID único
  userId: string;          // Usuário das estatísticas
  subject: string;         // Matéria
  totalQuestions: number;  // Total de questões respondidas
  correctAnswers: number;  // Total de acertos
  averageTime: number;     // Tempo médio por questão (seg)
  successRate: number;     // Taxa de sucesso (0-1)
  lastUpdated: Timestamp;  // Última atualização
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Regras de Segurança:**
- ✅ Usuários podem acessar apenas suas próprias estatísticas
- ✅ Podem criar/atualizar estatísticas apenas para si mesmos

### 7. **systemConfig** - Configurações do sistema
```typescript
interface SystemConfig {
  subjects: string[];           // Lista de matérias disponíveis
  examBoards: string[];         // Bancas examinadoras
  difficulties: string[];       // Níveis de dificuldade
  userTypes: string[];          // Tipos de usuário
  studyTimeOptions: string[];   // Opções de tempo de estudo
  studyPeriods: string[];       // Períodos de estudo
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔒 Regras de Segurança

### Funções Helper
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth.uid == userId;
}

function isValidUser() {
  return isAuthenticated() && request.auth.uid != null;
}
```

### Princípios de Segurança
1. **Autenticação Obrigatória**: Todas as operações requerem usuário autenticado
2. **Isolamento de Dados**: Usuários só acessam seus próprios dados
3. **Integridade**: Questões não podem ser deletadas
4. **Auditoria**: Todos os documentos têm timestamps de criação/atualização

## 📈 Índices Otimizados

### Questions
- `subject + difficulty + isActive + createdAt`
- `examBoard + isActive + createdAt`

### Simulados
- `userId + createdAt`

### UserAnswers
- `userId + simuladoId + createdAt`
- `userId + questionId + createdAt`

### UserStats
- `userId + subject`

### UserProfiles
- `userId`

## 🚀 Como Inicializar

### 1. Aplicar Regras e Índices
```bash
# Deploy das regras de segurança
firebase deploy --only firestore:rules

# Deploy dos índices
firebase deploy --only firestore:indexes
```

### 2. Inicializar Dados
```bash
# Executar script de inicialização
node scripts/init-firestore.js
```

### 3. Verificar Estrutura
```bash
# Testar conexão
curl http://localhost:8080/api/test-firebase
```

## 📋 Checklist de Implementação

- [x] ✅ Esquemas TypeScript definidos
- [x] ✅ Regras de segurança configuradas
- [x] ✅ Índices otimizados criados
- [x] ✅ Script de inicialização desenvolvido
- [x] ✅ Validação Zod implementada
- [x] ✅ Coleções documentadas
- [x] ✅ Configuração Firebase aplicada

## 🔧 Manutenção

### Backup
- Configure backups automáticos no Firebase Console
- Exporte dados regularmente para análise

### Monitoramento
- Monitore uso de leitura/escrita
- Acompanhe performance das queries
- Verifique logs de segurança

### Escalabilidade
- Considere sharding para grandes volumes
- Otimize queries baseado em métricas
- Implemente cache quando necessário

---

**Estrutura criada e otimizada para o sistema ROTA CERTA** 🎯