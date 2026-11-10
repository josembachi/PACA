# Arquitectura PACA

## Visão geral

O PACA deve funcionar como uma plataforma educativa multi-tenant com quatro pilares:

- Autenticação e perfis
- Marketplace educativo
- Comunicação e colaboração em tempo real
- Financeiro e reputação

## Stack recomendada

- Frontend: Next.js + React + TypeScript
- Estilo: Tailwind CSS
- Backend/APIs: Next.js App Router + Server Actions/Route Handlers
- Dados: PostgreSQL/Supabase
- Realtime: Supabase Realtime / WebSockets
- Storage: Supabase Storage
- Chamadas: WebRTC
- Desktop: Electron
- Mobile: React Native
- IA: adaptadores modulares para Groq/OpenAI

## Estrutura modular proposta

```text
src/
  app/
    api/
    auth/
    dashboard/
    marketplace/
    classroom/
    chat/
    admin/
  components/
    shared/
    auth/
    marketplace/
    learning/
    communication/
    finance/
  hooks/
  lib/
  providers/
  services/
  shared/
```

## Princípios de desenho

- Separar domínio, serviço e interface.
- Usar providers para estado global e sessão.
- Validar todos os inputs no servidor.
- Aplicar RLS e autorização por perfil.
- Usar variáveis de ambiente para segredos.
- Manter a UI funcional sem depender de APIs externas de produção.

## Fluxo principal

1. Utilizador autentica-se.
2. O perfil define os papéis aluno/professor.
3. O aluno pesquisa e contrata serviços.
4. O professor recebe pedidos e agenda aulas.
5. Comunicação, materiais e pagamentos ficam associados ao contrato.
6. Avaliação e reputação influenciam o ranking.

## Decisões actuais

- A base do projecto já usa Next.js e Supabase e foi preservada.
- A melhoria principal neste ponto foi estabilizar a stack e preparar a arquitetura para expansão, sem quebrar aquilo que já funciona.
- Os módulos de IA e de comunicação foram mantidos, mas passam a funcionar com fallback quando não existem chaves externas.
