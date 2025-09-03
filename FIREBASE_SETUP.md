# Configuração do Firebase para ROTA CERTA

## Pré-requisitos

1. Conta no Firebase (https://firebase.google.com/)
2. Firebase CLI instalado globalmente (`npm install -g firebase-tools`)

## Passos para Configuração

### 1. Criar Projeto no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `rota-certa-dev` (ou outro nome de sua escolha)
4. Ative o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database

1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Selecione uma localização (ex: `southamerica-east1` para São Paulo)

### 3. Configurar Authentication

1. No console do Firebase, vá para "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative os provedores desejados:
   - Email/Password
   - Google (opcional)
   - Outros conforme necessário

### 4. Obter Credenciais do Projeto

#### Para o Cliente (Frontend):
1. No console do Firebase, vá para "Configurações do projeto" (ícone de engrenagem)
2. Na seção "Seus aplicativos", clique em "Adicionar app" > "Web"
3. Registre o app com nome "ROTA CERTA Web"
4. Copie as configurações e cole no arquivo `client/.env`:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### Para o Servidor (Backend):
1. No console do Firebase, vá para "Configurações do projeto" > "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. Extraia as informações e atualize o arquivo `.env`:

```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
```

### 5. Fazer Login no Firebase CLI

```bash
firebase login
```

### 6. Inicializar o Projeto Firebase

```bash
firebase init
```

Selecione:
- Firestore: Configure security rules and indexes files
- Emulators: Set up local emulators

### 7. Configurar Regras de Segurança

As regras já estão configuradas no arquivo `firestore.rules`. Para aplicá-las:

```bash
firebase deploy --only firestore:rules
```

### 8. Configurar Índices

Os índices já estão configurados no arquivo `firestore.indexes.json`. Para aplicá-los:

```bash
firebase deploy --only firestore:indexes
```

### 9. Executar Emuladores Localmente (Desenvolvimento)

Para desenvolvimento local, use os emuladores:

```bash
firebase emulators:start
```

Isso iniciará:
- Firestore Emulator na porta 8080
- Authentication Emulator na porta 9099
- Firebase UI na porta 4000

### 10. Testar a Integração

Após configurar tudo:

1. Inicie os emuladores: `firebase emulators:start`
2. Em outro terminal, inicie o servidor: `npm run dev`
3. Acesse http://localhost:5000
4. Teste o cadastro e login de usuários
5. Teste o fluxo de onboarding

## Estrutura de Dados no Firestore

### Coleções:

- `users` - Dados básicos dos usuários
- `userProfiles` - Perfis e preferências dos usuários
- `questions` - Banco de questões
- `simulados` - Simulados criados pelos usuários
- `userAnswers` - Respostas dos usuários às questões
- `userStats` - Estatísticas de desempenho dos usuários

## Comandos Úteis

```bash
# Ver logs do Firebase
firebase functions:log

# Fazer backup do Firestore
firebase firestore:export gs://seu-bucket/backup

# Restaurar backup do Firestore
firebase firestore:import gs://seu-bucket/backup

# Ver uso do projeto
firebase projects:list
```

## Segurança

- ✅ Regras de segurança configuradas
- ✅ Autenticação obrigatória para todas as operações
- ✅ Usuários só podem acessar seus próprios dados
- ✅ Validação de dados no servidor

## Próximos Passos

1. Configurar backup automático
2. Implementar monitoramento e alertas
3. Configurar ambiente de produção
4. Implementar cache para melhor performance