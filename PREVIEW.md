# Preview no GitHub Pages

O aplicativo é publicado a partir da branch `gh-pages`, com a versão compilada diretamente na raiz. A branch `main` contém o código-fonte completo.

Para ativar a primeira publicação:

1. Abra https://github.com/medviniciusmbsantos/DUNGEON/settings/pages
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Escolha **gh-pages**, pasta **/(root)**, e clique em **Save**.
4. Aguarde o workflow **pages build and deployment** concluir na aba Actions.

O endereço esperado após a publicação é https://medviniciusmbsantos.github.io/DUNGEON/. Ele só estará disponível depois que o Pages estiver ativado e o deploy concluir. A existência da branch, por si só, não confirma que o site está no ar.

Use **Experimentar sem conta** para criar um personagem e testar as classes, mapas e loja. O progresso é salvo neste navegador. Login Google continua disponível, mas o provedor OAuth precisa autorizar o endereço publicado para que esse fluxo remoto funcione.

A compilação foi validada localmente em `/DUNGEON/`, incluindo imagens, manifesto, escopo do service worker e persistência do personagem. Os arquivos públicos usam caminhos relativos para funcionar tanto na raiz quanto na pasta do GitHub Pages.

Novas mudanças no código precisam de `npm run build` e atualização da branch `gh-pages`; enviar somente para `main` não atualiza automaticamente esse preview.
