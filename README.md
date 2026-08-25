# A Corrente

Jogo educativo web sobre a relação sistêmica bidirecional entre doença periodontal e doenças respiratórias (DPOC e apneia obstrutiva do sono).

## Contexto

Projeto acadêmico de odontologia. A mecânica ensina o mecanismo e a bidirecionalidade da associação entre periodontite, DPOC e apneia obstrutiva do sono (AOS), em sessão curta, sem backend e sem persistência.

Nota científica (seção 13 da especificação):

> Conteúdo educativo. As cadeias apresentadas descrevem mecanismos de plausibilidade biológica e associações descritas na literatura — não estabelecem relação de causa e efeito individual. Não substitui avaliação clínica.

Documento de referência: [docs/spec-jogo-periodontite-respiratorio.md](docs/spec-jogo-periodontite-respiratorio.md).

## Como rodar

Requer Node 18 ou superior.

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

```bash
npm test
```

## Stack

React 18, TypeScript, Vite, Tailwind 3, dnd-kit, Framer Motion, Vitest.

## Como jogar

Ordene as quatro etapas de cada cadeia arrastando os cartões da bandeja para os slots (no celular, toque no cartão e depois na posição).
Verifique a conexão; a partir do segundo erro, uma dica aparece sem entregar a resposta.
São quatro cadeias (DPOC e AOS, ida e volta) e um quiz final; “Jogar novamente” recomeça a sessão.

Após cada acerto, o overlay da animação avança sozinho; a tela de contexto espera o botão **Continuar**. Termos do glossário (primeira ocorrência por tela) e a nota científica do rodapé da abertura abrem em popover, por toque ou clique. O encerramento recapitula as quatro cadeias, inclui a nota completa e oferece **Referências** (`src/data/references.ts`).

## Textos clínicos e placeholders

- Contexto pós-acerto e glossário: edite só `src/data/education.ts`.
- Afiliação na abertura: `affiliation` em `src/data/screens.ts` (`{{DISCIPLINA}} · {{INSTITUIÇÃO}} · {{AUTORA}}`).
- Bibliografia: `src/data/references.ts`.

## Acessibilidade

O jogo é jogável só com teclado (Tab, Espaço, setas e Esc). No mobile há toque-para-colocar. Popovers (dica, glossário, nota científica) nunca abrem por hover: Enter ou Espaço abre, Esc fecha, o foco volta ao gatilho.

Com `prefers-reduced-motion: reduce`, animações são substituídas por estados finais e o overlay de acerto pede **Avançar** em vez de avançar sozinho. A tela de contexto pós-acerto espera **Continuar** com ou sem reduced-motion.

## Estrutura de pastas

```
.
├── docs/
│   └── spec-jogo-periodontite-respiratorio.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vercel.json
└── vite.config.ts
```

## Parâmetros de URL

`?seed=` fixa o gerador do embaralhamento (combinado com o id de cada tela). Use o mesmo valor para reproduzir a ordem dos cartões em apresentações.

## Deploy

Na Vercel:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
