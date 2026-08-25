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

## Acessibilidade

O jogo é jogável só com teclado (Tab, Espaço, setas e Esc). No mobile há toque-para-colocar. Com `prefers-reduced-motion: reduce`, animações são substituídas por estados finais e o avanço deixa de ser automático.

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
