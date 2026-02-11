# Notas de Modelagem e Regras Operacionais – AutoBot FIPE

Este documento registra decisões de modelagem que impactam cálculos e integridade do AutoBot FIPE.

## 1. Catálogo de Veículos (FIPE Base)

O catálogo de veículos segue a hierarquia oficial da Tabela FIPE.

- `brands` armazena as marcas (ex: Toyota, Fiat).
- `car_models` armazena os modelos vinculados a uma marca (ex: Corolla, Pulse).
- `year_models` armazena as versões (ano + combustível) vinculadas a um modelo.

**Regra:** Um `year_model` só pode ser alvo de coleta de preços se existir no catálogo.
**Motivo:** Padroniza a base e evita duplicidade de nomes.

## 2. Cadastro e aprovação de lojas

- `store_submissions` armazena todas as solicitações de cadastro.
- `store_reviews` registra a decisão do coordenador.
- `stores` representa apenas o cadastro oficial ativo.

**Regra:** Uma loja só entra em operação se `status = 'APPROVED'` e `is_active = true`.
**Motivo:** Garante que apenas lojas homologadas participem das pesquisas.

## 3. Tarefas de pesquisa (distribuição)

- `research_tasks` são geradas semanalmente pelo coordenador.
- Cada tarefa vincula um pesquisador a uma loja aprovada.

**Regra:** Não pode haver duas tarefas ativas para o mesmo pesquisador na mesma loja e mesma semana.
**Motivo:** Evita duplicidade de atribuição e conflito de responsabilidade.

## 4. Coleta de preços (dado bruto)

- `price_observations` registra cada valor coletado em campo.
- A coleta exige: tarefa, veículo, valor positivo e foto da etiqueta.

**Regra:** `price_value > 0` e status inicial = `'PENDING'`.
**Motivo:** O dado bruto nunca vai direto à consulta pública; precisa passar por curadoria.

## 5. Curadoria e aprovação de preços

- `price_reviews` registra a decisão do coordenador.
- Aprovação: `status = 'APPROVED'` → entra no cálculo da média.
- Rejeição: `status = 'REJECTED'` + `rejection_reason`.

**Regra:** Um preço rejeitado não é excluído, apenas desconsiderado nas médias.
**Motivo:** Mantém rastreabilidade e permite auditoria futura.

## 6. Batch mensal (cálculo das médias FIPE)

O processo batch executa mensalmente o cálculo dos preços médios.

**Fonte:** `price_observations` com `status = 'APPROVED'`
**Destino:** `monthly_price_averages`

**Chave de agregação única:** `(month_reference, year_model_id)`
**Campos:** `avg_price`, `sample_size`, `min_price`, `max_price`

**Motivo:** Garante que não haja duplicidade de médias para o mesmo veículo no mesmo mês.

## 7. Consulta pública (frontend)

A consulta pública não acessa diretamente `price_observations`.

- Usuário seleciona: Marca → Modelo → Ano
- Sistema consulta `monthly_price_averages`
- Preço exibido é o mais recente disponível

**Regra:** Toda consulta é registrada em `public_queries_log`, mesmo sem resultados.
**Motivo:** Permite análises de demanda (ex: "quais veículos foram buscados e não encontraram preço?").

## 8. Auditoria e rastreabilidade

| Entidade | O que registra |
|----------|----------------|
| `store_reviews` | Decisões sobre cadastro de lojas |
| `price_reviews` | Decisões sobre preços coletados |
| `batch_runs` | Execuções do processo mensal |
| `public_queries_log` | Consultas no portal público |

**Motivo:** Permite diagnóstico e análise sem acesso ao código-fonte.