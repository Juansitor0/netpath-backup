# Checklist — autenticação, registro e perfil profissional

## Objetivo do cenário

Construir uma jornada clara para que um profissional de redes consiga:

1. Criar uma conta local no NetPath com dados básicos.
2. Entrar novamente com email e senha.
3. Entrar novamente com uma conta local própria do NetPath.
4. Conectar o LinkedIn apenas quando desejar usar uma plataforma externa.
5. Anexar opcionalmente um currículo próprio ou usar um modelo preenchível.
6. Revisar e confirmar os dados antes de eles influenciarem a trilha profissional.

> **Regra principal:** o cadastro e o login do NetPath devem permanecer internos. LinkedIn é uma integração opcional, acionada somente pelo usuário.

## Estado atual

- [x] Tela dedicada `/login` publicada.
- [x] Tela dedicada `/register` publicada.
- [ ] Implementar autenticação local própria do NetPath como login principal.
- [ ] Usuário local é criado e autenticado diretamente pelo backend do NetPath.
- [x] Perfil profissional privado com upload de PDF e revisão publicado.
- [x] Dados extraídos do currículo são cifrados no servidor.
- [x] Backup privado do GitHub configurado.
- [ ] Conta local com email e senha.
- [ ] Verificação de email e recuperação de senha.
- [ ] Vinculação de identidade LinkedIn.
- [ ] Formulário de registro com os campos finais.
- [ ] Modelo de currículo disponível para download/preenchimento.
- [ ] Teste ponta a ponta do cenário de um novo cliente.

## Decisões de produto

### Métodos de entrada

- **Conta local NetPath:** email + senha, com cadastro e sessão próprios.
- **NetPath:** será o único método de conta interna, usando email e senha.
- **LinkedIn:** será uma conexão externa opcional, acionada somente pelo usuário; não será usado como substituto automático da conta local.
- **LinkedIn:** somente botão explícito “Conectar LinkedIn”; não será usado para login automático antes do consentimento.
- O mesmo usuário poderá ter mais de um método vinculado à mesma conta, desde que a vinculação seja confirmada.

### Dados do registro local

Campos obrigatórios:

- Nome completo.
- Idade.
- Cargo atual.
- Email.
- Senha.
- Confirmação de senha.
- Aceite dos termos e da política de privacidade.

Campo opcional:

- Currículo em PDF, com limite de tamanho e consentimento específico para processamento.

Regras propostas:

- Nome: 2–160 caracteres.
- Idade: inteiro entre 13 e 120; não armazenar data de nascimento sem necessidade do produto.
- Cargo: até 160 caracteres.
- Email: normalizado e único, sem diferenciação de maiúsculas/minúsculas.
- Senha: mínimo de 10 caracteres, com validação de confirmação; nunca salvar senha em texto puro.
- PDF: opcional, até 8 MB, com assinatura `%PDF-` validada no servidor.
- O cadastro deve funcionar sem conectar LinkedIn.

## Jornada do cliente — cenário completo

### 1. Primeiro acesso

- [ ] Cliente acessa `/` e entende a proposta do NetPath.
- [ ] Cliente escolhe **Criar conta** ou **Entrar**.
- [ ] Usuário que tentar acessar dados privados sem sessão é direcionado para `/login`.
- [ ] A tela informa claramente que o cadastro é local e que o LinkedIn é opcional.

### 2. Registro local

- [ ] `/register` exibe formulário com nome, idade, cargo, email, senha e confirmação.
- [ ] Há checkbox separado para aceitar termos e privacidade.
- [ ] Há opção “Adicionar currículo agora (opcional)”.
- [ ] O currículo pode ser ignorado sem bloquear a criação da conta.
- [ ] O formulário apresenta erros por campo sem apagar os dados preenchidos.
- [ ] Email duplicado recebe mensagem útil sem revelar dados de outra conta além do necessário.
- [ ] Senha é enviada somente por HTTPS e transformada em hash no servidor.
- [ ] Após o cadastro, a sessão é criada e o cliente entra no onboarding.
- [ ] O perfil inicial é criado com estado `not_started`.

### 3. Currículo opcional no registro

- [ ] O usuário pode anexar PDF durante o cadastro ou depois em “Meu perfil profissional”.
- [ ] O upload mostra nome, tamanho, progresso/estado e possibilidade de remover antes de concluir.
- [ ] O servidor valida tipo real, assinatura, tamanho e falha de leitura.
- [ ] A extração gera uma prévia editável.
- [ ] O usuário confirma os dados antes de alimentar nível, skills e recomendações.
- [ ] O PDF e os dados derivados ficam vinculados ao `userId`.
- [ ] Existe ação explícita para remover o currículo e os dados derivados.

### 4. Login local

- [ ] `/login` oferece email e senha para conta local.
- [ ] Mensagem de credencial inválida não revela se o email existe.
- [ ] Há “Esqueci minha senha”.
- [ ] Há fluxo de redefinição com token de uso único e expiração curta.
- [ ] Há proteção contra tentativas repetidas/rate limit.
- [ ] Login bem-sucedido retorna ao destino original ou à Home.
- [ ] Logout revoga a sessão local e limpa cookies de sessão.

### 5. Sessão local do NetPath

- [ ] O login principal usa email e senha cadastrados no NetPath.
- [ ] A sessão local usa cookie `HttpOnly`, `Secure` e `SameSite=None` no Preview HTTPS.
- [ ] Login bem-sucedido retorna ao destino original ou à Home.
- [ ] Logout revoga a sessão local e limpa cookies de sessão.
- [ ] A recuperação de senha usa token de uso único e expiração curta.
- [ ] O fluxo não depende de qualquer conta externa.

### 6. LinkedIn opcional

- [ ] Criar botão separado: **Conectar LinkedIn**.
- [ ] Exibir aviso de que o LinkedIn é opcional e não impede cadastro local.
- [ ] Solicitar somente escopos aprovados e necessários pelo aplicativo.
- [ ] Nunca raspar páginas do LinkedIn nem pedir senha do LinkedIn dentro do NetPath.
- [ ] Registrar `provider`, `providerUserId`, data da vinculação e escopos consentidos.
- [ ] Permitir desconectar LinkedIn sem excluir a conta local.
- [ ] Se o LinkedIn não liberar currículo completo, manter o upload manual como caminho principal.
- [ ] Importar apenas dados autorizados pelo provedor e mostrar prévia para confirmação.

### 7. Onboarding pós-cadastro

- [ ] Perguntar experiência, tecnologias, objetivo e disponibilidade.
- [ ] Se currículo foi confirmado, usar os dados como evidência inicial, não como verdade imutável.
- [ ] Mostrar nível recomendado e permitir confirmação/ajuste.
- [ ] Criar o primeiro próximo passo na trilha.
- [ ] Salvar progresso por usuário.

## Modelo de dados proposto

### `users`

Manter a tabela atual para o usuário canônico da aplicação. Contas locais não devem depender de um `openId` inventado como credencial.

### `local_credentials`

- `id`
- `userId`
- `emailNormalized` — único
- `passwordHash`
- `emailVerifiedAt`
- `failedLoginCount`
- `lockedUntil`
- `createdAt`
- `updatedAt`

### `auth_identities`

- `id`
- `userId`
- `provider` — `local`, `linkedin`
- `providerUserId`
- `providerEmail`
- `scopes`
- `linkedAt`
- `lastUsedAt`

### `local_sessions`

- `id`
- `userId`
- `tokenHash`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `lastSeenAt`

### `user_profiles`

Adicionar, quando necessário:

- `age`
- `registrationSource`
- `currentRoleTitle`
- `profileCompletedAt`

O currículo continua em `resume_documents`, sempre filtrado por `userId`.

## Segurança obrigatória

- [ ] Hash de senha com `scrypt`/Argon2id/bcrypt configurado no servidor; nunca usar hash simples.
- [ ] Cookie de sessão `HttpOnly`, `Secure` e `SameSite=None` no Preview HTTPS.
- [ ] Proteção CSRF para mutações baseadas em cookie.
- [ ] Rate limit para registro, login, recuperação e validação de email.
- [ ] Mensagens de erro que não permitam enumeração de contas.
- [ ] Tokens de email/redefinição armazenados apenas como hash.
- [ ] Segredo dedicado para cifragem de perfil, separado do segredo de sessão quando a configuração estiver disponível.
- [ ] Logs sem senha, token, currículo bruto ou conteúdo de LinkedIn.
- [ ] Exclusão revoga sessões, remove credenciais e arquiva/remover arquivos conforme a política definida.
- [ ] Consentimento separado para: criar conta, processar currículo e conectar LinkedIn.

## Modelo de currículo enviado ao cliente

- [x] Criar modelo inicial em `docs/templates/curriculo-netpath.md`.
- [ ] Permitir baixar o modelo pela tela de registro.
- [ ] Oferecer versão DOCX/PDF em etapa posterior.
- [ ] Orientar o usuário a preencher apenas informações profissionais necessárias.
- [ ] Incluir seção para projetos de laboratório, tecnologias, certificações e links.

## Ordem de desenvolvimento

### Fase A — contrato e banco

- [ ] Confirmar campos e mensagens do formulário.
- [ ] Criar tabelas `local_credentials`, `auth_identities` e `local_sessions`.
- [ ] Adicionar idade/cargo atual ao perfil.
- [ ] Definir a substituição do login atual pela sessão local, preservando os dados de produto necessários.

### Fase B — registro local

- [ ] Implementar schema de validação compartilhado.
- [ ] Implementar hash de senha e criação de sessão.
- [ ] Implementar formulário `/register` com currículo opcional.
- [ ] Implementar confirmação de email ou marcar o fluxo como etapa bloqueada antes de produção.

### Fase C — login e recuperação

- [ ] Implementar login local.
- [ ] Implementar logout unificado.
- [ ] Implementar recuperação de senha.
- [ ] Adicionar rate limit, auditoria e mensagens seguras.

### Fase D — LinkedIn opcional

- [ ] Validar aplicação OAuth e escopos disponíveis.
- [ ] Implementar callback OAuth separado para o LinkedIn.
- [ ] Salvar identidade vinculada sem copiar dados não autorizados.
- [ ] Mostrar prévia e solicitar confirmação.
- [ ] Implementar desconexão.

### Fase E — validação do cenário

- [ ] Novo cliente cria conta local sem currículo.
- [ ] Novo cliente cria conta local com currículo.
- [ ] Cliente sai e entra novamente com email/senha.
- [ ] Cliente recupera senha.
- [ ] Cliente entra novamente com email e senha locais.
- [ ] Cliente conecta/desconecta LinkedIn.
- [ ] Cliente confirma e remove currículo.
- [ ] Um usuário não consegue ler ou alterar dados de outro usuário.
- [ ] Backup e publicação permanecem atualizados.

## Critério de pronto do cenário

O cenário será considerado pronto quando um cliente novo conseguir criar uma conta local com nome, idade, cargo, email e senha, opcionalmente anexar um currículo baseado no modelo, sair e entrar novamente, conectar LinkedIn somente por ação explícita, revisar os dados importados e usar o NetPath sem depender de qualquer plataforma externa e sem que credenciais, currículo ou dados profissionais fiquem expostos a outro usuário.
