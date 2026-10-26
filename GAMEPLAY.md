# Progressão, equipamentos e economia · versão 3

Desenvolvimento com Node.js 24:

```sh
npm ci
npm test
npm run build
npm run dev -- --host 127.0.0.1
```

## A rota avança por vitórias

O calendário não bloqueia bosses. Cada submapa tem quatro etapas de inimigos e um boss. Uma etapa só libera a seguinte após atingir sua quantidade de vitórias. Cada combate custa uma energia; fugir ou perder gasta a tentativa sem avançar a rota. Descanso e eventos de exploração mantêm o custo original de 1 energia; fragmentos continuam sendo convertidos de 5 em 5 para ganhar uma energia.

O orçamento de referência é **8 energias × duração do submapa**, incluindo uma reserva para os custos originais de descanso e eventos. Para não alterar essas regras, cerca de dois terços do orçamento são combates. No primeiro submapa, são **4 + 4 + 4 + 3 encontros + 1 boss = 16 vitórias**, com referência de aproximadamente 24 energias totais (3 dias a 8 por dia). O gasto real depende de descansos, eventos, derrotas e equipamentos. Não há espera por data.

| Região | Primeiro submapa | Segundo submapa | Terceiro submapa |
| --- | --- | --- | --- |
| Floresta Sombria | Trilha dos Sussurros: 24 energias (~3 dias) | Ruínas Enraizadas: 40 (~5 dias) | Coração da Floresta: 56 (~7 dias) |
| Deserto das Cinzas | Dunas Errantes: 80 (~10 dias) | Necrópole Solar: 112 (~14 dias) | Templo das Cinzas: 144 (~18 dias) |
| Tundra Congelada | Passagem da Geada: 168 (~21 dias) | Cavernas de Cristal: 200 (~25 dias) | Cidadela do Inverno: 224 (~28 dias) |
| Terras Vulcânicas | Campos de Obsidiana: 256 (~32 dias) | Forja Esquecida: 280 (~35 dias) | Cratera do Despertar: 312 (~39 dias) |
| Abismo | Margem do Vazio: 336 (~42 dias) | Labirinto dos Ecos: 368 (~46 dias) | Trono do Abismo: 392 (~49 dias) |

Cada combate tem um identificador único. Uma vitória não pode ser contabilizada duas vezes, mesmo quando uma etapa exige vários encontros. As vitórias parciais persistem após recarregar. Etapas concluídas em saves anteriores continuam concluídas; não é necessário refazê-las por causa da alteração de regras.

## Escada de dificuldade

As 75 etapas possuem estatísticas crescentes. A vida e o dano mínimo da variante mais fraca de uma etapa superam os da variante mais forte da etapa anterior, inclusive na transição entre submapas e regiões. Não se sorteia um mob fraco de uma etapa anterior. Os nomes exibem espécie, graduação e área.

Bosses têm mais vida e 10% de crítico. Lobos/cavaleiros podem causar sangramento; aranhas/cobras/escorpiões podem envenenar. Os bônus de santuário e pets continuam ativos. A primeira vitória de cada boss entrega um troféu de arma da classe; repetir um boss não duplica esse prêmio nem a contagem de bosses únicos.

## Classes equivalentes

| Classe | Especialidade |
| --- | --- |
| Mago | +4% dano e +2% vida |
| Ninja | +8 pontos percentuais de crítico e +2 de esquiva |
| Arqueiro | +2% dano, +4 pontos percentuais de crítico e +2 de esquiva |

Os bônus são recalculados a partir dos atributos base e do equipamento, sem acumular ao recarregar. O crítico padrão causa 1,5× dano. Os testes com diferentes patamares de ataque, vida, defesa inimiga e crítico base limitam a diferença de dano esperado entre classes a 3% e de vida efetiva a 2%.

As cinco raridades de arma de cada classe têm ataque 3, 10, 22, 40 e 65. Armas exclusivas só podem ser equipadas pela classe correspondente. As ilustrações de cajados, katanas, arcos e armaduras variam conforme a raridade; elmos, botas e acessórios também têm imagem. O atlas de 25 artes está em `public/items/equipment-atlas.png`.

Os retratos do personagem acompanham sua classe na criação, no acampamento, no perfil, no inventário e no combate. As três artes ficam em `public/characters/`: mago ancião com cajado, arqueiro adulto jovem com arco e ninja adulto jovem com katana. Nenhum retrato contém pet embutido. O sistema de companheiros continua separado do retrato. Saves com a antiga imagem fixa também passam a usar a classe escolhida.

## Economia e loja

| Raridade | Arma | Armadura | Nível | Bosses únicos mínimos |
| --- | --- | --- | --- | --- |
| Comum | 160 ouro | 130 ouro | 1 | 0 |
| Rara | 1.600 | 1.300 | 5 | 1 |
| Épica | 12.000 | 10.000 | 12 | 4 |
| Lendária | 75.000 | 60.000 | 25 | 8 |
| Mítica | 350.000 | 280.000 | 40 | 12 |

- Venda: 12% do preço base, menos taxa de 2 ouro. Requer os 2 ouro antes da operação.
- Troca: converte uma arma de outra classe em uma da própria classe, mantendo a raridade. Consome a arma e 10% de seu valor base, com mínimo de 25 ouro. Melhorias não são transferidas.
- Equipamentos vestidos não podem ser vendidos ou trocados. Remova gemas antes de negociar.
- Comprar e revender sempre perde ouro. Repetir a mesma venda/troca é rejeitado. Todas as operações atualizam inventário e saldo atomicamente e mantêm histórico.
- O acampamento mantém a regra original: **1 energia para restaurar toda a vida**, sem cobrar ouro nem mexer no saldo de fragmentos. O ajuste de energia infinita mantém seu comportamento original.
- Na primeira etapa, mobs dão 9–13 ouro. A receita cresce junto da dificuldade. O descanso não cobra ouro.
- Lootboxes legadas custam 1.000, 6.000, 22.000 e 95.000 ouro; os preços antigos que permitiam lucro esperado por revenda foram removidos.
- Drops acumulados: comum até 12%, raro até 4%, épico até 1%, lendário até 0,2%. As tabelas de cada região limitam quais raridades podem cair. Prêmios de primeira vitória de bosses são separados.

São preços de progressão, materiais e consumos coerentes entre si; inflação e duração real ainda devem ser acompanhadas com partidas variadas. O ouro já existente nos saves não é apagado.

## Forja funcional

Selecione um equipamento em **Castelo → Forja** para ver custo, chance e materiais.

**Desmantelar:** exige um item desequipado e confirmação. Remove a instância e entrega `1 + piso(nível de melhoria / 3)` cristais da mesma raridade. Se houver uma gema, ela é devolvida ao inventário. Não pode desmantelar duas vezes a mesma instância ou fazê-lo em combate.

**Refinar:** atualiza tanto itens do inventário quanto equipamentos vestidos, recalculando os atributos. O nível máximo é +10. Custo em cristais: `teto(nível alvo / 3)`. O ouro cresce com o nível e a raridade. A chance começa em 100% e termina em 30%. Uma falha preserva o nível do item, mas consome ouro e cristais. Havendo Pedra de Proteção, uma unidade é consumida para preservar os cristais da tentativa que falhou; o ouro ainda é gasto. A interface mostra o resultado real da operação, sem retorno assíncrono de sucesso fictício.

## Layout e validação

A composição original do acampamento, dos mapas e da forja foi restaurada. Permanecem as artes por classe, a progressão por vitórias e as ações de loja/desmantelamento solicitadas. A navegação compacta cobre celulares e tablets; computadores usam a navegação horizontal. Modais têm rolagem interna e limites de altura; overlays de combate/mapa rolam sem cortar os controles.

`npm test` verifica orçamento por submapa, progressão parcial/idempotência, escada dos mobs, equivalência das classes, migração, preços, transações, descanso, desmantelamento, gemas e refinamento. Testes no Chromium exercitam as telas em 360, 768, 1024, 1440 e 1920 pixels, além das operações reais de inventário, forja e compra. Login Google/sincronização remota não integram esses testes locais.

Publicação: consulte `PREVIEW.md`. O mercado continua sendo de NPCs, com regras locais. Uma economia multijogador exigiria validação de transações em servidor.
