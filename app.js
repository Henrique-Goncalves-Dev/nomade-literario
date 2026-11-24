import * as readingAccounts from "./account.js";

const PROFILE_LETTERS = { A: "explorador", B: "imersivo", C: "investigador", D: "contemplativo" };
const PROFILES = [
  { key: "explorador", name: "Explorador", motive: "Descobrir", short: "Novos autores, gêneros diferentes e narrativas surpreendentes.", detail: "A curiosidade abre caminho. Você tende a gostar de novidade, variedade e mundos que ainda não conhece.", color: "#a36d26" },
  { key: "imersivo", name: "Imersivo", motive: "Sentir", short: "Romances, dramas e histórias com personagens marcantes.", detail: "Uma história ganha força quando você se conecta a quem está dentro dela e continua pensando nos personagens depois da última página.", color: "#a83e69" },
  { key: "investigador", name: "Investigador", motive: "Aprender", short: "Psicologia, história, ciência, filosofia e não ficção.", detail: "Você se interessa por ideias que explicam o mundo, abrem perguntas e trazem novas perspectivas.", color: "#596d91" },
  { key: "contemplativo", name: "Contemplativo", motive: "Apreciar", short: "Poesia, clássicos e obras de linguagem ou atmosfera marcante.", detail: "O ritmo e a linguagem fazem parte da experiência. Você gosta de ler com espaço para apreciar cada página.", color: "#477a68" },
];

const PROFILE_QUESTIONS = [
  ["Ao escolher um livro, o que mais chama sua atenção?", ["Uma temática diferente ou algo que nunca experimentei.", "Uma história emocionante, com personagens interessantes.", "Um assunto que possa me ensinar alguma coisa.", "Uma escrita bonita ou uma atmosfera envolvente."]],
  ["O que você mais espera sentir ao terminar um livro?", ["Vontade de descobrir outra história diferente.", "A sensação de ter vivido uma experiência emocionante.", "A satisfação de ter aprendido ou compreendido algo novo.", "A tranquilidade de ter apreciado uma experiência agradável."]],
  ["Qual experiência mais combina com você?", ["Explorar diferentes gêneros e autores.", "Criar conexão com os personagens.", "Refletir sobre ideias e conhecimentos.", "Ler devagar, apreciando cada página."]],
  ["Quando alguém indica um livro, o que desperta seu interesse?", ["Ser algo novo e fora do comum.", "Ter uma história capaz de mexer comigo.", "Abordar um assunto interessante e relevante.", "Ter uma escrita envolvente e uma apresentação encantadora."]],
  ["Em uma livraria, onde você provavelmente começaria a procurar?", ["Nas novidades e categorias que ainda não conheço.", "Em romances, dramas e histórias envolventes.", "Em história, ciência, filosofia e desenvolvimento pessoal.", "Em poesia, clássicos e livros de escrita marcante."]],
  ["Qual seria seu cenário ideal de leitura?", ["Um lugar diferente, descobrindo uma história inesperada.", "Um ambiente aconchegante com uma história emocionante.", "Um espaço tranquilo para estudar e refletir.", "Um cantinho confortável, com tempo para apreciar a leitura."]],
  ["Se pudesse escolher um presente literário, qual seria?", ["Um livro surpresa de um gênero que nunca li.", "Um romance ou história que me faça sentir muitas emoções.", "Um livro que amplie meus conhecimentos.", "Uma obra com escrita marcante ou edição especial."]],
  ["O que costuma fazer você abandonar um livro?", ["Sentir que a história não apresenta novidades.", "Não conseguir me conectar com os personagens ou acontecimentos.", "Não encontrar conteúdo interessante ou consistente.", "Não gostar da linguagem ou do ritmo da narrativa."]],
  ["Qual frase representa melhor sua relação com a leitura?", ["Quero conhecer histórias que ainda nem imagino existir.", "Quero encontrar histórias que conversem com meus sentimentos.", "Quero aprender algo novo sempre que abro um livro.", "Quero aproveitar cada palavra e cada detalhe."]],
  ["Se recebesse um livro escolhido especialmente para você, o que mais gostaria?", ["Uma descoberta surpreendente.", "Uma história que me emocione.", "Uma obra que acrescente conhecimento.", "Uma experiência de leitura bonita e especial."]],
  ["Quando uma história termina, o que geralmente acontece?", ["Procuro outra experiência literária.", "Continuo pensando nos personagens e no que aconteceu.", "Reflito sobre as ideias e os aprendizados.", "Fico apreciando as sensações e a escrita da obra."]],
  ["O que mais combina com seu próximo momento de leitura?", ["Experimentar algo completamente novo.", "Encontrar uma história que me envolva emocionalmente.", "Aprender sobre um assunto que desperta minha curiosidade.", "Desacelerar e aproveitar uma leitura prazerosa."]],
].map(([title, options], index) => ({
  id: `q${index + 1}`,
  title,
  kind: "profile",
  part: "Seu perfil leitor",
  help: "Escolha a alternativa que mais representa você. Não existem respostas certas ou erradas.",
  options: options.map((text, optionIndex) => ({ label: String.fromCharCode(65 + optionIndex), text, profile: PROFILE_LETTERS[String.fromCharCode(65 + optionIndex)] })),
}));

const PREFERENCE_QUESTIONS = [
  { id: "q13", title: "Quais gêneros você gostaria de ler?", kind: "multi", part: "Para acertar na indicação", help: "Marque quantos quiser. Essas escolhas ajudam a indicar um título, mas não mudam seu perfil.", options: ["Romance", "Fantasia", "Ficção científica", "Suspense e mistério", "Drama", "Desenvolvimento pessoal", "Psicologia", "Filosofia", "História", "Biografias", "Poesia", "Clássicos", "Quero descobrir"] },
  { id: "q14", title: "Qual tamanho de livro combina com seu momento?", kind: "single", part: "Para acertar na indicação", options: ["Curto · até 150 páginas", "Médio · de 150 a 300 páginas", "Longo · mais de 300 páginas", "Sem preferência"], values: ["curto", "medio", "longo", "sem-preferencia"] },
  { id: "q15", title: "Como é sua relação atual com a leitura?", kind: "single", part: "Para acertar na indicação", options: ["Estou começando", "Leio ocasionalmente", "Leio com frequência", "Sempre gostei de ler", "Quero retomar o hábito"] },
  { id: "q16", title: "Quanto tempo gostaria de dedicar à leitura?", kind: "single", part: "Para acertar na indicação", options: ["Até 15 minutos por dia", "De 15 a 30 minutos", "De 30 minutos a 1 hora", "Mais de 1 hora", "Ainda não tenho uma rotina"] },
  { id: "q17", title: "Existe algum tema ou conteúdo que você prefere evitar?", kind: "text", part: "Para acertar na indicação", help: "Esta resposta fica visível no relatório e ajuda a evitar uma indicação que não combine com você.", placeholder: "Pode escrever palavras ou temas, como violência, luto ou nenhum." },
  { id: "q18", title: "Que sentimento ou experiência você gostaria que seu próximo livro proporcionasse?", kind: "text", part: "Para acertar na indicação", placeholder: "Uma aventura leve, uma reflexão, uma história emocionante…" },
  { id: "q19", title: "Como você prefere receber uma indicação?", kind: "single", part: "Para acertar na indicação", options: ["Quero ser surpreendido", "Quero participar da escolha", "Quero conhecer o livro e o motivo da indicação"] },
  { id: "q20", title: "O que tornaria essa experiência especial para você?", kind: "text", part: "Para acertar na indicação", placeholder: "Um bilhete, um marcador, uma edição especial…" },
  { id: "q21", title: "Qual faixa de investimento seria confortável para uma experiência literária?", kind: "single", part: "Para acertar na indicação", options: ["Até R$ 40", "De R$ 40 a R$ 70", "De R$ 70 a R$ 100", "Acima de R$ 100", "Ainda estou decidindo"] },
  { id: "q22", title: "Qual formato de leitura combina melhor com você?", kind: "single", part: "Para acertar na indicação", help: "Uma preferência de formato ajuda a planejar a experiência e a entrega.", options: ["Livro impresso", "E-book", "Não tenho preferência"] },
];
const QUESTIONS = [...PROFILE_QUESTIONS, ...PREFERENCE_QUESTIONS];

const BOOKS = [
  { id: "guia-galaxias", title: "O guia do mochileiro das galáxias", author: "Douglas Adams", profiles: ["explorador"], genres: ["Ficção científica", "Fantasia"], length: "medio", color: "#596d91", note: "Humor absurdo e viagem por um universo cheio de desvios.", summary: "Uma aventura inventiva para quem gosta de seguir uma ideia até lugares inesperados.", alerts: ["destruição", "violência"] },
  { id: "kindred", title: "Kindred: laços de sangue", author: "Octavia E. Butler", profiles: ["explorador", "imersivo"], genres: ["Ficção científica", "Drama"], length: "longo", color: "#8b563e", note: "Ficção científica, memória e história em uma narrativa intensa.", summary: "Uma leitura que combina imaginação, personagens marcantes e questões históricas.", alerts: ["escravidão", "racismo", "violência", "morte"] },
  { id: "pequeno-principe", title: "O pequeno príncipe", author: "Antoine de Saint-Exupéry", profiles: ["explorador", "contemplativo"], genres: ["Clássicos", "Fantasia"], length: "curto", color: "#a36d26", note: "Uma fábula breve para reler com olhos diferentes.", summary: "Um clássico acessível, com encontros curiosos e espaço para pensar sobre vínculos.", alerts: ["luto"] },
  { id: "torto-arado", title: "Torto arado", author: "Itamar Vieira Junior", profiles: ["imersivo", "investigador"], genres: ["Drama", "Romance"], length: "medio", color: "#79554a", note: "Uma narrativa brasileira sobre família, terra e pertencimento.", summary: "Vozes fortes e relações complexas constroem uma história de grande envolvimento emocional.", alerts: ["violência", "racismo", "morte"] },
  { id: "vida-invisivel", title: "A vida invisível de Eurídice Gusmão", author: "Martha Batalha", profiles: ["imersivo", "explorador"], genres: ["Romance", "Drama"], length: "medio", color: "#a83e69", note: "Personagens vivas e humor em uma história sobre escolhas e expectativas.", summary: "Uma ficção envolvente para quem gosta de acompanhar trajetórias e relações humanas.", alerts: ["machismo", "violência"] },
  { id: "quarto-despejo", title: "Quarto de despejo", author: "Carolina Maria de Jesus", profiles: ["investigador", "imersivo"], genres: ["Biografias", "Drama", "História"], length: "medio", color: "#596d91", note: "Um diário que oferece uma perspectiva direta sobre a vida na cidade.", summary: "Uma obra documental que combina observação, memória e reflexão social.", alerts: ["fome", "racismo", "pobreza", "violência"] },
  { id: "ideias-adiar", title: "Ideias para adiar o fim do mundo", author: "Ailton Krenak", profiles: ["investigador", "contemplativo"], genres: ["Filosofia", "História"], length: "curto", color: "#477a68", note: "Reflexões breves sobre humanidade, natureza e outras formas de viver.", summary: "Um convite conciso a rever ideias e ampliar a perspectiva sobre o mundo.", alerts: [] },
  { id: "hora-estrela", title: "A hora da estrela", author: "Clarice Lispector", profiles: ["contemplativo", "imersivo"], genres: ["Clássicos", "Drama"], length: "curto", color: "#825176", note: "Uma linguagem singular em uma narrativa curta e marcante.", summary: "Uma experiência literária que dá espaço à voz, à forma e ao que fica nas entrelinhas.", alerts: ["pobreza", "morte"] },
  { id: "poema-sujo", title: "Poema sujo", author: "Ferreira Gullar", profiles: ["contemplativo"], genres: ["Poesia", "Clássicos"], length: "curto", color: "#477a68", note: "Poesia, lembrança e ritmo em uma obra para ler sem pressa.", summary: "Uma indicação para quem encontra prazer na linguagem e na cadência de cada verso.", alerts: ["exílio", "violência"] },
  { id: "ridicula-ideia", title: "A ridícula ideia de nunca mais te ver", author: "Rosa Montero", profiles: ["investigador", "contemplativo"], genres: ["Biografias", "Desenvolvimento pessoal"], length: "medio", color: "#806052", note: "Memória e reflexão em torno da vida e da escrita de Marie Curie.", summary: "Uma leitura híbrida entre biografia e ensaio, com ideias que continuam depois do livro.", alerts: ["luto", "doença"] },
  { id: "biblioteca-meia-noite", title: "A biblioteca da meia-noite", author: "Matt Haig", profiles: ["explorador", "imersivo"], genres: ["Fantasia", "Drama"], length: "medio", color: "#555184", note: "Uma premissa fantástica sobre escolhas, possibilidades e recomeços.", summary: "Uma história acessível para quem quer imaginar outros caminhos e se envolver com uma personagem.", alerts: ["depressão", "suicídio", "luto"] },
];

const STORAGE_KEY = "nomade-literario-respostas-v1";
const LOCAL_ADMIN_ENABLED = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const state = {
  view: "home",
  step: -1,
  answers: {},
  report: null,
  selectedRecord: null,
  account: { user: null, profile: null, feedback: [], loading: readingAccounts.accountsConfigured, mode: "login", message: "" },
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const getProfile = (key) => PROFILES.find((profile) => profile.key === key);
const getBook = (id) => BOOKS.find((book) => book.id === id);
const getPurchaseUrl = (book) => `https://www.amazon.com.br/s?k=${encodeURIComponent(`${book.title} ${book.author}`)}`;

function announce(message) {
  const live = $("#live-message");
  if (live) live.textContent = message;
}

function syncAccountNav() {
  const control = $("[data-account-nav]");
  if (!control) return;
  control.textContent = state.account.user ? "Minha conta" : "Entrar / criar conta";
}

async function refreshAccountData() {
  const user = state.account.user;
  if (!user || !readingAccounts.accountsConfigured) return;
  state.account.loading = true;
  renderAccount();
  try {
    const data = await readingAccounts.loadReadingData(user.id);
    state.account.profile = data.profile;
    state.account.feedback = data.feedback;
    state.account.message = "";
  } catch (error) {
    state.account.message = error.message || "Não foi possível carregar seus dados.";
  } finally {
    state.account.loading = false;
    if (state.view === "account") renderAccount();
  }
}

function handleAuthChange(user, event) {
  state.account.user = user;
  state.account.profile = null;
  state.account.feedback = [];
  if (event === "PASSWORD_RECOVERY") state.account.mode = "update-password";
  state.account.loading = Boolean(user);
  syncAccountNav();
  if (user && state.account.mode !== "update-password") window.setTimeout(() => { if (state.account.user?.id === user.id) void refreshAccountData(); }, 0);
  else if (user && state.view === "account") { state.account.loading = false; renderAccount(); }
  else if (state.view === "account") renderAccount();
}

function switchView(view) {
  if (view === "admin" && !LOCAL_ADMIN_ENABLED) {
    view = "home";
    announce("O painel local não está disponível na versão pública.");
  }
  state.view = view;
  $$(".screen").forEach((screen) => {
    const isActive = screen.id === `${view}-view`;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });
  $(".main-nav")?.classList.remove("is-open");
  $(".menu-toggle")?.setAttribute("aria-expanded", "false");
  if (view === "admin") renderAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "account") renderAccount();
  const target = view === "quiz" ? $("#quiz-content") : view === "result" ? $("#result-content") : view === "admin" ? $("#admin-content") : view === "account" ? $("#account-content") : $("#hero-title");
  if (view !== "home") window.setTimeout(() => target?.focus?.({ preventScroll: true }), 80);
}

function startQuiz() {
  state.step = -1;
  state.answers = {};
  renderQuiz();
  switchView("quiz");
}

function optionList(question, selected) {
  if (question.kind === "multi") {
    const selectedList = Array.isArray(selected) ? selected : [];
    return `<p class="multi-help">Você pode marcar mais de uma opção.</p><div class="chip-options" role="group" aria-label="Selecione os gêneros">
      ${question.options.map((option) => `<button class="chip-option ${selectedList.includes(option) ? "is-selected" : ""}" type="button" data-option="${escapeHTML(option)}" aria-pressed="${selectedList.includes(option)}">${escapeHTML(option)}</button>`).join("")}
    </div>`;
  }
  if (question.kind === "text") {
    return `<textarea class="answer-field" id="answer-text" maxlength="500" placeholder="${escapeHTML(question.placeholder || "Escreva sua resposta…")}">${escapeHTML(selected || "")}</textarea><p class="field-hint">Opcional · até 500 caracteres</p>`;
  }
  return `<div class="answer-list" role="radiogroup" aria-label="Alternativas">
    ${question.options.map((option, index) => {
      const value = question.kind === "profile" ? option.label : (question.values?.[index] || option);
      const text = question.kind === "profile" ? option.text : option;
      const selectedValue = question.kind === "profile" ? selected : selected;
      const isSelected = selectedValue === value;
      const mark = question.kind === "profile" ? option.label : String(index + 1).padStart(2, "0");
      return `<button class="question-option ${isSelected ? "is-selected" : ""}" type="button" role="radio" aria-checked="${isSelected}" data-option="${escapeHTML(value)}"><span class="option-mark">${escapeHTML(mark)}</span><span class="option-text">${escapeHTML(text)}</span><span class="option-check" aria-hidden="true">✓</span></button>`;
    }).join("")}
  </div>`;
}

function renderQuiz() {
  const content = $("#quiz-content");
  if (!content) return;
  if (state.step < 0) {
    content.innerHTML = `<div class="quiz-intro">
      <div class="quiz-intro-copy"><p class="eyebrow">Seu mapa de leitura</p><h1 id="quiz-heading" tabindex="-1">Um pouco sobre<br><em>o seu jeito.</em></h1><p>São 12 escolhas para entender o que move sua leitura. Depois, algumas preferências ajudam a encontrar um livro para o seu momento.</p></div>
      <aside class="intro-note"><strong>Leva cerca de 4 minutos</strong><p>As 12 primeiras respostas compõem seu perfil. As demais orientam a indicação e não alteram a pontuação. O resultado é uma hipótese de preferência, não um diagnóstico.</p></aside>
    </div>
    <label class="consent-row"><input id="consent-check" type="checkbox"><span>Entendi que as respostas ficam neste navegador. Se eu criar uma conta, poderei escolher salvar meu perfil para personalizar as indicações.</span></label>
    <div class="begin-wrap"><button class="button button-primary" id="begin-mapping" type="button" disabled>Começar as perguntas <span aria-hidden="true">↗</span></button></div>`;
    $("#consent-check", content)?.addEventListener("change", (event) => { $("#begin-mapping", content).disabled = !event.target.checked; });
    $("#begin-mapping", content)?.addEventListener("click", () => { state.step = 0; renderQuiz(); window.scrollTo({ top: 0, behavior: "smooth" }); $("#quiz-heading")?.focus({ preventScroll: true }); });
    return;
  }
  const question = QUESTIONS[state.step];
  const selected = state.answers[question.id];
  const isAnswered = question.kind === "text" || (question.kind === "multi" ? Array.isArray(selected) && selected.length > 0 : Boolean(selected));
  const percent = Math.round(((state.step + 1) / QUESTIONS.length) * 100);
  const partLabel = question.kind === "profile" ? `PERFIL DO LEITOR · ${state.step + 1} DE 12` : `PREFERÊNCIAS · ${state.step - PROFILE_QUESTIONS.length + 1} DE ${PREFERENCE_QUESTIONS.length}`;
  content.innerHTML = `<div class="quiz-layout">
    <aside class="quiz-aside">
      <div class="quiz-progress-label"><strong>${String(state.step + 1).padStart(2, "0")}</strong><span>${String(QUESTIONS.length).padStart(2, "0")} perguntas</span></div>
      <div class="progress-track" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do questionário"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="quiz-aside-note"><strong>${escapeHTML(question.part)}</strong>${question.kind === "profile" ? "Cada resposta soma um ponto à dimensão correspondente. Se houver empate, o mapa mostra a combinação." : "Estas respostas ajudam a escolher um título e não alteram a pontuação do perfil."}</div>
    </aside>
    <section class="quiz-card" aria-labelledby="quiz-heading">
      <p class="question-kicker">${escapeHTML(partLabel)}</p>
      <h1 id="quiz-heading" tabindex="-1">${escapeHTML(question.title)}</h1>
      ${question.help ? `<p class="question-help">${escapeHTML(question.help)}</p>` : ""}
      ${optionList(question, selected)}
      <div class="quiz-controls"><button class="button button-outline" id="previous-question" data-action="previous-question" type="button" ${state.step === 0 ? "disabled" : ""}>Voltar</button><button class="button button-primary" id="next-question" data-action="next-question" type="button" ${!isAnswered ? "disabled" : ""}>${state.step === QUESTIONS.length - 1 ? "Ver meu relatório" : "Continuar"} <span aria-hidden="true">${state.step === QUESTIONS.length - 1 ? "↗" : "→"}</span></button></div>
    </section>
  </div>`;
}

function getScores(answers) {
  const scores = Object.fromEntries(PROFILES.map(({ key }) => [key, 0]));
  PROFILE_QUESTIONS.forEach((question) => {
    const letter = answers[question.id];
    const profile = PROFILE_LETTERS[letter];
    if (profile) scores[profile] += 1;
  });
  return scores;
}

function getRanking(scores) {
  const ranking = PROFILES.map((profile, order) => ({ ...profile, score: scores[profile.key], order })).sort((a, b) => b.score - a.score || a.order - b.order);
  const topScore = ranking[0]?.score ?? 0;
  const leaders = topScore ? ranking.filter((profile) => profile.score === topScore) : [];
  const secondaryScore = ranking.find((profile) => !leaders.some((leader) => leader.key === profile.key))?.score;
  const secondary = secondaryScore > 0 ? ranking.filter((profile) => !leaders.some((leader) => leader.key === profile.key) && profile.score === secondaryScore) : [];
  return { ranking, leaders, secondary, scores };
}

function getAvoidList(text) {
  const normalized = normalize(text);
  const topics = ["violencia", "luto", "racismo", "abuso", "morte", "doenca", "depressao", "suicidio", "fome", "pobreza", "machismo", "escravidao", "exilio", "destruicao"];
  return topics.filter((topic) => normalized.includes(topic));
}

function chooseBooks(answers, ranking, feedback = []) {
  const leaders = ranking.leaders.map((profile) => profile.key);
  const secondary = ranking.secondary.map((profile) => profile.key);
  const activeProfiles = leaders.length ? leaders : ranking.ranking.slice(0, 2).map((profile) => profile.key);
  const selectedGenres = (answers.q13 || []).map(normalize);
  const feedbackByBook = new Map(feedback.map(({ book_id, status }) => [book_id, status]));
  const preferredLength = answers.q14;
  const avoided = getAvoidList(answers.q17);
  const safeBooks = BOOKS.filter((book) => !["read", "skip"].includes(feedbackByBook.get(book.id)) && !book.alerts.some((alert) => avoided.includes(normalize(alert))));
  const rankedBooks = safeBooks.map((book) => {
    let score = book.profiles.some((key) => activeProfiles.includes(key)) ? 7 : 0;
    score += book.profiles.filter((key) => secondary.includes(key)).length * 1.4;
    score += book.genres.filter((genre) => selectedGenres.includes(normalize(genre))).length * 3;
    if (feedbackByBook.get(book.id) === "want") score += 4;
    if (preferredLength && preferredLength !== "sem-preferencia" && book.length === preferredLength) score += 2;
    if (answers.q19 === "Quero ser surpreendido" && book.id === "guia-galaxias") score += 0.5;
    return { book, score };
  }).sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "pt-BR"));
  return { picks: rankedBooks.slice(0, 3).map(({ book }) => book), avoided };
}

function getRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveRecord(record) {
  try {
    const records = getRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch { return false; }
}

function profilePayload(record, user) {
  return {
    user_id: user.id,
    display_name: String(user.user_metadata?.display_name || user.email?.split("@")[0] || "Leitor").slice(0, 120),
    answers: record.answers,
    profile_scores: record.scores,
    profile_leaders: record.leaders,
    preferred_genres: record.answers.q13 || [],
    avoided_topics: String(record.answers.q17 || "").slice(0, 500),
    updated_at: new Date().toISOString(),
  };
}

async function saveProfileToAccount(record) {
  const user = state.account.user;
  if (!user || !readingAccounts.accountsConfigured) return false;
  state.account.profile = await readingAccounts.saveReadingProfile(profilePayload(record, user));
  await refreshAccountData();
  return true;
}

async function completeQuiz() {
  const scores = getScores(state.answers);
  const ranking = getRanking(scores);
  const { picks, avoided } = chooseBooks(state.answers, ranking);
  const record = {
    id: globalThis.crypto?.randomUUID?.() || `leitor-${Date.now()}`,
    createdAt: new Date().toISOString(),
    answers: JSON.parse(JSON.stringify(state.answers)),
    scores,
    leaders: ranking.leaders.map(({ key }) => key),
    secondary: ranking.secondary.map(({ key }) => key),
    recommendation: picks[0]?.id || "",
    alternatives: picks.slice(1).map((book) => book.id),
  };
  state.report = { ...record, ranking, picks, avoided };
  const isSaved = saveRecord(record);
  renderReport(state.report);
  switchView("result");
  if (isSaved && state.account.user && readingAccounts.accountsConfigured) {
    try {
      await saveProfileToAccount(record);
      announce("Seu perfil foi salvo nesta conta e já pode orientar as próximas indicações.");
    } catch {
      announce("Seu relatório está salvo neste navegador, mas não foi possível sincronizar com a conta.");
    }
  } else {
    announce(isSaved ? "Seu relatório está pronto e foi salvo neste navegador." : "Seu relatório está pronto. Não foi possível salvar os dados neste navegador.");
  }
}

function pageLabel(value) {
  return ({ curto: "Livro curto", medio: "Livro médio", longo: "Livro longo" })[value] || "Sem preferência de tamanho";
}

function profileHeadline(leaders) {
  if (leaders.length > 1) return `Seu mapa fica entre ${leaders.map((profile) => profile.name).join(" e ")}.`;
  return `Seu perfil predominante é ${leaders[0]?.name || "em formação"}.`;
}

function renderBookFeature(book, index = 0) {
  if (!book) return `<div class="recommendation-empty">Com o catálogo demonstrativo, não encontramos um título que respeite todos os temas que você quer evitar. A equipe pode montar uma curadoria manual a partir das suas respostas.</div>`;
  const isMain = index === 0;
  const bookLength = pageLabel(book.length);
  const purchaseLink = `<a class="${isMain ? "book-purchase-link" : "mini-book-link"}" href="${escapeHTML(getPurchaseUrl(book))}" target="_blank" rel="noopener noreferrer" aria-label="Encontrar ${escapeHTML(book.title)} de ${escapeHTML(book.author)} para comprar na Amazon Brasil">Encontrar para comprar na Amazon</a>`;
  return `<article class="${isMain ? "book-feature" : "mini-book"}">
    ${isMain ? `<div class="book-cover" style="background:${escapeHTML(book.color)}"><small>NÔMADE · LEITURA ${String(index + 1).padStart(2, "0")}</small><strong>${escapeHTML(book.title)}</strong><small class="cover-author">${escapeHTML(book.author)}</small></div>` : ""}
    <div class="${isMain ? "book-copy" : ""}">
      ${isMain ? `<p class="eyebrow">${escapeHTML(index === 0 ? "Sua indicação principal" : "Outra rota possível")}</p>` : ""}
      <h3>${escapeHTML(book.title)}</h3>${isMain ? `<p class="book-author">${escapeHTML(book.author)}</p>` : `<p>${escapeHTML(book.author)} · ${escapeHTML(bookLength)}</p>`}
      ${isMain ? `<p>${escapeHTML(book.summary)} ${escapeHTML(book.note)}</p><div class="book-meta"><span>${escapeHTML(bookLength)}</span>${book.genres.slice(0, 2).map((genre) => `<span>${escapeHTML(genre)}</span>`).join("")}</div>${book.alerts.length ? `<p class="content-note">Temas presentes na obra: ${escapeHTML(book.alerts.join(", "))}.</p>` : ""}${purchaseLink}` : purchaseLink}
    </div>
  </article>`;
}

function renderAccount() {
  const content = $("#account-content");
  if (!content) return;
  const account = state.account;
  if (!readingAccounts.accountsConfigured) {
    content.innerHTML = `<header class="account-intro"><p class="eyebrow">Seu espaço de leitura</p><h1 id="account-title" tabindex="-1">Um lugar para suas próximas histórias.</h1><p>Crie uma conta para guardar seu perfil, mudar seus gêneros preferidos quando quiser e receber indicações que acompanham suas escolhas.</p></header>
      <section class="account-setup-note"><div><strong>Cadastro aguardando conexão</strong><p>Esta branch já tem a tela e a estrutura segura de contas. Para ativar o cadastro, configure um projeto Supabase com as variáveis abaixo e aplique a migração incluída.</p></div><code>VITE_SUPABASE_URL<br>VITE_SUPABASE_PUBLISHABLE_KEY</code></section>`;
    return;
  }
  if (account.loading) {
    content.innerHTML = `<div class="account-loading" role="status">Carregando seu espaço de leitura…</div>`;
    return;
  }
  if (account.user && account.mode === "update-password") {
    content.innerHTML = `<div class="account-auth-layout"><div class="account-intro"><p class="eyebrow">Seu espaço de leitura</p><h1 id="account-title" tabindex="-1">Escolha uma nova senha.</h1><p>Depois de salvar, você volta ao seu perfil de leitura.</p></div><form class="account-auth-form" id="account-password-form"><h2>Atualizar senha</h2><label>Nova senha<input name="password" type="password" minlength="8" autocomplete="new-password" required><small>Use pelo menos 8 caracteres.</small></label><label>Confirme a nova senha<input name="passwordConfirm" type="password" minlength="8" autocomplete="new-password" required></label><p class="account-form-message" role="status">${escapeHTML(account.message)}</p><button class="button button-primary" type="submit">Salvar nova senha</button></form></div>`;
    return;
  }
  if (!account.user) {
    const mode = account.mode;
    const signup = mode === "signup";
    const reset = mode === "reset";
    const title = signup ? "Crie seu espaço de leitura." : reset ? "Recupere o acesso." : "Volte às suas histórias.";
    const submitLabel = signup ? "Criar conta" : reset ? "Enviar link de recuperação" : "Entrar na minha conta";
    content.innerHTML = `<div class="account-auth-layout"><div class="account-intro"><p class="eyebrow">Seu espaço de leitura</p><h1 id="account-title" tabindex="-1">${title}</h1><p>${signup ? "Seu mapa e suas escolhas ficam guardados na conta. A curadoria aprende com seus gêneros e com os livros que você salva ou descarta." : "Acesse seu perfil e continue descobrindo livros no seu ritmo."}</p><div class="account-auth-note"><span aria-hidden="true">✳</span><p>Você pode trocar de gênero, atualizar suas preferências e recomeçar seu mapa sempre que quiser.</p></div></div>
      <form class="account-auth-form" id="account-auth-form" data-mode="${escapeHTML(mode)}"><h2>${title}</h2>${signup ? `<label>Como podemos chamar você?<input name="displayName" type="text" maxlength="120" autocomplete="name" required></label>` : ""}<label>E-mail<input name="email" type="email" autocomplete="email" required></label>${reset ? "" : `<label>Senha<input name="password" type="password" minlength="8" autocomplete="${signup ? "new-password" : "current-password"}" required><small>Use pelo menos 8 caracteres.</small></label>`}${signup ? `<label>Confirme sua senha<input name="passwordConfirm" type="password" minlength="8" autocomplete="new-password" required></label><label class="account-consent"><input name="consent" type="checkbox" required><span>Concordo em salvar minhas respostas e preferências nesta conta para personalizar indicações. Posso mudar ou apagar esses dados.</span></label>` : ""}<p class="account-form-message" role="status">${escapeHTML(account.message)}</p><button class="button button-primary" type="submit">${submitLabel}</button><div class="account-auth-switch">${signup ? `<button type="button" data-action="account-mode" data-mode="login">Já tenho conta</button>` : reset ? `<button type="button" data-action="account-mode" data-mode="login">Voltar para entrar</button>` : `<button type="button" data-action="account-mode" data-mode="signup">Criar uma conta</button><button type="button" data-action="account-mode" data-mode="reset">Esqueci minha senha</button>`}</div></form></div>`;
    return;
  }

  const user = account.user;
  const profile = account.profile;
  const readerName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "leitor";
  const latestLocal = state.report || getRecords()[0] || null;
  const feedbackText = escapeHTML(account.message);
  if (!profile) {
    content.innerHTML = `<header class="account-intro account-welcome"><div><p class="eyebrow">Seu espaço de leitura</p><h1 id="account-title" tabindex="-1">Olá, ${escapeHTML(readerName)}.</h1><p>Seu perfil de leitura ainda não está salvo nesta conta. Faça o questionário ou traga o último resultado guardado neste navegador.</p></div><button class="button button-outline button-small" type="button" data-action="account-sign-out">Sair da conta</button></header><p class="account-form-message" role="status">${feedbackText}</p><div class="account-empty"><span aria-hidden="true">✳</span><h2>Vamos encontrar sua próxima leitura?</h2><p>Responda às perguntas para começar. Você pode mudar de estilo e de gênero depois.</p><div class="account-empty-actions"><button class="button button-primary" type="button" data-action="start-quiz">Fazer meu mapa <span aria-hidden="true">↗</span></button>${latestLocal ? `<button class="button button-outline" type="button" data-action="account-import-latest">Salvar o último resultado deste navegador</button>` : ""}</div></div>`;
    return;
  }

  const preferredGenres = profile.preferred_genres?.length ? profile.preferred_genres : (profile.answers?.q13 || []);
  const answers = { ...(profile.answers || {}), q13: preferredGenres, q17: profile.avoided_topics || "" };
  const ranking = getRanking(profile.profile_scores || getScores(answers));
  const { picks } = chooseBooks(answers, ranking, account.feedback);
  const favoriteLabels = preferredGenres.length ? preferredGenres.join(", ") : "Aberto a novas descobertas";
  const genres = PREFERENCE_QUESTIONS.find((question) => question.id === "q13")?.options || [];
  const knownLeaders = (profile.profile_leaders || []).map(getProfile).filter(Boolean);
  const scoreSummary = PROFILES.map((item) => `<li><span>${escapeHTML(item.name)}</span><strong>${Number(profile.profile_scores?.[item.key] || 0)} / 12</strong></li>`).join("");
  const recommendations = picks.length ? picks.map((book, index) => {
    const status = account.feedback.find((item) => item.book_id === book.id)?.status;
    return `<div class="account-recommendation">${renderBookFeature(book, index)}<div class="account-feedback" aria-label="Sua opinião sobre ${escapeHTML(book.title)}"><button type="button" data-action="book-feedback" data-book-id="${escapeHTML(book.id)}" data-status="want" aria-pressed="${status === "want"}">${status === "want" ? "Salvo para ler" : "Quero ler"}</button><button type="button" data-action="book-feedback" data-book-id="${escapeHTML(book.id)}" data-status="read" aria-pressed="${status === "read"}">${status === "read" ? "Marcado como lido" : "Já li"}</button><button type="button" data-action="book-feedback" data-book-id="${escapeHTML(book.id)}" data-status="skip" aria-pressed="${status === "skip"}">${status === "skip" ? "Não recomendar" : "Não é meu estilo"}</button></div></div>`;
  }).join("") : `<div class="recommendation-empty">Você já avaliou os títulos deste catálogo. Mude seus gêneros preferidos ou atualize o mapa para abrir novas possibilidades.</div>`;
  content.innerHTML = `<header class="account-intro account-welcome"><div><p class="eyebrow">Seu espaço de leitura</p><h1 id="account-title" tabindex="-1">Olá, ${escapeHTML(readerName)}.</h1><p>Este mapa é seu ponto de partida. As próximas indicações mudam conforme seus gêneros e escolhas.</p></div><button class="button button-outline button-small" type="button" data-action="account-sign-out">Sair da conta</button></header>
    <p class="account-form-message" role="status">${feedbackText}</p>
    <div class="account-dashboard"><section class="account-column account-preferences"><article class="account-profile-card"><p class="eyebrow">Seu mapa de leitura</p><h2>${escapeHTML(profileHeadline(knownLeaders))}</h2><p>Gêneros: ${escapeHTML(favoriteLabels)}</p><ul class="account-score-list">${scoreSummary}</ul></article>
      <form class="account-preferences-form" id="account-preferences-form"><h2>O que você quer ler agora?</h2><p>Marque ou desmarque gêneros. A próxima lista vai acompanhar sua escolha.</p><fieldset><legend>Gêneros preferidos</legend><div class="account-genre-list">${genres.map((genre) => `<label><input type="checkbox" name="genres" value="${escapeHTML(genre)}" ${preferredGenres.includes(genre) ? "checked" : ""}><span>${escapeHTML(genre)}</span></label>`).join("")}</div></fieldset><label class="account-avoid-label">Temas que você prefere evitar<textarea name="avoidedTopics" maxlength="500" placeholder="Ex.: violência, luto…">${escapeHTML(profile.avoided_topics || "")}</textarea></label><button class="button button-primary" type="submit">Salvar preferências</button></form>
      <div class="account-data-actions"><button class="text-button" type="button" data-action="account-delete-reading-data">Apagar dados de leitura salvos nesta conta</button><small>Isso não encerra sua conta nem apaga os dados que continuam neste navegador.</small></div></section>
      <section class="account-column account-recommendations"><div class="account-recommendation-heading"><div><p class="eyebrow">Sua próxima parada</p><h2>Livros que combinam com você</h2></div><p>Gêneros, temas e seus sinais de interesse ajustam a ordem a cada visita.</p></div><div class="account-recommendation-list">${recommendations}</div><button class="button button-outline account-retake" type="button" data-action="start-quiz">Atualizar meu mapa</button></section></div>`;
}

function renderReport(report) {
  const content = $("#result-content");
  const leaders = report.leaders.map(getProfile).filter(Boolean);
  const secondary = report.secondary.map(getProfile).filter(Boolean);
  const scores = PROFILES.map((profile) => ({ ...profile, score: report.scores[profile.key] || 0 }));
  const maxScore = Math.max(1, ...scores.map((profile) => profile.score));
  const topDescription = leaders.length > 1
    ? `${leaders.map((profile) => profile.detail).join(" ")}`
    : leaders[0]?.detail || "Suas respostas estão distribuídas entre diferentes preferências. Continue experimentando para descobrir o que mais combina com você.";
  const otherProfiles = secondary.length ? secondary : report.ranking.ranking.filter((profile) => !report.leaders.includes(profile.key)).slice(0, 1);
  const secondaryProfile = otherProfiles[0] || null;
  const prefs = (report.answers.q13 || []).length ? report.answers.q13.join(", ") : "Aberto a novas sugestões";
  const excluded = String(report.answers.q17 || "").trim() || "Você não indicou temas para evitar.";
  const moment = String(report.answers.q18 || "").trim() || "Sem uma experiência específica por agora.";
  const quote = leaders.length > 1 ? "Você reúne mais de um jeito de ler. Use este mapa como ponto de partida, sem limitar as próximas descobertas." : leaders[0]?.short || "Seu mapa reúne diferentes maneiras de aproveitar uma história.";
  content.innerHTML = `<header class="result-header">
      <div><p class="eyebrow">Seu mapa está pronto</p><h1 id="report-title" tabindex="-1">Um caminho de<br><em>leitura para você.</em></h1></div>
      <div class="result-actions"><button class="button button-outline button-small" type="button" data-action="print-report">Salvar relatório em PDF</button>${LOCAL_ADMIN_ENABLED ? `<button class="button button-outline button-small" type="button" data-action="open-admin">Ver painel piloto</button>` : ""}</div>
    </header>
    <section class="result-grid" aria-label="Resumo do perfil">
      <article class="report-primary"><p class="eyebrow">SEU PERFIL LEITOR</p><h2>${escapeHTML(profileHeadline(leaders))}</h2><p>${escapeHTML(topDescription)}</p><span class="result-tag">${leaders.map((profile) => `${escapeHTML(profile.name)} · ${report.scores[profile.key]}`).join(" &nbsp; / &nbsp; ")}</span></article>
      <article class="secondary-profile"><div><span>DIMENSÃO SECUNDÁRIA</span><h3>${secondaryProfile ? escapeHTML(secondaryProfile.name) : "Seu mapa está equilibrado"}</h3><p>${secondaryProfile ? escapeHTML(secondaryProfile.detail) : "Suas respostas se dividiram entre os perfis. Isso também é um resultado válido."}</p></div><span class="secondary-score">${secondaryProfile ? `${report.scores[secondaryProfile.key]} <small>de 12</small>` : "↗"}</span></article>
    </section>
    <section class="score-section"><div class="score-intro"><h2>Como as respostas<br>se organizaram</h2><p>As 12 escolhas de perfil somam um ponto para cada dimensão. As perguntas seguintes entram na curadoria, não nesta pontuação.</p></div><div class="score-chart" role="img" aria-label="Pontuação de cada perfil">
      ${scores.map((profile) => `<div class="score-row"><span class="score-name">${escapeHTML(profile.name)}</span><div class="score-track"><div class="score-bar" style="width:${Math.max(2, (profile.score / maxScore) * 100)}%;background:${escapeHTML(profile.color)}"></div></div><span class="score-value">${profile.score}/12</span></div>`).join("")}
    </div></section>
    <section class="recommendation-section"><div class="recommendation-head"><div><p class="eyebrow">UMA PRIMEIRA PARADA</p><h2>Sua indicação literária</h2></div><p>Perfil, interesses, extensão e temas a evitar ajudam a compor esta sugestão inicial.</p></div>
      ${renderBookFeature(report.picks[0])}
      ${report.picks.length > 1 ? `<div class="more-books" aria-label="Outras opções de leitura">${report.picks.slice(1).map((book, index) => renderBookFeature(book, index + 1)).join("")}</div>` : ""}
      <p class="field-hint">Indicação gerada a partir de um catálogo demonstrativo do protótipo. A equipe de curadoria pode revisar cada sugestão.</p>
    </section>
    <section class="report-context"><div><p class="eyebrow">O QUE VOCÊ GOSTA DE LER</p><h3>Seus interesses</h3><p>${escapeHTML(prefs)}</p><p style="margin-top:9px">${escapeHTML(pageLabel(report.answers.q14))} · ${escapeHTML(report.answers.q16 || "Tempo flexível")}</p></div><div><p class="eyebrow">PARA ESTA PRÓXIMA LEITURA</p><h3>O que você procura</h3><p>${escapeHTML(moment)}</p><p style="margin-top:9px"><strong>Temas para evitar:</strong> ${escapeHTML(excluded)}</p><p style="margin-top:9px"><strong>Formato:</strong> ${escapeHTML(report.answers.q22 || "Sem preferência")} · <strong>Investimento:</strong> ${escapeHTML(report.answers.q21 || "Ainda não definido")}</p></div></section>
    <blockquote class="report-quote">“${escapeHTML(quote)}”</blockquote>
    <p class="report-method"><strong>Como ler este resultado:</strong> este mapa descreve preferências de leitura e não é um teste psicológico, diagnóstico ou avaliação de personalidade. É uma hipótese exploratória, que pode mudar com suas experiências.</p>
    <div class="result-bottom-actions"><button class="button button-primary" type="button" data-action="print-report">Imprimir ou salvar relatório em PDF <span aria-hidden="true">↗</span></button><button class="button button-outline" type="button" data-action="restart-quiz">Fazer outro mapa</button>${state.account.user ? "" : `<button class="button button-outline" type="button" data-action="open-account">Criar conta para salvar meu perfil</button>`}${LOCAL_ADMIN_ENABLED ? `<button class="button button-outline" type="button" data-action="open-admin">Abrir painel de curadoria</button>` : ""}</div>`;
}

function formatDate(iso) {
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso)); }
  catch { return "—"; }
}

function recordProfileLabel(record) {
  const keys = record.leaders?.length ? record.leaders : [];
  return keys.length ? keys.map((key) => getProfile(key)?.name || key).join(" + ") : "Sem pontuação";
}

function renderAdmin() {
  const content = $("#admin-content");
  if (!content) return;
  if (!LOCAL_ADMIN_ENABLED) {
    content.innerHTML = `<div class="empty-state"><strong>Painel indisponível</strong>O painel deste protótipo só funciona localmente e não reúne respostas de outros navegadores.</div>`;
    return;
  }
  const records = getRecords();
  const distribution = Object.fromEntries(PROFILES.map(({ key }) => [key, 0]));
  records.forEach((record) => (record.leaders || []).forEach((key) => { if (key in distribution) distribution[key] += 1; }));
  const mostCommon = PROFILES.reduce((best, profile) => distribution[profile.key] > distribution[best.key] ? profile : best, PROFILES[0]);
  const mostCommonCount = distribution[mostCommon.key];
  const details = state.selectedRecord ? records.find((record) => record.id === state.selectedRecord) : null;
  content.innerHTML = `<header class="admin-header"><div><p class="eyebrow">VISÃO DO TESTE PILOTO</p><h1 id="admin-title" tabindex="-1">Painel da curadoria</h1><p>Acompanhe as respostas, veja como o perfil se conecta à indicação e leve os dados para sua planilha.</p></div><div class="admin-actions"><button class="button button-primary button-small" type="button" data-action="export-csv" ${records.length ? "" : "disabled"}>Baixar respostas CSV <span aria-hidden="true">↓</span></button><button class="button button-outline button-small" type="button" data-action="start-quiz">Nova resposta</button></div></header>
    <section class="admin-metrics" aria-label="Resumo do piloto"><div class="metric"><span>Questionários concluídos</span><strong>${records.length}</strong></div><div class="metric"><span>Perfil mais frequente</span><strong style="font-size:${mostCommonCount ? "25px" : "21px"}">${mostCommonCount ? escapeHTML(mostCommon.name) : "Aguardando"}</strong></div><div class="metric"><span>Indicações geradas</span><strong>${records.filter((record) => Boolean(record.recommendation)).length}</strong></div></section>
    <div class="admin-columns"><section class="admin-panel-block"><h2>Perfis mapeados</h2>${records.length ? `<div class="distribution">${PROFILES.map((profile) => `<div class="distribution-row"><span>${escapeHTML(profile.name)}</span><div class="distribution-track"><div class="distribution-fill" style="width:${records.length ? (distribution[profile.key] / records.length) * 100 : 0}%"></div></div><span class="distribution-value">${distribution[profile.key]}</span></div>`).join("")}</div>` : `<div class="empty-state"><strong>O primeiro mapa abre o caminho</strong>Quando alguém concluir o questionário, o resumo por perfil aparece aqui.</div>`}<aside class="pilot-note">O resultado é uma hipótese exploratória. Use as respostas e os comentários para ajustar as perguntas e os critérios de curadoria.</aside></section>
    <section class="admin-panel-block"><h2>Respostas recentes <span style="color:var(--muted);font:400 11px var(--font-body)">(${records.length})</span></h2>${records.length ? `<div class="records-wrap"><table class="records-table"><thead><tr><th>PARTICIPANTE</th><th>PERFIL</th><th>INDICAÇÃO</th><th>DATA</th><th></th></tr></thead><tbody>${records.map((record) => { const book = getBook(record.recommendation); return `<tr><td><button class="record-name" type="button" data-action="open-record" data-id="${escapeHTML(record.id)}">Leitor ${escapeHTML(record.id.slice(0, 6).toUpperCase())}</button></td><td><span class="record-profile">${escapeHTML(recordProfileLabel(record))}</span></td><td>${escapeHTML(book?.title || "Curadoria manual")}</td><td>${escapeHTML(formatDate(record.createdAt))}</td><td><button class="delete-record" type="button" data-action="delete-record" data-id="${escapeHTML(record.id)}" aria-label="Apagar resposta" title="Apagar resposta">×</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty-state"><strong>Nenhuma resposta por enquanto</strong>Comece pelo questionário para ver como o relatório de cada leitor aparece neste painel.</div>`}</section>
    ${details ? renderRecordDetails(details) : ""}</div>
    <p class="admin-footnote">As respostas e o painel ficam salvos apenas no armazenamento local deste navegador. Baixe o CSV para guardar uma cópia ou continuar a análise em uma planilha. Este protótipo ainda não envia relatórios por e-mail nem compartilha dados entre dispositivos.</p>`;
}

function renderRecordDetails(record) {
  const book = getBook(record.recommendation);
  const detailAnswers = Object.entries(record.answers || {});
  const answerText = (question, value) => {
    if (Array.isArray(value)) return value.join(", ") || "Não informado";
    const selected = question.options?.find((option, index) => (question.kind === "profile" ? option.label : question.values?.[index] || option) === value);
    return selected ? (question.kind === "profile" ? `${value}. ${selected.text}` : selected.text) : (value || "Não informado");
  };
  return `<section class="record-detail"><div class="record-detail-head"><div><h3>Relatório de ${escapeHTML(recordProfileLabel(record))}</h3><p>Concluído em ${escapeHTML(formatDate(record.createdAt))}${book ? ` · Indicação: ${escapeHTML(book.title)} — ${escapeHTML(book.author)}` : ""}</p></div><button class="text-button" type="button" data-action="close-record">Fechar ×</button></div><h4>PONTUAÇÃO DE PERFIL</h4><ul class="record-answer-list">${PROFILES.map((profile) => `<li><strong>${escapeHTML(profile.name)}:</strong> ${record.scores?.[profile.key] || 0} de 12</li>`).join("")}</ul><h4>RESPOSTAS DO QUESTIONÁRIO</h4><ul class="record-answer-list">${detailAnswers.map(([id, value]) => { const question = QUESTIONS.find((item) => item.id === id); return `<li><strong>${escapeHTML(id.toUpperCase())} · ${escapeHTML(question?.title || "Preferência")}:</strong> ${escapeHTML(answerText(question || {}, value))}</li>`; }).join("")}</ul></section>`;
}

function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

function exportCSV() {
  const records = getRecords();
  const headers = ["identificador", "data", "perfil predominante", "perfil secundario", "indicacao", ...PROFILES.map((profile) => `pontuacao ${profile.name.toLowerCase()}`), ...QUESTIONS.map((question) => question.title)];
  const rows = records.map((record) => {
    const primary = (record.leaders || []).map((key) => getProfile(key)?.name || key).join(" + ");
    const secondary = (record.secondary || []).map((key) => getProfile(key)?.name || key).join(" + ");
    const book = getBook(record.recommendation);
    const responseValues = QUESTIONS.map((question) => {
      const value = record.answers?.[question.id];
      if (Array.isArray(value)) return value.join(", ");
      const answer = question.options?.find((option, index) => (question.kind === "profile" ? option.label : question.values?.[index] || option) === value);
      return answer ? `${question.kind === "profile" ? `${value}. ` : ""}${question.kind === "profile" ? answer.text : answer}` : value || "";
    });
    return [record.id, formatDate(record.createdAt), primary, secondary, book ? `${book.title} — ${book.author}` : "", ...PROFILES.map((profile) => record.scores?.[profile.key] || 0), ...responseValues];
  });
  const csv = "\ufeff" + [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `nomade-literario-respostas-${new Date().toISOString().slice(0, 10)}.csv`);
  announce("Arquivo CSV preparado.");
}

function triggerDownload(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function removeRecord(id) {
  const records = getRecords().filter((record) => record.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* Mantém o painel aberto caso o armazenamento esteja indisponível. */ }
  if (state.selectedRecord === id) state.selectedRecord = null;
  renderAdmin();
  announce("Resposta removida do painel.");
}

document.addEventListener("click", (event) => {
  const option = event.target.closest(".question-option, .chip-option");
  if (option && state.view === "quiz" && state.step >= 0) {
    const question = QUESTIONS[state.step];
    const value = option.dataset.option;
    if (question.kind === "multi") {
      const selected = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
      state.answers[question.id] = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    } else state.answers[question.id] = value;
    renderQuiz();
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget) {
    event.preventDefault();
    switchView(viewTarget.dataset.view);
    return;
  }
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "start-quiz") startQuiz();
  else if (action === "open-account") switchView("account");
  else if (action === "account-mode") { state.account.mode = actionTarget.dataset.mode; state.account.message = ""; renderAccount(); }
  else if (action === "account-sign-out") readingAccounts.signOut().catch((error) => { state.account.message = error.message || "Não foi possível sair da conta."; renderAccount(); });
  else if (action === "account-import-latest") {
    const latestRecord = state.report || getRecords()[0];
    if (latestRecord && window.confirm("Salvar as respostas do último resultado deste navegador nesta conta?")) {
      saveProfileToAccount(latestRecord).then(() => { state.account.message = "Seu perfil foi salvo nesta conta."; renderAccount(); }).catch((error) => { state.account.message = error.message || "Não foi possível salvar esse perfil."; renderAccount(); });
    }
  } else if (action === "account-delete-reading-data") {
    if (window.confirm("Apagar desta conta seu perfil e suas escolhas sobre livros? Esta ação não encerra a conta e não apaga os dados deste navegador.")) {
      readingAccounts.deleteReadingData(state.account.user.id).then(() => {
        state.account.profile = null;
        state.account.feedback = [];
        state.account.message = "Os dados de leitura desta conta foram apagados.";
        renderAccount();
      }).catch((error) => { state.account.message = error.message || "Não foi possível apagar os dados."; renderAccount(); });
    }
  } else if (action === "book-feedback") {
    readingAccounts.saveBookFeedback({ userId: state.account.user.id, bookId: actionTarget.dataset.bookId, status: actionTarget.dataset.status }).then(() => refreshAccountData()).catch((error) => {
      state.account.message = error.message || "Não foi possível guardar essa escolha.";
      renderAccount();
    });
  }
  else if (action === "print-report") window.print();
  else if (action === "restart-quiz") startQuiz();
  else if (action === "open-admin" && LOCAL_ADMIN_ENABLED) switchView("admin");
  else if (action === "export-csv") exportCSV();
  else if (action === "open-record") { state.selectedRecord = actionTarget.dataset.id; renderAdmin(); }
  else if (action === "close-record") { state.selectedRecord = null; renderAdmin(); }
  else if (action === "delete-record") {
    if (window.confirm("Apagar esta resposta do painel deste navegador?")) removeRecord(actionTarget.dataset.id);
  } else if (action === "clear-records") {
    if (window.confirm("Apagar todas as respostas salvas neste navegador?")) { localStorage.removeItem(STORAGE_KEY); state.selectedRecord = null; renderAdmin(); }
  } else if (action === "next-question") {
    const question = QUESTIONS[state.step];
    if (question.kind === "text") state.answers[question.id] = $("#answer-text")?.value || "";
    const selected = state.answers[question.id];
    if (question.kind !== "text" && (question.kind === "multi" ? !selected?.length : !selected)) return;
    if (state.step === QUESTIONS.length - 1) completeQuiz();
    else { state.step += 1; renderQuiz(); $("#quiz-heading")?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  } else if (action === "previous-question") {
    if ($( "#answer-text")) state.answers[QUESTIONS[state.step].id] = $("#answer-text").value;
    if (state.step > 0) { state.step -= 1; renderQuiz(); $("#quiz-heading")?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }
});

document.addEventListener("submit", async (event) => {
  const authForm = event.target.closest("#account-auth-form");
  if (authForm) {
    event.preventDefault();
    const formData = new FormData(authForm);
    const mode = authForm.dataset.mode;
    const email = String(formData.get("email") || "").trim();
    const submitButton = $("button[type=submit]", authForm);
    submitButton.disabled = true;
    state.account.message = "";
    try {
      if (mode === "signup") {
        const password = String(formData.get("password") || "");
        if (password !== formData.get("passwordConfirm")) throw new Error("As senhas não são iguais.");
        if (!formData.get("consent")) throw new Error("Marque a autorização para salvar e personalizar seu perfil.");
        const { data, error } = await readingAccounts.createAccount({ displayName: String(formData.get("displayName") || "").trim(), email, password });
        if (error) throw error;
        if (data.session?.user) {
          handleAuthChange(data.session.user);
          state.account.message = "Conta criada. Seu perfil já pode ser salvo nesta conta.";
          if (state.report) await saveProfileToAccount(state.report);
        } else {
          state.account.message = "Conta criada. Confirme seu e-mail pelo link enviado para entrar e salvar seu perfil.";
        }
      } else if (mode === "reset") {
        const { error } = await readingAccounts.sendPasswordReset(email);
        if (error) throw error;
        state.account.message = "Se houver uma conta para esse e-mail, enviaremos um link para redefinir a senha.";
      } else {
        const { data, error } = await readingAccounts.signIn({ email, password: String(formData.get("password") || "") });
        if (error) throw error;
        handleAuthChange(data.user);
        state.account.message = "Entrada concluída.";
      }
    } catch (error) {
      state.account.message = error.message || "Não foi possível concluir essa etapa.";
    } finally {
      if (authForm.isConnected) submitButton.disabled = false;
      renderAccount();
    }
    return;
  }

  const passwordForm = event.target.closest("#account-password-form");
  if (passwordForm) {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    const password = String(formData.get("password") || "");
    if (password !== formData.get("passwordConfirm")) {
      state.account.message = "As senhas não são iguais.";
      renderAccount();
      return;
    }
    try {
      await readingAccounts.updatePassword(password);
      state.account.mode = "login";
      state.account.message = "Senha atualizada.";
      await refreshAccountData();
    } catch (error) {
      state.account.message = error.message || "Não foi possível atualizar a senha.";
      renderAccount();
    }
    return;
  }

  const preferencesForm = event.target.closest("#account-preferences-form");
  if (preferencesForm) {
    event.preventDefault();
    const formData = new FormData(preferencesForm);
    const preferredGenres = formData.getAll("genres").map(String);
    const avoidedTopics = String(formData.get("avoidedTopics") || "").trim().slice(0, 500);
    const profile = state.account.profile;
    try {
      state.account.profile = await readingAccounts.saveReadingProfile({
        user_id: state.account.user.id,
        display_name: profile.display_name,
        answers: { ...(profile.answers || {}), q13: preferredGenres, q17: avoidedTopics },
        profile_scores: profile.profile_scores,
        profile_leaders: profile.profile_leaders,
        preferred_genres: preferredGenres,
        avoided_topics: avoidedTopics,
        updated_at: new Date().toISOString(),
      });
      state.account.message = "Preferências salvas. Suas próximas sugestões já refletem essa mudança.";
      await refreshAccountData();
    } catch (error) {
      state.account.message = error.message || "Não foi possível salvar suas preferências.";
      renderAccount();
    }
  }
});

$(".menu-toggle")?.addEventListener("click", (event) => {
  const nav = $(".main-nav");
  const isOpen = nav.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.setAttribute("aria-label", isOpen ? "Fechar navegação" : "Abrir navegação");
});

syncAccountNav();
readingAccounts.subscribeToAuth(handleAuthChange);
if (!readingAccounts.accountsConfigured) state.account.loading = false;

if (LOCAL_ADMIN_ENABLED) {
  $$('[data-local-admin]').forEach((control) => { control.hidden = false; });
}

$$('[data-home-anchor]').forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  const target = document.querySelector(link.getAttribute("href"));
  switchView("home");
  window.setTimeout(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}));
