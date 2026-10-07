"use strict";

// The lesson's interactions are implemented locally, with no API calls.
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const themePreference = window.matchMedia("(prefers-color-scheme: dark)");
  const themeButton = $("#theme-toggle");
  let hasThemePreference = false;
  try { hasThemePreference = ["light", "dark"].includes(localStorage.getItem("lesson-theme")); } catch {}

  function applyTheme(theme, persist = false) {
    document.documentElement.dataset.theme = theme;
    const action = theme === "dark" ? "modo claro" : "modo escuro";
    $("#theme-label").textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
    themeButton.setAttribute("aria-label", `Ativar ${action}`);
    themeButton.title = `Ativar ${action}`;
    $('meta[name="theme-color"]').content = theme === "dark" ? "#101722" : "#2455d6";
    if (persist) {
      hasThemePreference = true;
      try { localStorage.setItem("lesson-theme", theme); } catch {}
    }
  }

  applyTheme(document.documentElement.dataset.theme || (themePreference.matches ? "dark" : "light"));
  themeButton.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
  themePreference.addEventListener("change", event => {
    if (!hasThemePreference) applyTheme(event.matches ? "dark" : "light");
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (milliseconds) => new Promise(resolve => window.setTimeout(resolve, reducedMotion ? 0 : milliseconds));
  const selectButton = (selector, target) => $$(selector).forEach(button => {
    const selected = button === target;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const categories = { tecnico: "Técnico", financeiro: "Financeiro", cancelamento: "Cancelamento", comercial: "Comercial" };
  const responses = {
    tecnico: "Vou encaminhar sua solicitação ao suporte técnico para verificar a conexão.",
    financeiro: "Vou encaminhar sua solicitação ao financeiro para revisar a fatura.",
    cancelamento: "Vou encaminhar sua solicitação à equipe de cancelamento.",
    comercial: "Vou encaminhar sua solicitação à equipe comercial para apresentar os planos."
  };

  // Navigation: determine the current chapter at the reading line, including the bottom of the page.
  const sections = $$(".lesson-section");
  const navLinks = $$("nav a");
  let navigationFrame = 0;
  function updateNavigation() {
    navigationFrame = 0;
    const readingLine = window.scrollY + Math.min(window.innerHeight * .25, 220);
    let current = 0;
    sections.forEach((section, index) => {
      if (section.offsetTop <= readingLine) current = index;
    });
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 100;
    if (progress >= 99.5) current = sections.length - 1;
    navLinks.forEach((link, index) => {
      link.classList.toggle("active", index === current);
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    $("#current-section").textContent = sections[current].dataset.title;
    $("#progress-label").textContent = `${String(current + 1).padStart(2, "0")} / 11`;
    $("#progress-fill").style.width = `${progress}%`;
    $(".progress-track").setAttribute("aria-valuenow", String(Math.round(progress)));
  }
  function scheduleNavigation() {
    if (!navigationFrame) navigationFrame = window.requestAnimationFrame(updateNavigation);
  }
  window.addEventListener("scroll", scheduleNavigation, { passive: true });
  window.addEventListener("resize", scheduleNavigation);
  window.addEventListener("load", updateNavigation);
  updateNavigation();

  const menuToggle = $("#menu-toggle");
  function closeMenu() {
    $("#sidebar").classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir conteúdo da aula");
  }
  menuToggle.addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar conteúdo da aula" : "Abrir conteúdo da aula");
  });
  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && $("#sidebar").classList.contains("open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener("click", event => {
    if (!$("#sidebar").contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  // LangChain composition, with a finite, user-triggered animation.
  const pipelineSteps = [
    "Entrada recebida: uma pergunta do usuário.",
    "Prompt: a pergunta é inserida na instrução.",
    "Model: a LLM recebe o prompt e gera uma resposta.",
    "Parser: a resposta é convertida para o formato esperado.",
    "Saída: o resultado está pronto para a aplicação."
  ];
  $("#pipeline-run").addEventListener("click", async () => {
    const button = $("#pipeline-run");
    button.disabled = true;
    const nodes = $$("[data-pipe]");
    nodes.forEach(node => node.classList.remove("active", "done"));
    for (let index = 0; index < nodes.length; index++) {
      if (index > 0) {
        nodes[index - 1].classList.remove("active");
        nodes[index - 1].classList.add("done");
      }
      nodes[index].classList.add("active");
      $("#pipeline-status").textContent = pipelineSteps[index];
      await wait(650);
    }
    button.disabled = false;
    button.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z"/></svg>Executar novamente';
  });

  // SVG diagrams describe control flow rather than decorative artwork.
  function drawEvolution(mode) {
    const branching = mode !== "linear";
    const nodes = branching
      ? [["Entrada", 65, 120], ["A", 215, 120], ["B", 415, 55], ["C", 415, 185], ["D", 655, 120]]
      : [["Entrada", 65, 120], ["A", 215, 120], ["B", 365, 120], ["C", 515, 120], ["D", 665, 120]];
    const paths = branching
      ? ["M110 120H166", "M260 120H295V55H366", "M260 120H295V185H366", "M460 55H525V120H606", "M460 185H525V120H606"]
      : ["M110 120H166", "M260 120H316", "M410 120H466", "M560 120H616"];
    if (mode === "cycle") paths.push("M655 92V12H215V92");
    $("#evolution-lines").innerHTML = paths.map((path, index) => `<path class="svg-edge ${branching && index > 0 ? "accent" : ""}" d="${path}"/>`).join("");
    $("#evolution-nodes").innerHTML = nodes.map(([label, x, y], index) => `<g class="${branching && (index === 2 || index === 3) ? "accent" : ""}"><rect x="${x - 45}" y="${y - 27}" width="90" height="54"/><text x="${x}" y="${y}">${label}</text></g>`).join("");
    const descriptions = {
      linear: ["A → B → C → D: o caminho já está definido.", "E se o próximo passo depender do resultado anterior?", "Fluxo linear: Entrada, A, B, C e D"],
      branch: ["Depois de A, uma decisão seleciona B ou C. Ambos podem levar a D.", "E se precisarmos voltar para uma etapa anterior?", "Grafo com decisão: Entrada, A, B ou C, depois D"],
      cycle: ["O fluxo pode voltar de D para A. A condição de parada evita um ciclo sem fim.", "Agora precisamos controlar decisões, estado e retomada.", "Grafo com decisão e ciclo de D para A"]
    };
    $("#evolution-caption").textContent = descriptions[mode][0];
    $("#evolution-question").textContent = descriptions[mode][1];
    $("#evolution-title").textContent = descriptions[mode][2];
  }
  $$("[data-flow-mode]").forEach(button => button.addEventListener("click", () => {
    selectButton("[data-flow-mode]", button);
    drawEvolution(button.dataset.flowMode);
  }));
  drawEvolution("linear");

  const conceptContent = {
    state: ["Os dados compartilhados pelo fluxo.", "O state muda conforme as etapas executam. Cada node lê os dados disponíveis e pode atualizar parte deles.", '{\n  mensagem: "Quero cancelar meu plano",\n  categoria: "cancelamento",\n  resposta: ""\n}'],
    node: ["Uma etapa do processamento.", "Um node normalmente recebe o State e devolve atualizações para ele. A atualização parcial é aplicada ao estado compartilhado.", 'State\n  ↓\nclassificar_cliente(state)\n  ↓\n{ categoria: "cancelamento" }\n  Partial State'],
    edge: ["Define para onde o fluxo segue.", "Uma edge fixa liga dois nodes. Uma conditional edge decide o próximo destino com base no state.", 'Node A → Node B\n\nOu, com uma decisão:\n       Node A\n       ↙    ↘\n      B      C']
  };
  function chooseConcept(button) {
    $$("[data-concept]").forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    const [title, description, example] = conceptContent[button.dataset.concept];
    $("#concept-title").textContent = title;
    $("#concept-description").textContent = description;
    $("#concept-example code").textContent = example;
    $("#concept-panel").setAttribute("aria-labelledby", button.id);
  }
  $$("[data-concept]").forEach((button, index, tabs) => {
    button.addEventListener("click", () => chooseConcept(button));
    button.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      chooseConcept(tabs[next]);
      tabs[next].focus();
    });
  });

  const exampleState = { mensagem: "Quero cancelar meu plano", categoria: "", resposta: "" };
  $$("[data-state-step]").forEach(button => button.addEventListener("click", () => {
    const step = Number(button.dataset.stateStep);
    const state = { ...exampleState, categoria: step >= 1 ? "cancelamento" : "", resposta: step >= 2 ? responses.cancelamento : "" };
    selectButton("[data-state-step]", button);
    $("#state-code").textContent = JSON.stringify(state, null, 2);
    $("#state-caption").textContent = ["Na entrada, temos a mensagem. As outras informações ainda serão preenchidas.", "O node de classificação atualizou apenas a categoria.", "O node de atendimento adicionou a resposta. Mensagem e categoria permanecem."][step];
  }));

  // The simulator is intentionally deterministic: the notebook supplies the real LLM.
  function classify(message) {
    const text = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (/cancel|encerrar/.test(text)) return "cancelamento";
    if (/fatura|cobranca|pagamento/.test(text)) return "financeiro";
    if (/internet|conexao|funcionar/.test(text)) return "tecnico";
    return "comercial";
  }
  let routerRun = 0;
  function resetRouter() {
    routerRun++;
    $$("#router-graph .active, #router-graph .done, #router-graph .dimmed").forEach(node => node.classList.remove("active", "done", "dimmed"));
    $("#router-state").textContent = JSON.stringify({ mensagem: "", categoria: "", resposta: "" }, null, 2);
    $("#router-status").textContent = "Pronto para receber uma mensagem.";
    $("#router-run").disabled = false;
    $("#customer-message").disabled = false;
  }
  $("#router-reset").addEventListener("click", resetRouter);
  $("#customer-message").addEventListener("change", resetRouter);
  $("#router-run").addEventListener("click", async () => {
    resetRouter();
    const execution = routerRun;
    const button = $("#router-run");
    button.disabled = true;
    $("#customer-message").disabled = true;
    const state = { mensagem: $("#customer-message").value, categoria: "", resposta: "" };
    const setState = () => { $("#router-state").textContent = JSON.stringify(state, null, 2); };
    const activate = step => { $(`[data-route-step="${step}"]`).classList.add("active"); };
    const complete = step => {
      const node = $(`[data-route-step="${step}"]`);
      node.classList.remove("active");
      node.classList.add("done");
    };
    setState();
    activate("start");
    $("#router-status").textContent = "START · Mensagem recebida.";
    await wait(600);
    if (execution !== routerRun) return;
    complete("start"); activate("classify");
    $("#router-status").textContent = "CLASSIFICAR · Lendo a mensagem.";
    await wait(850);
    if (execution !== routerRun) return;
    state.categoria = classify(state.mensagem); setState();
    complete("classify"); activate("decide");
    $("#router-status").textContent = `DECISÃO · Categoria: ${state.categoria}.`;
    await wait(700);
    if (execution !== routerRun) return;
    complete("decide");
    $$("[data-route]").forEach(node => {
      const selected = node.dataset.route === state.categoria;
      node.classList.toggle("active", selected);
      node.classList.toggle("dimmed", !selected);
    });
    $(`[data-route-line="${state.categoria}"]`).classList.add("active");
    $("#router-status").textContent = `ATENDIMENTO · Node ${categories[state.categoria]}.`;
    await wait(900);
    if (execution !== routerRun) return;
    state.resposta = responses[state.categoria]; setState(); activate("end");
    $("#router-status").textContent = `END · Fluxo concluído pela rota ${categories[state.categoria]}.`;
    button.disabled = false;
    $("#customer-message").disabled = false;
  });

  $$("[data-conditional]").forEach(button => button.addEventListener("click", () => {
    selectButton("[data-conditional]", button);
    const category = button.dataset.conditional;
    $("#conditional-value").textContent = `state["categoria"] = "${category}"`;
    $("#conditional-caption").textContent = `O próximo node será: ${categories[category]}.`;
  }));

  let promptStep = -1;
  $("#prompt-reveal").addEventListener("click", () => {
    const parts = $$("[data-prompt-part]");
    if (promptStep === -1 || promptStep === parts.length - 1) {
      promptStep = 0;
    } else promptStep++;
    parts.forEach((part, index) => { part.hidden = index > promptStep; });
    $("#prompt-reveal").textContent = promptStep === parts.length - 1 ? "Recomeçar montagem" : `Adicionar ${["contexto", "tarefa", "regras", "formato", "exemplo"][promptStep]}`;
    $("#prompt-reveal").setAttribute("aria-expanded", "true");
  });
  $("#prompt-compare").addEventListener("click", () => {
    const result = $("#prompt-result");
    result.hidden = !result.hidden;
    $("#prompt-compare").textContent = result.hidden ? "Comparar saídas" : "Ocultar comparação";
    $("#prompt-compare").setAttribute("aria-expanded", String(!result.hidden));
  });

  const integrationCaptions = {
    provider: "Provider: a infraestrutura que oferece acesso aos modelos.",
    model: "Model: o modelo que recebe instruções e gera uma resposta.",
    prompt: "PromptTemplate: prepara a instrução e insere os dados antes da chamada ao modelo.",
    node: "Node: executa uma etapa; pode conter a chain prompt | model | parser.",
    state: "State: os dados compartilhados que os nodes leem e atualizam.",
    graph: "LangGraph: coordena nodes, caminhos, ciclos e persistência do estado."
  };
  $$("[data-integration]").forEach(button => button.addEventListener("click", () => {
    selectButton("[data-integration]", button);
    $("#integration-caption").textContent = integrationCaptions[button.dataset.integration];
  }));

  const checkpointStates = [
    { mensagem: "Minha fatura veio errada.", categoria: "", resposta: "" },
    { mensagem: "Minha fatura veio errada.", categoria: "financeiro", resposta: "" },
    { mensagem: "Minha fatura veio errada.", categoria: "financeiro", resposta: responses.financeiro }
  ];
  $$("[data-checkpoint]").forEach(button => button.addEventListener("click", () => {
    const step = Number(button.dataset.checkpoint);
    $$("[data-checkpoint]").forEach(item => {
      const selected = item.dataset.checkpoint === String(step);
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    $("#checkpoint-label").textContent = `CHECKPOINT ${step + 1} · APÓS ${["A", "B", "C"][step]}`;
    $("#checkpoint-code").textContent = JSON.stringify(checkpointStates[step], null, 2);
    $("#checkpoint-caption").textContent = ["A mensagem foi recebida. A categoria ainda não foi definida.", "A classificação foi salva: a rota é financeiro.", "A resposta foi adicionada. Este snapshot contém o estado após o atendimento."][step];
  }));

  let architectureLayer = 0;
  const architectureNames = ["State", "Conditional Edges", "Prompts + LLM", "Checkpoints"];
  $("#architecture-next").addEventListener("click", () => {
    if (architectureLayer === architectureNames.length) architectureLayer = 0;
    else architectureLayer++;
    $$("[data-layer]").forEach((layer, index) => { layer.hidden = index >= architectureLayer; });
    ["with-state", "with-edges", "with-llm", "with-checkpoints"].forEach((name, index) => $(".architecture-flow").classList.toggle(name, index < architectureLayer));
    $("#architecture-hint").hidden = architectureLayer > 0;
    $("#architecture-next").textContent = architectureLayer === architectureNames.length ? "Reiniciar arquitetura" : `Adicionar ${architectureNames[architectureLayer]}`;
    $("#architecture-status").textContent = architectureLayer === architectureNames.length ? "Arquitetura completa · LangChain nos nodes, LangGraph no fluxo." : `Fluxo base · ${architectureLayer} de 4 camadas`;
  });

  $("#rag-expand").addEventListener("click", () => {
    const expanded = $("#rag-expansion").hidden;
    $("#rag-expansion").hidden = !expanded;
    $("#rag-expand").setAttribute("aria-expanded", String(expanded));
    $("#rag-expand").textContent = expanded ? "Voltar ao fluxo base" : "Adicionar consulta RAG";
    $("#rag-response-label").textContent = expanded ? "Resposta com contexto da empresa" : "Resposta";
  });
})();
