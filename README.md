# LangChain e LangGraph — material de aula

Site educacional em português, feito com HTML, CSS e JavaScript puro. Os diagramas e simuladores funcionam sem conexão, sem instalação e sem chaves de API.

## Abrir

Abra `index.html` no navegador. Também é possível servir a pasta com:

```powershell
python -m http.server 8000
```

Execute o comando acima a partir da raiz do projeto e acesse `http://localhost:8000`. Use `Ctrl+C` para encerrar o servidor.

## Publicar no GitHub Pages

O site está na raiz do repositório e pode ser publicado diretamente, sem instalação nem etapa de build:

1. Faça commit das alterações e envie para a branch `main` no GitHub.
2. Abra **Settings → Pages** no repositório.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch **main** e a pasta **/(root)**; clique em **Save**.

O arquivo `.nojekyll` mantém a publicação como arquivos estáticos. Os caminhos de CSS e JavaScript são relativos, permitindo abrir o site no endereço do repositório, como `https://guilhermeazevedo1.github.io/Aula-LangChain-LangGraph/`.

Consulte as [instruções oficiais do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Usar em sala

- Navegue pelos 11 tópicos na barra lateral. O destaque acompanha a rolagem.
- Use o botão no canto superior direito para alternar entre os modos claro e escuro. A escolha fica salva no navegador; antes da primeira escolha, o tema acompanha a preferência do sistema.
- Execute o pipeline e alterne entre sequência, decisão e ciclo.
- Explore State, Node e Edge; as abas também aceitam as setas do teclado.
- No roteador, selecione uma mensagem e execute o fluxo. Reiniciar interrompe a execução e limpa o estado.
- Monte o prompt por partes, compare saídas e explore as camadas da aplicação.
- Selecione snapshots de checkpoints, construa a arquitetura e adicione a consulta RAG.

As execuções são demonstrações locais. O roteamento usa palavras-chave; as respostas e os checkpoints são ilustrativos. O notebook separado conterá as chamadas reais à LLM. Os links de documentação e catálogos exigem internet.

Para projeção, utilize o modo de tela cheia do navegador e ajuste o zoom à sala. A interface se adapta a tablets e celulares e respeita a preferência de movimento reduzido.

## Estrutura

```text
./
├── index.html
├── css/styles.css
├── js/app.js
├── .nojekyll
├── .gitignore
└── README.md
```

Não há dependências, fontes remotas, bibliotecas ou requisições de API. Os recursos visuais estão em HTML, CSS e SVG.

As pastas locais `.qa/`, `.openai/`, `.sites-runtime/`, `dist/` e os arquivos `*.tar.gz` são ignorados pelo Git. Elas guardam verificações, configurações e cópias auxiliares; o GitHub Pages usa os arquivos da raiz. O histórico do antigo repositório dentro de `site` foi preservado em `.qa/site-repository-backup/`.

Referências conceituais: [LangChain](https://docs.langchain.com/oss/python/langchain/overview), [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [Persistência](https://docs.langchain.com/oss/python/langgraph/persistence), [OpenRouter](https://openrouter.ai/docs/faq) e [Groq](https://console.groq.com/docs/models).
