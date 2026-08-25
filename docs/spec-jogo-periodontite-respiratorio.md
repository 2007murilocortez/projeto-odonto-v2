# A Corrente — Periodontite e Saúde Respiratória

**Especificação técnica e de design para implementação**
Documento único de referência. Tudo que estiver aqui é normativo; o que não estiver é decisão do implementador, desde que respeite o design system da seção 9.

---

## 1. Visão geral

Jogo educativo web, single-player, de sessão curta (3–5 min), que ensina a **relação sistêmica bidirecional** entre doença periodontal e duas condições respiratórias: **DPOC** e **Apneia Obstrutiva do Sono (AOS)**.

A mecânica central é **ordenação de cartões**: o jogador recebe 4 etapas de uma cadeia fisiopatológica embaralhadas e precisa montá-las na sequência correta. Ao acertar, uma animação mostra o trajeto anatômico (dente → circulação → pulmão, e o inverso).

**Objetivo pedagógico:** sair da memorização de "periodontite está associada a DPOC" e chegar ao entendimento do *mecanismo* e da *bidirecionalidade*.

### 1.1 Contexto de uso

- Apresentação acadêmica em sala/projetor (1920×1080) **e** uso individual em celular.
- Sem backend, sem login, sem persistência. Roda 100% no cliente.
- Deve funcionar offline após o primeiro carregamento (fontes locais ou `font-display: swap` com fallback definido).

### 1.2 Fora de escopo

- Placar global, ranking, contas de usuário.
- Multiplayer.
- Áudio narrado (ver seção 14 — roadmap opcional).

---

## 2. Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Build | **Vite** + React 18 + TypeScript | Setup rápido, HMR, deploy estático |
| Estilo | **Tailwind CSS** + arquivo `tokens.css` com CSS custom properties | Tokens centralizados, sem CSS-in-JS |
| Drag & drop | **@dnd-kit/core** + **@dnd-kit/sortable** | Suporte nativo a teclado e touch; `react-beautiful-dnd` está descontinuado |
| Animação | **Framer Motion** | `layout` animations resolvem o reordenamento dos cartões de graça |
| Ícones | **lucide-react** | Apenas para UI (setas, check, restart) — a anatomia é SVG autoral |
| Deploy | Vercel ou Netlify (estático) | — |

```bash
npm create vite@latest corrente -- --template react-ts
cd corrente
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities framer-motion lucide-react
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

> **Regra:** nenhuma biblioteca de UI pronta (MUI, shadcn, Chakra). Os componentes são autorais, seguindo a seção 9.

---

## 3. Estrutura de pastas

```
src/
├── main.tsx
├── App.tsx                    # máquina de estados de telas
├── styles/
│   ├── tokens.css             # custom properties (cores, type scale, easing)
│   └── index.css              # @tailwind + resets
├── data/
│   └── screens.ts             # TODO o conteúdo textual (seção 5)
├── types/
│   └── game.ts
├── hooks/
│   ├── useGameFlow.ts         # navegação entre telas, timers
│   └── useReducedMotion.ts
├── components/
│   ├── screens/
│   │   ├── OpeningScreen.tsx
│   │   ├── ChainScreen.tsx    # genérica — serve às telas 2, 3, 4 e 5
│   │   ├── QuizScreen.tsx
│   │   └── ClosingScreen.tsx
│   ├── chain/
│   │   ├── ChainSlot.tsx      # posição vazia na corrente
│   │   ├── ChainCard.tsx      # cartão arrastável
│   │   ├── CardTray.tsx       # bandeja com os cartões embaralhados
│   │   └── EquationHeader.tsx # "PERIODONTITE → ? → DPOC"
│   ├── anatomy/
│   │   ├── ToothGlyph.tsx
│   │   ├── LungGlyph.tsx
│   │   ├── SleepApneaGlyph.tsx
│   │   └── PathwayAnimation.tsx  # a animação de trajeto (seção 8)
│   └── ui/
│       ├── Button.tsx
│       ├── ProgressRail.tsx
│       └── Toast.tsx
└── utils/
    └── shuffle.ts             # Fisher–Yates com garantia de não sair ordenado
```

---

## 4. Fluxo de telas

```
[1] ABERTURA
     │ clique em "Começar"
     ▼
[2] Periodontite → DPOC        ─┐
     │ acerto + 1,8s            │ FASE 1
     ▼                          │
[3] DPOC → Periodontite         │
     │ acerto + revelação ⇄     │
     │ + 2,5s                  ─┘
     ▼
[4] Periodontite → AOS         ─┐
     │ acerto + 1,8s            │ FASE 2
     ▼                          │
[5] AOS → Periodontite          │
     │ acerto + revelação ⇄     │
     │ + 2,5s                  ─┘
     ▼
[6] DESAFIO FINAL (quiz)
     │ resposta correta
     ▼
[7] ENCERRAMENTO (recapitulação + reiniciar)
```

**Transições automáticas:** telas 2–5 avançam sozinhas após o feedback de acerto. O botão "Avançar" aparece como escape manual **apenas** se `prefers-reduced-motion: reduce` estiver ativo ou se o timer for interrompido por interação.

**Estado global mínimo:**

```ts
type GameState = {
  screenIndex: number;        // 0..6
  attemptsByScreen: Record<string, number>;
  quizAnswer: 'A' | 'B' | null;
  startedAt: number;
};
```

---

## 5. Conteúdo — `data/screens.ts`

> Este é o conteúdo canônico. **Não reescrever, não "melhorar" os textos.** A linguagem usa deliberadamente termos de cautela ("possível", "potencial", "pode contribuir") porque a literatura descreve *associação e plausibilidade biológica*, não causalidade estabelecida. Ver seção 13.

```ts
export type ChainStep = {
  id: string;
  order: number;      // 1..4 — posição correta
  label: string;
  hint?: string;      // opcional: aparece após 2 erros
};

export type ChainScreen = {
  id: string;
  phase: 1 | 2;
  kind: 'chain';
  equation: { left: string; right: string };  // "PERIODONTITE" → ? → "DPOC"
  prompt?: string;                            // texto acima da equação
  steps: ChainStep[];
  successMessage: string;
  pathway: 'tooth-to-lung' | 'lung-to-tooth' | 'tooth-to-apnea' | 'apnea-to-tooth';
  reveal?: { symbol: string; caption: string };  // só nas telas 3 e 5
};
```

### 5.1 Tela 1 — Abertura

```ts
{
  id: 'opening',
  kind: 'opening',
  eyebrow: 'Relação sistêmica',
  title: 'Doença periodontal × doenças respiratórias',
  subtitle: 'Aprenda na prática como a inflamação da boca conversa com o restante do corpo.',
  body: 'Você vai montar quatro cadeias de eventos. Em cada uma, arraste as etapas até formar o caminho correto.',
  cta: 'Começar',
}
```

### 5.2 Tela 2 — Periodontite → DPOC

```ts
{
  id: 'perio-to-dpoc',
  phase: 1,
  kind: 'chain',
  equation: { left: 'PERIODONTITE', right: 'DPOC' },
  steps: [
    { id: 's1', order: 1, label: 'Periodontite ativa' },
    { id: 's2', order: 2, label: 'Mediadores inflamatórios e produtos bacterianos/orais' },
    { id: 's3', order: 3, label: 'Inflamação sistêmica e possível microaspiração' },
    { id: 's4', order: 4, label: 'Possível contribuição para o quadro respiratório' },
  ],
  successMessage: 'Conexão encontrada: Periodontite → DPOC',
  pathway: 'tooth-to-lung',
}
```

**Legenda da equação no topo:** `PERIODONTITE → ? → DPOC`
Expandir a sigla em texto pequeno sob o cabeçalho: *"DPOC — Doença Pulmonar Obstrutiva Crônica"*.

### 5.3 Tela 3 — DPOC → Periodontite

```ts
{
  id: 'dpoc-to-perio',
  phase: 1,
  kind: 'chain',
  prompt: 'Mas essa relação pode acontecer no sentido contrário?',
  equation: { left: 'DPOC', right: 'PERIODONTITE' },
  steps: [
    { id: 's1', order: 1, label: 'DPOC e inflamação pulmonar crônica' },
    { id: 's2', order: 2, label: 'Aumento de mediadores inflamatórios' },
    { id: 's3', order: 3, label: 'Inflamação sistêmica persistente' },
    { id: 's4', order: 4, label: 'Potencial agravamento da inflamação periodontal' },
  ],
  successMessage: 'Conexão encontrada: DPOC → Periodontite',
  pathway: 'lung-to-tooth',
  reveal: { symbol: 'PERIODONTITE ⇄ DPOC', caption: 'A relação é bidirecional.' },
}
```

### 5.4 Tela 4 — Periodontite → AOS

```ts
{
  id: 'perio-to-aos',
  phase: 2,
  kind: 'chain',
  equation: { left: 'PERIODONTITE', right: 'AOS' },
  steps: [
    { id: 's1', order: 1, label: 'Periodontite ativa' },
    { id: 's2', order: 2, label: 'Liberação de mediadores pró-inflamatórios' },
    { id: 's3', order: 3, label: 'Aumento da carga inflamatória sistêmica' },
    { id: 's4', order: 4, label: 'Possível contribuição para o estado inflamatório associado à AOS' },
  ],
  successMessage: 'Conexão encontrada: Periodontite → AOS',
  pathway: 'tooth-to-apnea',
}
```

**Expansão da sigla:** *"AOS — Apneia Obstrutiva do Sono"*.
A entrada da Fase 2 deve ter um marcador visual (ver 6.5).

### 5.5 Tela 5 — AOS → Periodontite

```ts
{
  id: 'aos-to-perio',
  phase: 2,
  kind: 'chain',
  prompt: 'E no caminho contrário?',
  equation: { left: 'AOS', right: 'PERIODONTITE' },
  steps: [
    { id: 's1', order: 1, label: 'Apneia obstrutiva do sono' },
    { id: 's2', order: 2, label: 'Hipóxia intermitente' },
    { id: 's3', order: 3, label: 'Estresse oxidativo e inflamação sistêmica' },
    { id: 's4', order: 4, label: 'Ambiente potencialmente favorável à inflamação periodontal' },
  ],
  successMessage: 'Conexão encontrada: AOS → Periodontite',
  pathway: 'apnea-to-tooth',
  reveal: { symbol: 'PERIODONTITE ⇄ AOS', caption: 'Novamente, encontramos uma relação bidirecional.' },
}
```

### 5.6 Tela 6 — Desafio final

```ts
{
  id: 'final-challenge',
  kind: 'quiz',
  eyebrow: 'Desafio final',
  question: 'A relação sistêmica da periodontite acontece somente com doenças respiratórias, como DPOC e AOS?',
  options: [
    { id: 'A', label: 'Sim, a relação ocorre apenas com doenças respiratórias.', correct: false },
    { id: 'B', label: 'Não, a periodontite pode apresentar relação com diferentes condições sistêmicas.', correct: true },
  ],
  feedback: {
    correct: 'Correto! DPOC e AOS são exemplos respiratórios, mas a relação entre saúde periodontal e saúde sistêmica vai além do sistema respiratório.',
    incorrect: 'Incorreto. A relação sistêmica da periodontite não se limita às doenças respiratórias.',
  },
}
```

### 5.7 Tela 7 — Encerramento *(não estava no roteiro original — sugestão)*

Recapitulação das duas relações bidirecionais lado a lado, mais um fecho.

```ts
{
  id: 'closing',
  kind: 'closing',
  title: 'Duas vias, dois sentidos',
  recap: ['PERIODONTITE ⇄ DPOC', 'PERIODONTITE ⇄ AOS'],
  body: 'Cuidar da saúde periodontal é parte do cuidado com a saúde sistêmica.',
  cta: 'Jogar novamente',
}
```

---

## 6. Especificação das telas de cadeia (`ChainScreen`)

Componente único, reutilizado 4×, parametrizado por `screens.ts`.

### 6.1 Layout — desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│  ▓▓▓░░  FASE 1 · CONEXÃO 1 DE 2          [rail]         │  ← 6.5
│                                                          │
│         "Mas essa relação pode acontecer                │  ← prompt (opcional)
│          no sentido contrário?"                          │
│                                                          │
│      PERIODONTITE  ────→   ?   ────→   DPOC             │  ← EquationHeader
│                                                          │
│  ┌──────────────────────┐   ┌────────────────────────┐  │
│  │  A CORRENTE          │   │  ETAPAS                │  │
│  │  ┌────────────────┐  │   │  ┌──────────────────┐  │  │
│  │  │ 01 ░ vazio ░   │  │   │  │ Inflamação sist… │  │  │
│  │  └────────┬───────┘  │   │  └──────────────────┘  │  │
│  │  ┌────────▼───────┐  │   │  ┌──────────────────┐  │  │
│  │  │ 02 ░ vazio ░   │  │   │  │ Periodontite at… │  │  │
│  │  └────────┬───────┘  │   │  └──────────────────┘  │  │
│  │  ┌────────▼───────┐  │   │  ┌──────────────────┐  │  │
│  │  │ 03 ░ vazio ░   │  │   │  │ Possível contri… │  │  │
│  │  └────────┬───────┘  │   │  └──────────────────┘  │  │
│  │  ┌────────▼───────┐  │   │  ┌──────────────────┐  │  │
│  │  │ 04 ░ vazio ░   │  │   │  │ Mediadores infl… │  │  │
│  │  └────────────────┘  │   │  └──────────────────┘  │  │
│  └──────────────────────┘   └────────────────────────┘  │
│                                                          │
│                    [ Verificar conexão ]                 │
└─────────────────────────────────────────────────────────┘
```

Grid: `grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]`, gap `--space-8`, largura máxima `1120px` centralizada.

### 6.2 Layout — mobile (<768px)

Coluna única. **Bandeja em cima, corrente embaixo** (o polegar arrasta de cima para baixo, movimento natural). Bandeja com rolagem horizontal se necessário; cartões com `min-height: 72px` para alvo de toque confortável.

Adicionar **modo toque-para-colocar** como alternativa ao arraste (ver 7.4) — em telas pequenas, arrastar cartões longos é frustrante.

### 6.3 `EquationHeader`

- `PERIODONTITE → ? → DPOC` em fonte display, `letter-spacing: 0.06em`, caixa alta.
- O `?` é o elemento vivo: fica com `--placa` (amarelo) e pulsa suavemente (`scale 1 → 1.06`, 2,4s, `ease-in-out`, infinito) enquanto a cadeia está incompleta.
- Ao acertar, o `?` faz *cross-fade* para um ícone de elo/corrente e a cor migra de `--placa` para `--oxigenio`.
- Sob o cabeçalho, em `--type-caption` e `--ink-muted`: expansão da sigla.

### 6.4 `CardTray` e `ChainCard`

**Embaralhamento:** Fisher–Yates no `useEffect` de montagem, com verificação — se o resultado sair na ordem correta, re-embaralha. Fixar `seed` opcional via query string `?seed=` para demonstração reproduzível em apresentação.

**Anatomia do cartão:**

```
┌───────────────────────────────────────┐
│ ⠿   Mediadores inflamatórios e        │
│     produtos bacterianos/orais        │
└───────────────────────────────────────┘
  ↑                ↑
  grip handle      label, max 2 linhas,
  (--ink-muted)    text-balance
```

- Padding `--space-4` / `--space-5`, raio `--radius-md` (10px).
- Fundo `--tecido`, borda `1px solid --line`.
- **Repouso:** sem sombra. **Hover:** borda vira `--oxigenio-dim`, `translateY(-2px)`.
- **Arrastando:** `scale(1.03)`, `rotate(-1.2deg)`, sombra `--shadow-lift`, `cursor: grabbing`, opacidade 0.95. O espaço de origem colapsa suavemente (Framer `layout`).
- **Encaixado no slot:** ganha o numeral `01`–`04` em fonte mono à esquerda, e a linha vertical da corrente se conecta a ele.

### 6.5 `ProgressRail`

Trilho fino no topo com 4 segmentos (uma por tela de cadeia). Segmento atual em `--oxigenio`, concluídos em `--oxigenio-dim`, futuros em `--line`.
Rótulo à esquerda em mono, caixa alta, `--type-caption`:
`FASE 1 · CONEXÃO 1 DE 2`

**Marcador de entrada na Fase 2 (antes da tela 4):** interstício de 1,4s com o texto `FASE 2 — APNEIA OBSTRUTIVA DO SONO` centralizado, fade-in/fade-out. Igual interstício antes da tela 2 com `FASE 1 — DPOC`. Isso dá respiro entre os blocos e marca a estrutura do roteiro.

---

## 7. Mecânica de drag & drop

### 7.1 Regras

1. Os 4 slots começam vazios; os 4 cartões começam na bandeja.
2. Arrastar cartão da bandeja → slot: ocupa o slot.
3. Arrastar cartão para slot **já ocupado**: os dois trocam de lugar (swap), nunca sobrescreve.
4. Arrastar cartão do slot → bandeja: devolve.
5. Reordenar dentro da corrente: permitido (sortable).
6. Um cartão nunca some.

### 7.2 Validação

- O botão **"Verificar conexão"** fica desabilitado até os 4 slots estarem preenchidos.
- Quando o 4º slot é preenchido, o botão habilita **e** ganha um pulso sutil de atenção uma única vez.
- Validação **manual** (clique no botão), não automática. Motivo: validar sozinho no instante em que a peça encaixa rouba do jogador o momento de conferir o próprio raciocínio — que é justamente o exercício.

### 7.3 Feedback

**Acerto (ordem correta):**
1. Cada cartão acende em cascata, de cima para baixo, 90ms de intervalo: borda → `--oxigenio`, fundo clareia 4%.
2. A linha vertical da corrente se preenche de cima para baixo (`stroke-dashoffset`, 700ms).
3. Dispara `PathwayAnimation` (seção 8).
4. `successMessage` entra por baixo do cabeçalho, fade + slide 8px.
5. Após o tempo de espera (1,8s ou 2,5s se houver `reveal`), avança.

**Erro:**
1. O container da corrente faz *shake* horizontal — `±6px, 3 oscilações, 320ms`. Sem som.
2. Cartões nas posições **corretas** ficam com borda `--oxigenio-dim` e um `✓` discreto e **travam** (não são mais arrastáveis).
3. Cartões nas posições erradas pulsam em `--inflamacao` por 600ms e voltam ao normal, destravados.
4. Toast discreto no rodapé: `"Ainda não. Duas etapas estão no lugar certo."` — o número é dinâmico. Se zero: `"Ainda não. Tente pensar no que dispara a cadeia."`
5. `attemptsByScreen[id] += 1`.

**Após 2 erros:** aparece um link discreto `Ver dica`. Ao clicar, revela a `hint` do primeiro cartão fora de lugar (ex.: *"Toda cadeia começa pela condição já instalada."*). Nunca revelar a resposta inteira.

**Nunca:** o jogo não pode travar o jogador. Não há limite de tentativas.

### 7.4 Acessibilidade da mecânica

Obrigatório, não opcional:

- **Teclado:** `Tab` navega entre cartões, `Espaço` pega, setas `↑↓` movem, `Espaço` solta, `Esc` cancela. O `@dnd-kit/core` entrega isso via `KeyboardSensor` — configurar `sortableKeyboardCoordinates`.
- **Anúncios ARIA:** usar `announcements` do `DndContext` em pt-BR. Ex.: `"Cartão Periodontite ativa movido para a posição 1 de 4."`
- **Toque-para-colocar:** clicar num cartão da bandeja o seleciona (estado visual claro); clicar num slot o insere. Funciona em paralelo ao arraste, sem modo separado.
- Os slots têm `aria-label="Posição 1 da cadeia, vazia"`.

---

## 8. `PathwayAnimation`

O momento de recompensa. **Um único SVG** por tela, `viewBox="0 0 800 260"`, ocupando a largura do conteúdo, sobreposto em um painel que escurece o resto (`backdrop: rgba(6,15,24,0.82)`).

### 8.1 Composição

```
   ◯ dente                    ◯ pulmão
     ╲                        ╱
      ╲ ~~~~~~~~~~~~~~~~~~~~ ╱     ← trajeto (curva de Bézier)
        "circulação sistêmica"      ← rótulo mono, --ink-muted
```

- **Glifos anatômicos:** desenhados em SVG à mão, traço `1.75px`, sem preenchimento sólido, estilo esquemático de livro-texto — não ilustração fofa, não emoji. `ToothGlyph` (molar com raiz, gengiva marcada), `LungGlyph` (par de pulmões com traqueia e brônquios), `SleepApneaGlyph` (perfil de via aérea superior com ponto de obstrução).
- **Trajeto:** `<path>` com curva suave entre os dois glifos.

### 8.2 Sequência (total ~1400ms)

| t | evento |
|---|---|
| 0ms | Glifo de origem entra: `opacity 0→1`, `scale 0.94→1`. Ganha um halo pulsante em `--inflamacao`. |
| 250ms | O trajeto se desenha da origem ao destino (`stroke-dasharray` animado, `--oxigenio`, 550ms, `--ease-out`). |
| 400ms | 3 partículas (`<circle r="4">`) percorrem o trajeto em `offset-path`, escalonadas em 120ms, cor `--inflamacao` → `--oxigenio` durante o trajeto. |
| 900ms | Glifo de destino entra e recebe o halo — a cor "chega". |
| 1150ms | `successMessage` aparece abaixo. |
| 1400ms | Se houver `reveal`: o painel faz cross-fade para a revelação (8.3). |

**Direção:** `pathway` inverte origem e destino. Em `lung-to-tooth` e `apnea-to-tooth`, o trajeto se desenha da direita para a esquerda e as partículas correm no sentido inverso — a inversão precisa ser *visivelmente* percebida, porque é o argumento pedagógico da tela.

### 8.3 Revelação da bidirecionalidade (telas 3 e 5)

Só aqui, e é o clímax de cada fase:

1. Os dois glifos assumem posição simétrica.
2. Uma **segunda** curva se desenha no sentido oposto, em espelho, formando um circuito fechado.
3. Partículas passam a circular nos dois sentidos, em loop lento (mantido até a tela trocar).
4. `PERIODONTITE ⇄ DPOC` aparece em display, `--type-display-lg`. O `⇄` entra por último, com um leve *overshoot* (`scale 0 → 1.15 → 1`, `--ease-spring`).
5. Legenda: *"A relação é bidirecional."* em `--type-caption`, `--ink-muted`.

### 8.4 Movimento reduzido

Com `prefers-reduced-motion: reduce`:
- Sem partículas, sem pulsos, sem shake.
- Trajetos aparecem já desenhados, com fade de 200ms.
- Erro é sinalizado só por cor e ícone.
- Avanço automático é **desativado**; aparece botão "Avançar".

---

## 9. Design system

### 9.1 Direção

O tema é **circulação** — algo que sai da boca, entra na corrente e chega ao pulmão. A identidade visual é a de um **esquema clínico em fundo escuro**: sério, com precisão de diagrama, mas com a corrente como elemento vivo. Referência mental: painel de diagnóstico, não app de quiz colorido.

**Elemento-assinatura:** *a corrente* — a linha vertical que atravessa os slots, se preenche quando a resposta está certa e se transforma no trajeto anatômico da animação. É o mesmo traço do começo ao fim do jogo. Toda a ousadia visual está concentrada nela; o resto é contido.

### 9.2 Paleta — `tokens.css`

```css
:root {
  /* superfícies */
  --noite:        #08131F;  /* fundo da página */
  --tecido:       #102434;  /* cartões, painéis */
  --tecido-alto:  #17324A;  /* hover, slot ativo */
  --line:         #22415A;  /* bordas, divisores */

  /* texto */
  --ink:          #E9F1F5;
  --ink-muted:    #8FA9B8;

  /* semânticos */
  --oxigenio:     #48D0C4;  /* acerto, oxigenação, progresso */
  --oxigenio-dim: #2A7D77;
  --inflamacao:   #E8574B;  /* erro, inflamação, origem */
  --placa:        #F0B429;  /* atenção, o "?", dicas */

  /* efeitos */
  --shadow-lift:  0 14px 34px -10px rgba(0,0,0,.65);
  --ease-out:     cubic-bezier(.22,.61,.36,1);
  --ease-spring:  cubic-bezier(.34,1.56,.64,1);
}
```

Semântica das cores é **fixa**: `--inflamacao` só para inflamação/erro, `--oxigenio` só para acerto/oxigenação. O jogador aprende o código de cor nos primeiros 30 segundos e ele precisa se manter.

### 9.3 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Bricolage Grotesque** (variable, Google Fonts) | Títulos, equação, revelação `⇄` |
| Texto | **Inter Tight** | Cartões, corpo, botões |
| Utilitário | **IBM Plex Mono** | Numerais `01`–`04`, rótulos de fase, legendas |

```css
--type-display-lg: clamp(2rem, 4.5vw, 3.25rem);  /* line-height 1.05, wght 600, tracking -0.02em */
--type-display:    clamp(1.5rem, 3vw, 2rem);
--type-equation:   clamp(1.05rem, 2.2vw, 1.6rem); /* uppercase, tracking 0.06em */
--type-card:       1rem;                          /* line-height 1.45 */
--type-body:       1.0625rem;
--type-caption:    0.8125rem;                     /* uppercase, tracking 0.09em, mono */
```

Escala de espaçamento em múltiplos de 4px: `--space-1` a `--space-12`.

### 9.4 Componentes de UI

- **Botão primário:** fundo `--oxigenio`, texto `--noite`, raio `--radius-md`, `font-weight 550`. Desabilitado: fundo `--line`, texto `--ink-muted`, `cursor: not-allowed`.
- **Botão secundário/link:** texto `--ink-muted`, sublinhado no hover.
- **Foco:** `outline: 2px solid var(--placa); outline-offset: 3px`. Visível em **todos** os elementos interativos. Nunca remover.
- **Toast:** fixo no rodapé, `--tecido-alto`, borda esquerda 3px na cor semântica, some em 3,2s.

### 9.5 Copy da interface

Voz: direta, segunda pessoa, frase afirmativa. Sem exclamações fora dos feedbacks de acerto. Sem gamificação artificial ("Mandou bem!", "Uau!").

| Elemento | Texto |
|---|---|
| Botão de validação | `Verificar conexão` |
| Slot vazio | `Arraste uma etapa` |
| Bandeja (título) | `Etapas` |
| Corrente (título) | `A corrente` |
| Dica | `Ver dica` |
| Reiniciar | `Jogar novamente` |

---

## 10. Responsividade

| Breakpoint | Comportamento |
|---|---|
| ≥1280px | Grid 2 colunas, animação em `viewBox` cheio |
| 1024–1279px | Grid 2 colunas, `--space` reduzido em um passo |
| 768–1023px | Coluna única, bandeja em grid 2×2 acima da corrente |
| <768px | Coluna única, bandeja em rolagem horizontal, toque-para-colocar em destaque, `PathwayAnimation` em `viewBox="0 0 400 300"` com glifos empilhados na vertical |

Testar em 360×640 (menor caso realista) e 1920×1080 (projetor).

---

## 11. Casos de borda

| Caso | Comportamento esperado |
|---|---|
| Redimensiona a janela no meio de um arraste | `dnd-kit` cancela o arraste; cartão volta à origem |
| Clica em "Verificar" com slots incompletos | Impossível — botão desabilitado; `aria-disabled` correto |
| Recarrega a página | Reinicia do zero. Sem persistência (por decisão) |
| Timer de avanço automático + clique em "Avançar" | Cancelar o timer no `cleanup` do `useEffect` para não avançar duas telas |
| Erro com 3 cartões travados corretos | O 4º está necessariamente errado — impossível. Se 3 estão certos, o 4º está certo. Validar essa lógica: só travar cartões corretos se houver ≥1 incorreto |
| Fontes não carregam | Fallbacks definidos: `ui-sans-serif, system-ui`; layout não pode quebrar |

> Atenção ao caso do "3 corretos": matematicamente, com 4 posições, é impossível ter exatamente 3 certas. Se o código chegar nesse estado, há bug na comparação.

---

## 12. Critérios de aceite

Marcar cada item antes de considerar pronto:

**Fluxo**
- [ ] As 7 telas aparecem na ordem da seção 4
- [ ] Interstícios de fase aparecem antes das telas 2 e 4
- [ ] Telas 3 e 5 mostram a revelação `⇄` com a legenda correta
- [ ] Avanço automático respeita os tempos (1,8s / 2,5s)
- [ ] Quiz final aceita nova tentativa após resposta errada
- [ ] "Jogar novamente" reseta todo o estado

**Mecânica**
- [ ] Cartões embaralham a cada partida e nunca iniciam ordenados
- [ ] Swap entre slots ocupados funciona; nenhum cartão desaparece
- [ ] "Verificar conexão" só habilita com 4 slots preenchidos
- [ ] Acerto dispara cascata + preenchimento da corrente + `PathwayAnimation`
- [ ] Erro trava cartões corretos e libera os errados
- [ ] Dica aparece após 2 erros e não entrega a resposta

**Acessibilidade**
- [ ] Jogo inteiro completável só com teclado
- [ ] Anúncios ARIA em pt-BR a cada movimento
- [ ] Toque-para-colocar funciona em mobile
- [ ] Foco visível em todos os interativos
- [ ] `prefers-reduced-motion` desativa partículas, shake e avanço automático
- [ ] Contraste ≥ 4.5:1 para texto (verificar `--ink-muted` sobre `--tecido`)

**Conteúdo**
- [ ] Todos os textos batem **exatamente** com a seção 5
- [ ] Siglas DPOC e AOS expandidas na primeira aparição
- [ ] Nota de contexto científico presente (seção 13)

**Qualidade**
- [ ] Sem erros de console
- [ ] Funciona em 360×640 e 1920×1080
- [ ] `npm run build` sem warnings de TS

---

## 13. Nota de contexto científico

Incluir no rodapé da tela de encerramento, em `--type-caption`, `--ink-muted`:

> Conteúdo educativo. As cadeias apresentadas descrevem mecanismos de plausibilidade biológica e associações descritas na literatura — não estabelecem relação de causa e efeito individual. Não substitui avaliação clínica.

Isso protege o trabalho academicamente e é a razão pela qual os textos dos cartões usam "possível", "potencial" e "pode contribuir". **Manter essa linguagem.**

Sugestão para a sua amiga: incluir as referências que ela usou (diretrizes de periodontia, artigos de revisão sobre periodontal medicine) numa tela ou num link discreto — isso costuma valer nota em trabalho acadêmico.

---

## 14. Roadmap opcional

Não implementar na v1. Anotado para depois:

1. **Modo apresentação** — tecla `P` esconde a bandeja e destaca só a corrente montada, para explicar no projetor.
2. **Tempo e tentativas no encerramento** — "Você montou 4 conexões em 3min12 com 2 tentativas extras."
3. **Terceira fase** — pneumonia aspirativa, que se conecta bem ao mecanismo de microaspiração já citado na tela 2.
4. **Exportar diploma/print** — canvas com as duas relações bidirecionais, para postar.
5. **Narração** — Web Speech API lendo os cartões; ajuda muito em acessibilidade.

---

## 15. Prompt inicial para o Cursor

Cole isto junto com este arquivo:

> Leia integralmente o `spec-jogo-periodontite-respiratorio.md` anexo. Implemente o projeto do zero seguindo a stack da seção 2 e a estrutura de pastas da seção 3.
>
> Ordem de trabalho:
> 1. Setup do Vite + Tailwind + `tokens.css` com **todas** as custom properties da seção 9.2 e a escala tipográfica de 9.3.
> 2. `data/screens.ts` com o conteúdo **literal** da seção 5 — não reescreva nenhum texto.
> 3. `ChainScreen` genérica com dnd-kit, cobrindo as regras da seção 7 (incluindo teclado e toque-para-colocar).
> 4. `PathwayAnimation` com os SVGs anatômicos autorais da seção 8.
> 5. `QuizScreen`, `OpeningScreen`, `ClosingScreen`.
> 6. `App.tsx` com a máquina de estados da seção 4 e os interstícios de fase.
>
> Ao final, percorra o checklist da seção 12 e me diga item por item o que está feito e o que ficou pendente. Não invente conteúdo clínico novo além do que está no documento.

Depois de rodar, peça ao Cursor para revisar contraste e navegação por teclado — são as duas coisas que a geração automática costuma deixar passar.
