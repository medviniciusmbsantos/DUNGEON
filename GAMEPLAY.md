# Classes, campanha e mercado

Use Node.js 24 para o desenvolvimento e os testes deste ambiente.

```sh
npm ci
npm test
npm run build
npm run dev -- --host 127.0.0.1
```

O projeto original tinha `web-push` no manifesto, mas não no lockfile. O lockfile foi sincronizado para permitir `npm ci`, preservando as versões das dependências existentes.

## Classes

A seleção aparece junto do nome no início do jogo. Personagens existentes escolhem uma classe ao carregar e mantêm seu progresso e seus itens. A arma anterior vai para o inventário. A escolha é permanente por personagem.

| Classe | Bônus permanente | Armas exclusivas |
| --- | --- | --- |
| Mago | +2 ataque, +15 vida | Cajados, cetro, orbe |
| Ninja | +6 pontos percentuais de crítico, +4 de esquiva | Katanas, lâminas, garras |
| Arqueiro | +1 ataque, +6 pontos percentuais de esquiva | Arcos |

Cada classe tem cinco armas progressivas. Armaduras são universais. Os bônus de classe são recalculados sem acumular a cada recarga ou troca de equipamento. Armas antigas sem restrição continuam utilizáveis.

## Submapas e dias

São cinco regiões com três submapas cada, quatro encontros e um boss em cada submapa: 75 etapas e 15 bosses.

Os prazos são **por submapa**, não por região. Contam dias distintos de exploração no fuso de São Paulo, registrados quando o jogador entra em um encontro válido. Repetir encontros no mesmo dia não adiciona dias. O dia atual pode contar ao explorar uma área já desbloqueada. Dias sem jogar não reiniciam o contador. Entrar em submapas bloqueados não registra progresso.

| Região | Primeiro submapa | Segundo submapa | Terceiro submapa |
| --- | --- | --- | --- |
| Floresta Sombria | Trilha dos Sussurros: 3 dias | Ruínas Enraizadas: 5 dias | Coração da Floresta: 7 dias |
| Deserto das Cinzas | Dunas Errantes: 10 dias | Necrópole Solar: 14 dias | Templo das Cinzas: 18 dias |
| Tundra Congelada | Passagem da Geada: 21 dias | Cavernas de Cristal: 25 dias | Cidadela do Inverno: 28 dias |
| Terras Vulcânicas | Campos de Obsidiana: 32 dias | Forja Esquecida: 35 dias | Cratera do Despertar: 39 dias |
| Abismo | Margem do Vazio: 42 dias | Labirinto dos Ecos: 46 dias | Trono do Abismo: 49 dias |

Os dias anteriores não são transferidos ao próximo submapa. É necessário vencer as etapas em ordem e cumprir os dias do submapa para enfrentar seu boss. Concluir todos os 15 encontros abre a próxima região. Um dia em que duas áreas foram exploradas após um desbloqueio pode contar em ambas.

Bosses sempre geram combate, sem substituir o encontro por mercador ou baú. A primeira vitória entrega uma arma da classe do jogador, com tier da região e +1, +2 ou +3 ataque adicional conforme o submapa, além do nome do boss no troféu. Repetições dão as recompensas normais de combate, mas não duplicam a recompensa de primeira vitória. Lobos e cavaleiros podem causar sangramento; aranhas, cobras e o Escorpião Imperial podem envenenar.

Áreas concluídas em saves antigos continuam concluídas; uma região antiga totalmente concluída permanece concluída na campanha ampliada. Para saves parciais, são preservadas as etapas já vencidas.

## Economia inicial

A loja real fica em Castelo → Loja, mantendo a forja existente.

| Raridade | Arma | Armadura | Nível mínimo |
| --- | --- | --- | --- |
| Comum | 60 ouro | 45 ouro | 1 |
| Rara | 180 ouro | 140 ouro | 3 |
| Épica | 420 ouro | 320 ouro | 5 |
| Lendária | 900 ouro | 700 ouro | 8 |
| Mítica | 1.800 ouro | 1.400 ouro | 12 |

- Venda: paga 25% do preço base do tier, menos uma taxa de 2 ouro. É necessário já possuir os 2 ouro antes de vender.
- Troca: uma arma de outra classe + 25 ouro gera uma arma da própria classe na mesma raridade. A arma original é consumida; melhorias não são transferidas.
- Itens equipados não podem ser negociados. Gemas precisam ser removidas antes de vender ou trocar.
- Comprar entrega uma instância única ao inventário e desconta o saldo na mesma atualização de estado. Repetir uma venda ou troca com o mesmo ID é rejeitado.
- Comprar e revender sempre perde ouro, mesmo com melhorias. Receitas, despesas e os últimos 50 registros de negociação persistem no save local e no estado sincronizado.

Na primeira área, mobs dão 6–10 ouro e o boss 24–34. Uma armadura comum custa aproximadamente seis vitórias normais; uma arma, oito. Equipamentos, taxas e forja consomem ouro. Os valores são uma calibração inicial; retenção e inflação precisam de acompanhamento com partidas reais.

## Validação

`npm test` verifica classes, prazos por submapa, contagem diária, migração, desbloqueios, primeira vitória, economia e conclusão sequencial das 75 etapas. Requer Node.js com suporte a remoção de tipos TypeScript (o ambiente usa Node.js 24).

O fluxo também foi exercitado em Chromium desktop e celular: criação nas três classes, persistência de atributos, vitória em combate, compra, venda, troca e histórico. Autenticação Google e sincronização real com Supabase não fazem parte desses testes locais.

As regras são aplicadas no cliente, como no projeto original. Uma economia compartilhada entre jogadores exigiria validar as transações em um servidor; o mercado atual negocia com NPCs.
