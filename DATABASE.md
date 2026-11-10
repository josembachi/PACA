# Base de dados PACA

## Modelos principais

- users / profiles
- roles e permissões
- tutor_profiles
- student_profiles
- subjects
- courses
- modules
- lessons
- enrollments
- conversations
- participants
- messages
- attachments
- communities
- community_members
- calls
- notifications
- contracts
- payments
- escrow_transactions
- reviews
- audit_logs

## Regras e boas práticas

- Usar UUID para identificadores.
- Manter a lógica de perfil separada da autenticação.
- Definir índices em `user_id`, `conversation_id`, `course_id`, `contract_id`.
- Usar RLS por tabela.
- Guardar auditoria e logs para ações sensíveis.

## Observações

A base actual em [supabase_schema.sql](supabase_schema.sql) serve como ponto de partida, mas ainda precisa de expansão para cobrir finance, chat e comunidade em profundidade.
