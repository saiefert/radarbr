/* RadarBR — Multi-City Real-Time Hourly Crime & Traffic Map (+ Hidden Imóveis Module) */
(() => {
  "use strict";

  const URL_PARAMS = new URLSearchParams(window.location.search);

  // Feature flags: Imóveis module is kept ready in code & data/casas.json, hidden by default (enable with ?imoveis=1)
  const FEATURES = {
    imoveis: URL_PARAMS.get("imoveis") === "1",
  };

  const RECENT_HOURS_THRESHOLD = 3; // Highlight occurrences from the last 3 hours as "Recente"
  const AUTO_REFRESH_MS = 15 * 60 * 1000; // Gentle background check every 15 minutes

  const BASEMAP_STEPS = [
    { id: "clean", label: "Clean" },
    { id: "streets", label: "Ruas" },
    { id: "satellite", label: "Satélite" },
  ];

  const UI_ICONS = {
    shieldAlert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.7-7.5 9.8-4.3-1.1-7.5-5-7.5-9.8V6L12 3z"/><path d="M12 8.5v4.5"/><circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    trafficAlert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3L21 12L12 21L3 12L12 3z"/><path d="M12 8.2v4.3"/><circle cx="12" cy="15.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    radar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6.2-6.2"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    house: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>`,
  };

  // CrimeReports-style catalog (15 categories, 1 icon per group of crimes)
  const CRIME_TYPES = {
    homicidio: {
      id: "homicidio",
      label: "Homicídio / Letal",
      short: "Homicídio, latrocínio, feminicídio",
      color: "#991b1b",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.8 4.2C19.8 8.6 17.4 12.2 12.6 16.2L9.4 13L19.8 4.2z" fill="currentColor"/><path d="M8 11.8l5.8 5.8" stroke-width="2.1"/><path d="M10.2 15.2L5.5 19.9" stroke-width="3.2"/></svg>`,
    },
    roubo: {
      id: "roubo",
      label: "Roubo / Assalto",
      short: "Assalto, mão armada, arrastão",
      color: "#dc2626",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11c0-3.5 3.4-6 8-6s8 2.5 8 6v2.2c0 3.2-3.4 5.8-8 5.8s-8-2.6-8-5.8V11z"/><path d="M4.5 11.5h15v2.2c0 .6-.5 1.1-1.1 1.1h-3.3c-.9 0-1.5-.5-2-1.2l-1.1-1.4-1.1 1.4c-.5.7-1.1 1.2-2 1.2H5.6c-.6 0-1.1-.5-1.1-1.1v-2.2z" fill="currentColor" fill-opacity="0.3"/><circle cx="8.8" cy="12.6" r="1" fill="currentColor" stroke="none"/><circle cx="15.2" cy="12.6" r="1" fill="currentColor" stroke="none"/></svg>`,
    },
    furto: {
      id: "furto",
      label: "Furto",
      short: "Celular, bike, comércio, fios",
      color: "#d97706",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14.5" cy="5.5" r="2"/><path d="M12.5 9.5l-3 2.5-2.5-.5"/><path d="M12.5 9.5l3 2 2.5-1"/><path d="M12.5 9.5l-1.5 5 3.5 2.5-.5 3.5"/><path d="M11 14.5l-3.5 2.5-2 3"/><path d="M4.5 9.5c0-1 .8-1.8 1.8-1.8h1.4c1 0 1.8.8 1.8 1.8v2.2a2.5 2.5 0 0 1-5 0V9.5z" fill="currentColor" fill-opacity="0.28"/></svg>`,
    },
    invasao: {
      id: "invasao",
      label: "Invasão / Arromb.",
      short: "Arrombamento, invasão domiciliar",
      color: "#b45309",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-7.5l4.8-1.4V20" fill="currentColor" fill-opacity="0.28"/><circle cx="12.6" cy="15.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    },
    veiculo: {
      id: "veiculo",
      label: "Veículo (Furto/Roubo)",
      short: "Carro, moto, caminhonete",
      color: "#ca8a04",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 13.5l1.6-4.4A2 2 0 0 1 7 7.8h6.2"/><path d="M3.5 13.5h17v4h-2v-1.3H5.5v1.3h-2v-4z"/><path d="M20.5 13.5l-1.1-3"/><circle cx="7" cy="13.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="17" cy="13.5" r="1.2" fill="currentColor" stroke="none"/><path d="M18.5 4v4"/><circle cx="18.5" cy="10.2" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    },
    trafico: {
      id: "trafico",
      label: "Tráfico / Drogas",
      short: "Entorpecentes, ponto de tráfico",
      color: "#7c3aed",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 6.5l7 7a4.2 4.2 0 1 1-6 6l-7-7a4.2 4.2 0 1 1 6-6z"/><path d="M8.5 15.5l7-7"/><path d="M11.5 18.5a4.2 4.2 0 0 0 6-6l-2-2-6 6 2 2z" fill="currentColor" fill-opacity="0.3"/></svg>`,
    },
    agressao: {
      id: "agressao",
      label: "Agressão / Violência",
      short: "Lesão corporal, briga, ameaça",
      color: "#ea580c",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 11.5V8.3a1.5 1.5 0 0 1 3 0V11M9 11V7a1.5 1.5 0 0 1 3 0v4M12 11V7.3a1.5 1.5 0 0 1 3 0V11M15 11V8.5a1.5 1.5 0 0 1 3 0v5c0 2.9-1.9 5-4.8 5.4V21H8.8v-2.2C6.9 18 6 16.3 6 14.3v-2.8z" fill="currentColor" fill-opacity="0.22"/><path d="M6 11.5h6.5a1.5 1.5 0 0 1 0 3H9.2"/></svg>`,
    },
    violencia_domestica: {
      id: "violencia_domestica",
      label: "Violência Doméstica",
      short: "Maria da Penha, medida protetiva",
      color: "#e11d48",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7"/><path d="M6 10.5V20h12v-9.5"/><path d="M12 10.5v4"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/></svg>`,
    },
    violencia_sexual: {
      id: "violencia_sexual",
      label: "Crime Sexual",
      short: "Estupro, importunação, assédio",
      color: "#9d174d",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.7-7.5 9.8-4.3-1.1-7.5-5-7.5-9.8V6L12 3z"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/></svg>`,
    },
    arma: {
      id: "arma",
      label: "Arma / Disparo",
      short: "Tiroteio, disparo, porte ilegal",
      color: "#be123c",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21"/></svg>`,
    },
    incendio: {
      id: "incendio",
      label: "Incêndio Criminoso",
      short: "Fogo criminoso, explosivo",
      color: "#c2410c",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 3.5c.8 3.2-1.8 4.8-1.8 7 0 1.2.9 2 2 2 1.5 0 2.3-1.3 2.5-3 2 1.8 3.3 4.1 3.3 6.5a6.5 6.5 0 1 1-13 0c0-3.2 2-5.6 4.2-7.8 1-1 2.1-2.5 2.8-4.7z" fill="currentColor" fill-opacity="0.25"/></svg>`,
    },
    vandalismo: {
      id: "vandalismo",
      label: "Vandalismo / Dano",
      short: "Depredação, pichação, dano",
      color: "#475569",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7.5" y="9" width="9" height="11.5" rx="1.8"/><path d="M9.5 9V6.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V9"/><path d="M12 5.8V4.2M15.5 4.5l2-1M16.5 7h2"/></svg>`,
    },
    estelionato: {
      id: "estelionato",
      label: "Estelionato / Golpe",
      short: "Golpe presencial, fraude, extorsão",
      color: "#0369a1",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.2"/><path d="M3.5 10.2h17"/><path d="M14.2 13.3l2.6 2.6M16.8 13.3l-2.6 2.6"/></svg>`,
    },
    operacao_policial: {
      id: "operacao_policial",
      label: "Operação / Prisão",
      short: "Mandado, flagrante, receptação",
      color: "#1d4ed8",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="14.5" r="3.8"/><circle cx="16.5" cy="14.5" r="3.8"/><path d="M9.6 11.3l1.2-2.8a1.4 1.4 0 0 1 2.4 0l1.2 2.8"/><path d="M11 8.5h2"/></svg>`,
    },
    outro: {
      id: "outro",
      label: "Outra Ocorrência",
      short: "Outros registros policiais",
      color: "#334155",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4L3.5 19h17L12 4z" fill="currentColor" fill-opacity="0.2"/><path d="M12 10v4.2"/><circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    },
  };

  // Traffic accidents catalog (10 road-warning sign icons)
  const TRAFFIC_TYPES = {
    fatal: {
      id: "fatal",
      label: "Acidente Fatal",
      short: "Acidente com óbito / vítima fatal",
      color: "#991b1b",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15M7 9.5h10"/></svg>`,
    },
    atropelamento: {
      id: "atropelamento",
      label: "Atropelamento",
      short: "Pedestre atropelado na via",
      color: "#dc2626",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5.5" r="2"/><path d="M12 8.5l-1 5.5-3 4.5M11 14l4.5 1.5 2 3M8.5 11l3.5-1.5 3.5 1.5"/></svg>`,
    },
    moto: {
      id: "moto",
      label: "Acidente de Moto",
      short: "Queda ou colisão com motocicleta",
      color: "#ea580c",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.2" cy="16.5" r="2.8"/><circle cx="17.8" cy="16.5" r="2.8"/><path d="M9 16.5h4.2l2.3-5.2h-4l-1.5 3H8M14.2 7.5h3l1.3 3.8"/></svg>`,
    },
    colisao: {
      id: "colisao",
      label: "Colisão / Batida",
      short: "Batida entre veículos, cruzamento",
      color: "#d97706",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 15l1.3-3.8a1.6 1.6 0 0 1 1.5-1.1h4.2l1.2 2.4H3.5v3.5h1.5v-1h5.8"/><path d="M20.5 15l-1.3-3.8a1.6 1.6 0 0 0-1.5-1.1h-3.2l-.8 2.4h6.8v3.5h-1.5v-1h-4.8"/><path d="M12 4.5v3M9.5 6l1.5 1.8M14.5 6L13 7.8"/></svg>`,
    },
    capotamento: {
      id: "capotamento",
      label: "Capotamento / Tomb.",
      short: "Veículo capotado ou saída de pista",
      color: "#b45309",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 14.5l1.5-3.5a2 2 0 0 1 1.8-1.2h6.4a2 2 0 0 1 1.8 1.2l1.5 3.5H5.5z" transform="rotate(180 12 13)"/><path d="M18.5 7.5A7.5 7.5 0 0 0 6 7.5"/><path d="M16 4.8l2.8 2.7-3.2.8"/></svg>`,
    },
    ciclista: {
      id: "ciclista",
      label: "Ciclista / Bike",
      short: "Bicicleta, bike elétrica, ciclovia",
      color: "#0d9488",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.2" cy="16.2" r="3"/><circle cx="17.8" cy="16.2" r="3"/><path d="M6.2 16.2L10.3 9.5h4l3.5 6.7M10.3 9.5l1.7 6.7H6.2M9.2 7h2.8M14.3 9.5l1.1-2.5H18"/></svg>`,
    },
    onibus_caminhao: {
      id: "onibus_caminhao",
      label: "Ônibus / Caminhão",
      short: "Veículo pesado, carreta, ônibus",
      color: "#0369a1",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="11.5" height="9" rx="1.5"/><path d="M14.5 10h3.8l2.2 2.8V16h-6v-6z"/><circle cx="7" cy="17.2" r="1.7"/><circle cx="17.5" cy="17.2" r="1.7"/></svg>`,
    },
    embriaguez: {
      id: "embriaguez",
      label: "Embriaguez / Perigo",
      short: "Bafômetro, racha, fuga do local",
      color: "#7c3aed",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M5 11h5M14 11h5M12 14v5.5"/><path d="M4.5 4.5l15 15"/></svg>`,
    },
    rodovia: {
      id: "rodovia",
      label: "Rodovia / Trevo",
      short: "Rodovia, trevo, anel viário",
      color: "#475569",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20L10 4M17 20L14 4M12 6.5v2.5M12 12v2.5M12 17.5V20"/></svg>`,
    },
    outro: {
      id: "outro",
      label: "Outro Acidente",
      short: "Pane/incêndio, carga, animal na via",
      color: "#ca8a04",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5L3.8 19h16.4L12 4.5z" fill="currentColor" fill-opacity="0.22"/><path d="M12 10v4"/><circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none"/></svg>`,
    },
  };

  const GRAVIDADE_LABELS = {
    fatal: "Fatal",
    grave: "Grave",
    leve: "Leve",
    sem_vitimas: "Sem vítimas",
  };

  const TIME_WINDOWS = [
    { id: "0", label: "Todos", hourly: false },
    { id: "1h", label: "1h", hours: 1, hourly: true },
    { id: "6h", label: "6h", hours: 6, hourly: true },
    { id: "12h", label: "12h", hours: 12, hourly: true },
    { id: "24h", label: "24h", hours: 24, hourly: true },
    { id: "3d", label: "3 dias", days: 3, hourly: false },
    { id: "7d", label: "7 dias", days: 7, hourly: false },
    { id: "15d", label: "15 dias", days: 15, hourly: false },
    { id: "30d", label: "30 dias", days: 30, hourly: false },
    { id: "custom", label: "Período", hourly: false },
  ];

  // App state
  const state = {
    activeTab: "mapa", // mobile: "mapa" | "relatorios" | "imoveis"
    sidebarMode: "relatorios", // desktop: "relatorios" | "imoveis"
    cities: [],
    currentCitySlug: "campo-grande-ms",
    cityMeta: null,
    cityGeo: null,
    basemap: "clean",

    showCrimes: true,
    showTraffic: true,
    showImoveis: FEATURES.imoveis,

    crimesFeed: null,
    crimes: [],
    trafficFeed: null,
    traffic: [],
    housesFeed: null,
    houses: [],

    reportKind: "todos", // "todos" | "crimes" | "transito"
    timeWindow: "0", // "0" | "1h" | "6h" | "12h" | "24h" | "3d" | "7d" | "15d" | "30d" | "custom"
    dateFrom: "",
    dateTo: "",
    query: "",
    precisao: "todas", // "todas" | "rua" | "bairro"
    sort: "recente", // "recente" | "antigo" | "tipo" | "bairro"
    typesExpanded: false,
    activeCrimeTypes: new Set(Object.keys(CRIME_TYPES)),
    activeTrafficTypes: new Set(Object.keys(TRAFFIC_TYPES)),
  };

  let map = null;
  let baseLayers = {};
  let currentBaseLayer = null;
  let crimeLayer = null;
  let trafficLayer = null;
  let houseLayer = null;
  const crimeMarkers = new Map();
  const trafficMarkers = new Map();

  const el = {
    citySelect: document.getElementById("citySelect"),
    refreshFeedBtn: document.getElementById("refreshFeedBtn"),
    feedStatusText: document.getElementById("feedStatusText"),
    mobileStatusText: document.getElementById("mobileStatusText"),
    toggleImoveisModeBtn: document.getElementById("toggleImoveisModeBtn"),
    headerImoveisCount: document.getElementById("headerImoveisCount"),
    mapLayerBar: document.getElementById("mapLayerBar"),
    cycleBasemapBtn: document.getElementById("cycleBasemapBtn"),
    cycleBasemapLabel: document.getElementById("cycleBasemapLabel"),
    fitBoundsBtn: document.getElementById("fitBoundsBtn"),
    fitBoundsMobileBtn: document.getElementById("fitBoundsMobileBtn"),
    reportView: document.getElementById("reportView"),
    imoveisView: document.getElementById("imoveisView"),
    navReportsCount: document.getElementById("navReportsCount"),
    navImoveisBtn: document.getElementById("navImoveisBtn"),
    navImoveisCount: document.getElementById("navImoveisCount"),
    toast: document.getElementById("toast"),
  };

  function isDesktop() {
    return window.innerWidth >= 840;
  }

  // ==================== UTILITIES ====================

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(str) {
    return String(str ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  let toastTimer = null;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2400);
  }

  // Parse event timestamp supporting data_hora (ISO), data + hora ("YYYY-MM-DD" + "HH:MM"), or data only
  function parseEventTimestamp(raw) {
    if (raw.data_hora) {
      const t = Date.parse(String(raw.data_hora).trim());
      if (Number.isFinite(t)) {
        const d = new Date(t);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return { ms: t, data: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${mi}`, hasHora: true };
      }
    }

    const dataStr = String(raw.data || "").trim();
    const horaRaw = String(raw.hora || "").trim();
    const horaMatch = horaRaw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const hora = horaMatch ? `${horaMatch[1].padStart(2, "0")}:${horaMatch[2]}` : "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      const [y, m, d] = dataStr.split("-").map(Number);
      if (horaMatch) {
        const dt = new Date(y, m - 1, d, Number(horaMatch[1]), Number(horaMatch[2]), Number(horaMatch[3] || 0));
        return { ms: dt.getTime(), data: dataStr, hora, hasHora: true };
      }
      const dt = new Date(y, m - 1, d, 12, 0, 0);
      return { ms: dt.getTime(), data: dataStr, hora: "", hasHora: false };
    }

    const fallbackMs = dataStr ? Date.parse(dataStr) : 0;
    return {
      ms: Number.isFinite(fallbackMs) ? fallbackMs : 0,
      data: dataStr,
      hora,
      hasHora: Boolean(hora),
    };
  }

  function isEventRecent(item) {
    if (item.nova) return true;
    if (!item.timestampMs) return false;
    const diffMs = Date.now() - item.timestampMs;
    return diffMs >= -3600000 && diffMs <= RECENT_HOURS_THRESHOLD * 3600000;
  }

  function formatRelativeTime(ms, hasHora) {
    if (!ms) return "";
    const diffMs = Date.now() - ms;
    const diffMin = Math.round(diffMs / 60000);
    if (hasHora && diffMin >= 0 && diffMin < 60) {
      return diffMin <= 1 ? "agora" : `há ${diffMin} min`;
    }
    const diffHours = Math.round(diffMs / 3600000);
    if (hasHora && diffHours >= 0 && diffHours < 24) {
      return `há ${diffHours}h`;
    }
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - ms) / 86400000);
    if (diffDays <= 0) return "hoje";
    if (diffDays === 1) return "ontem";
    if (diffDays < 30) return `há ${diffDays}d`;
    return "";
  }

  function formatEventDateTime(item) {
    if (!item.timestampMs) return item.data || "";
    const d = new Date(item.timestampMs);
    const datePart = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    const timePart = item.hora ? ` · ${item.hora}` : "";
    const rel = formatRelativeTime(item.timestampMs, item.hasHora);
    return `${datePart}${timePart}${rel ? ` (${rel})` : ""}`;
  }

  function formatUpdatedPill(isoStr) {
    if (!isoStr) return "Sem atualização ainda";
    const t = Date.parse(isoStr);
    if (!Number.isFinite(t)) return `Atualizado: ${isoStr}`;
    const d = new Date(t);
    const hhmm = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const diffMin = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (diffMin < 2) return `Atualizado às ${hhmm} · agora`;
    if (diffMin < 60) return `Atualizado às ${hhmm} · há ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `Atualizado às ${hhmm} · há ${diffH}h`;
    const dd = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `Atualizado ${dd} às ${hhmm}`;
  }

  // ==================== TYPE RESOLVERS & GEOCODING ====================

  function resolveCrimeType(rawTipo) {
    const norm = normalizeText(rawTipo || "").replace(/[\s/-]+/g, "_");
    if (!norm) return "outro";
    if (CRIME_TYPES[norm]) return norm;

    const text = normalizeText(rawTipo || "");
    if (/\b(homicidio|latrocinio|feminicidio|assassinato|execucao|cadaver|morte violenta)\b/.test(text)) return "homicidio";
    if (/\b(maria da penha|violencia domestica|medida protetiva|domestica)\b/.test(text)) return "violencia_domestica";
    if (/\b(estupro|sexual|importunacao|assedio|abuso|ato obsceno)\b/.test(text)) return "violencia_sexual";
    if (/\b(veiculo|carro|moto|motocicleta|caminhonete|automovel|caminhao)\b/.test(text)) return "veiculo";
    if (/\b(invasao|arrombamento|burglary|residencia|domiciliar)\b/.test(text)) return "invasao";
    if (/\b(roubo|assalto|arrastao|sequestro|mao armada)\b/.test(text)) return "roubo";
    if (/\b(furto|subtracao|larceny|theft)\b/.test(text)) return "furto";
    if (/\b(trafico|droga|entorpecente|cocaina|maconha|crack|biqueira)\b/.test(text)) return "trafico";
    if (/\b(tiroteio|disparo|arma|armamento|municao|pistola|revolver|tiro)\b/.test(text)) return "arma";
    if (/\b(incendio|fogo|explosivo|arson)\b/.test(text)) return "incendio";
    if (/\b(vandalismo|dano|depredacao|pichacao|quebra)\b/.test(text)) return "vandalismo";
    if (/\b(estelionato|golpe|fraude|extorsao|falsificacao)\b/.test(text)) return "estelionato";
    if (/\b(agressao|lesao corporal|espancamento|esfaqueamento|briga|ameaca|vias de fato|violencia)\b/.test(text)) return "agressao";
    if (/\b(operacao|prisao|mandado|foragido|captura|flagrante|receptacao|policial)\b/.test(text)) return "operacao_policial";
    return "outro";
  }

  function resolveTrafficType(rawTipo) {
    const norm = normalizeText(rawTipo || "").replace(/[\s/-]+/g, "_");
    if (!norm) return "outro";
    if (TRAFFIC_TYPES[norm]) return norm;

    const text = normalizeText(rawTipo || "");
    if (/\b(fatal|morte|obito|morre|morreu|vitima fatal)\b/.test(text)) return "fatal";
    if (/\b(atropelamento|atropela|pedestre)\b/.test(text)) return "atropelamento";
    if (/\b(ciclista|bicicleta|bike|patinete|ciclovia)\b/.test(text)) return "ciclista";
    if (/\b(embriaguez|alcool|bafometro|embriagado|racha|direcao perigosa|fuga)\b/.test(text)) return "embriaguez";
    if (/\b(capotamento|capota|tombamento|tomba|saida de pista|ribanceira)\b/.test(text)) return "capotamento";
    if (/\b(onibus|caminhao|carreta|bitrem|pesado|van escolar)\b/.test(text)) return "onibus_caminhao";
    if (/\b(moto|motocicleta|motoneta|motoboy|motociclista)\b/.test(text)) return "moto";
    if (/\b(rodovia|estrada|trevo|contorno|anel viario|vicinal|br-\d+|ms-\d+|sp-\d+|pr-\d+)\b/.test(text)) return "rodovia";
    if (/\b(colisao|batida|engavetamento|choque|abalroamento|cruzamento)\b/.test(text)) return "colisao";
    return "outro";
  }

  function resolveGravidade(rawGrav, resolvedTipo) {
    const g = normalizeText(rawGrav || "").replace(/[\s-]+/g, "_");
    if (GRAVIDADE_LABELS[g]) return g;
    if (g.includes("fatal") || g.includes("morte") || g.includes("obito")) return "fatal";
    if (g.includes("grave")) return "grave";
    if (g.includes("leve") || g.includes("ferido")) return "leve";
    if (g.includes("sem") || g.includes("material")) return "sem_vitimas";
    return resolvedTipo === "fatal" ? "fatal" : "";
  }

  function resolveCoords(raw, index, prefix = "evt") {
    const rawLat = Number(raw.lat);
    const rawLng = Number(raw.lng);
    if (Number.isFinite(rawLat) && Number.isFinite(rawLng) && rawLat !== 0 && rawLng !== 0) {
      const precNorm = normalizeText(raw.precisao || "");
      const precisao = precNorm === "rua" ? "rua" : precNorm === "bairro" ? "bairro" : raw.endereco ? "rua" : "bairro";
      return { lat: rawLat, lng: rawLng, precisao };
    }

    const bairros = state.cityGeo?.bairros || {};
    const keysToTry = [normalizeText(raw.bairro || ""), normalizeText(raw.endereco || "")].filter(Boolean);
    let match = null;
    for (const key of keysToTry) {
      if (bairros[key]) {
        match = bairros[key];
        break;
      }
      const found = Object.keys(bairros).find((k) => key.includes(k) || k.includes(key));
      if (found) {
        match = bairros[found];
        break;
      }
    }
    const center = state.cityGeo?.centro || state.cityMeta?.centro || { lat: -20.4697, lng: -54.6201 };
    const base = match || center;
    const seed = hashString(`${prefix}-${raw.id || raw.titulo || index}`);
    const angle = (seed % 360) * (Math.PI / 180);
    const dist = 0.001 + (seed % 6) * 0.0003;
    return {
      lat: Number((base.lat + Math.sin(angle) * dist).toFixed(5)),
      lng: Number((base.lng + Math.cos(angle) * dist).toFixed(5)),
      precisao: "bairro",
    };
  }

  function applySpiralJitter(items, angleOffset = 0) {
    const buckets = new Map();
    for (const item of items) {
      const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(item);
    }
    for (const group of buckets.values()) {
      if (group.length <= 1) continue;
      group.forEach((item, i) => {
        if (i === 0) return;
        const angle = ((i * 137.508 + angleOffset) * Math.PI) / 180;
        const radius = 0.0004 + Math.floor(i / 6) * 0.00028;
        item.displayLat = Number((item.lat + Math.sin(angle) * radius).toFixed(5));
        item.displayLng = Number((item.lng + Math.cos(angle) * radius).toFixed(5));
      });
    }
  }

  function ingestCrimes(rawData) {
    if (!rawData) {
      state.crimesFeed = null;
      state.crimes = [];
      return;
    }
    const list = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData.ocorrencias)
      ? rawData.ocorrencias
      : Array.isArray(rawData.crimes)
      ? rawData.crimes
      : [];
    state.crimesFeed = Array.isArray(rawData) ? null : rawData;

    const cityName = state.cityMeta?.nome || "Campo Grande";
    const normalized = list
      .filter((x) => x && typeof x === "object")
      .map((raw, idx) => {
        const tipo = resolveCrimeType(raw.tipo);
        const coords = resolveCoords(raw, idx, "crime");
        const ts = parseEventTimestamp(raw);
        const linkRaw = typeof raw.link === "string" ? raw.link.trim() : "";
        const link = /^https?:\/\//i.test(linkRaw) ? linkRaw : "";
        return {
          kind: "crimes",
          id: String(raw.id || `crime-${idx + 1}-${hashString(`${raw.titulo || tipo}-${ts.data}-${ts.hora}`)}`),
          data: ts.data,
          hora: ts.hora,
          hasHora: ts.hasHora,
          timestampMs: ts.ms,
          tipo,
          tipoOriginal: String(raw.tipo || ""),
          titulo: String(raw.titulo || CRIME_TYPES[tipo].label),
          cidade: String(raw.cidade || cityName),
          bairro: String(raw.bairro || ""),
          endereco: String(raw.endereco || ""),
          lat: coords.lat,
          lng: coords.lng,
          displayLat: coords.lat,
          displayLng: coords.lng,
          precisao: coords.precisao,
          nova: Boolean(raw.nova),
          fonte: String(raw.fonte || state.crimesFeed?.fonte || ""),
          link,
          descricao: String(raw.descricao || raw.resumo || ""),
        };
      });

    normalized.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
    applySpiralJitter(normalized, 0);
    state.crimes = normalized;
  }

  function ingestTraffic(rawData) {
    if (!rawData) {
      state.trafficFeed = null;
      state.traffic = [];
      return;
    }
    const list = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData.ocorrencias)
      ? rawData.ocorrencias
      : Array.isArray(rawData.acidentes)
      ? rawData.acidentes
      : [];
    state.trafficFeed = Array.isArray(rawData) ? null : rawData;

    const cityName = state.cityMeta?.nome || "Campo Grande";
    const normalized = list
      .filter((x) => x && typeof x === "object")
      .map((raw, idx) => {
        const tipo = resolveTrafficType(raw.tipo);
        const coords = resolveCoords(raw, idx + 10000, "traffic");
        const ts = parseEventTimestamp(raw);
        const linkRaw = typeof raw.link === "string" ? raw.link.trim() : "";
        const link = /^https?:\/\//i.test(linkRaw) ? linkRaw : "";
        return {
          kind: "transito",
          id: String(raw.id || `transito-${idx + 1}-${hashString(`${raw.titulo || tipo}-${ts.data}-${ts.hora}`)}`),
          data: ts.data,
          hora: ts.hora,
          hasHora: ts.hasHora,
          timestampMs: ts.ms,
          tipo,
          tipoOriginal: String(raw.tipo || ""),
          gravidade: resolveGravidade(raw.gravidade, tipo),
          titulo: String(raw.titulo || TRAFFIC_TYPES[tipo].label),
          cidade: String(raw.cidade || cityName),
          bairro: String(raw.bairro || ""),
          endereco: String(raw.endereco || ""),
          lat: coords.lat,
          lng: coords.lng,
          displayLat: coords.lat,
          displayLng: coords.lng,
          precisao: coords.precisao,
          nova: Boolean(raw.nova),
          fonte: String(raw.fonte || state.trafficFeed?.fonte || ""),
          link,
          descricao: String(raw.descricao || raw.resumo || ""),
        };
      });

    normalized.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
    applySpiralJitter(normalized, 45);
    state.traffic = normalized;
  }

  function ingestHouses(rawData) {
    if (!rawData || !Array.isArray(rawData.casas)) {
      state.housesFeed = null;
      state.houses = [];
      return;
    }
    state.housesFeed = rawData;
    state.houses = rawData.casas.map((raw, idx) => {
      const coords = resolveCoords(raw, idx + 20000, "house");
      return {
        id: String(raw.id || `casa-${idx + 1}`),
        titulo: String(raw.titulo || `Imóvel em ${raw.bairro || state.cityMeta?.nome || ""}`),
        finalidade: normalizeText(raw.finalidade).includes("comp") ? "compra" : "aluguel",
        preco: Number(raw.preco) || 0,
        bairro: String(raw.bairro || ""),
        endereco: String(raw.endereco || ""),
        lat: coords.lat,
        lng: coords.lng,
        link: typeof raw.link === "string" ? raw.link.trim() : "",
      };
    });
  }

  // ==================== FILTERING ENGINE (HOURLY + DATE + TYPE + SEARCH) ====================

  function matchesTimeWindow(item) {
    if (state.timeWindow === "0") return true;
    if (state.timeWindow === "custom") {
      if (!state.dateFrom && !state.dateTo) return true;
      if (!item.data) return false;
      if (state.dateFrom && item.data < state.dateFrom) return false;
      if (state.dateTo && item.data > state.dateTo) return false;
      return true;
    }
    const win = TIME_WINDOWS.find((w) => w.id === state.timeWindow);
    if (!win) return true;
    if (!item.timestampMs) return false;
    if (win.hours) {
      const cutoff = Date.now() - win.hours * 3600000;
      return item.timestampMs >= cutoff;
    }
    if (win.days) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoff = startOfToday.getTime() - (win.days - 1) * 86400000;
      return item.timestampMs >= cutoff;
    }
    return true;
  }

  function filterItems(items, { kind, ignoreTypes = false } = {}) {
    const q = normalizeText(state.query);
    const catalog = kind === "transito" ? TRAFFIC_TYPES : CRIME_TYPES;
    const activeSet = kind === "transito" ? state.activeTrafficTypes : state.activeCrimeTypes;

    return items.filter((item) => {
      if (!matchesTimeWindow(item)) return false;
      if (!ignoreTypes && !activeSet.has(item.tipo)) return false;
      if (state.precisao !== "todas" && item.precisao !== state.precisao) return false;
      if (q) {
        const meta = catalog[item.tipo] || catalog.outro;
        const grav = item.gravidade ? GRAVIDADE_LABELS[item.gravidade] || "" : "";
        const hay = normalizeText(
          `${item.titulo} ${item.bairro} ${item.endereco} ${item.cidade} ${item.fonte} ${item.descricao} ${meta.label} ${meta.short} ${item.tipoOriginal} ${grav} ${item.data} ${item.hora}`
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function sortEvents(list) {
    return list.sort((a, b) => {
      if (state.sort === "antigo") return (a.timestampMs || 0) - (b.timestampMs || 0);
      if (state.sort === "tipo") {
        const catA = a.kind === "transito" ? TRAFFIC_TYPES : CRIME_TYPES;
        const catB = b.kind === "transito" ? TRAFFIC_TYPES : CRIME_TYPES;
        const la = (catA[a.tipo] || catA.outro).label;
        const lb = (catB[b.tipo] || catB.outro).label;
        const cmp = la.localeCompare(lb, "pt-BR");
        return cmp !== 0 ? cmp : (b.timestampMs || 0) - (a.timestampMs || 0);
      }
      if (state.sort === "bairro") {
        const cmp = (a.bairro || "").localeCompare(b.bairro || "", "pt-BR");
        return cmp !== 0 ? cmp : (b.timestampMs || 0) - (a.timestampMs || 0);
      }
      return (b.timestampMs || 0) - (a.timestampMs || 0);
    });
  }

  function getVisibleCrimes() {
    return sortEvents(filterItems(state.crimes, { kind: "crimes" }));
  }

  function getVisibleTraffic() {
    return sortEvents(filterItems(state.traffic, { kind: "transito" }));
  }

  function getReportItems() {
    if (state.reportKind === "crimes") return getVisibleCrimes();
    if (state.reportKind === "transito") return getVisibleTraffic();
    const combined = [];
    if (state.showCrimes) combined.push(...filterItems(state.crimes, { kind: "crimes" }));
    if (state.showTraffic) combined.push(...filterItems(state.traffic, { kind: "transito" }));
    return sortEvents(combined);
  }

  function countActiveFilters() {
    let n = 0;
    if (state.timeWindow !== "0") n++;
    if (state.query.trim()) n++;
    if (state.precisao !== "todas") n++;
    if (state.activeCrimeTypes.size < Object.keys(CRIME_TYPES).length) n++;
    if (state.activeTrafficTypes.size < Object.keys(TRAFFIC_TYPES).length) n++;
    return n;
  }

  function resetAllFilters() {
    state.timeWindow = "0";
    state.dateFrom = "";
    state.dateTo = "";
    state.query = "";
    state.precisao = "todas";
    state.sort = "recente";
    state.showCrimes = true;
    state.showTraffic = true;
    state.activeCrimeTypes = new Set(Object.keys(CRIME_TYPES));
    state.activeTrafficTypes = new Set(Object.keys(TRAFFIC_TYPES));
    const s = document.getElementById("reportSearchInput");
    if (s) s.value = "";
    const df = document.getElementById("reportDateFrom");
    if (df) df.value = "";
    const dt = document.getElementById("reportDateTo");
    if (dt) dt.value = "";
    refreshAllViews();
  }

  // ==================== MAP ENGINE ====================

  function initMap() {
    const center = state.cityGeo?.centro || state.cityMeta?.centro || { lat: -20.4697, lng: -54.6201 };
    const zoom = state.cityGeo?.zoom || state.cityMeta?.zoom || 12;

    map = L.map("map", {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      preferCanvas: true,
    });
    L.control.zoom({ position: "topright" }).addTo(map);

    baseLayers = {
      clean: L.layerGroup([
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          attribution: "Tiles &copy; Esri &mdash; &copy; OpenStreetMap",
          maxZoom: 19,
          maxNativeZoom: 16,
        }),
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 19,
          maxNativeZoom: 16,
        }),
      ]),
      streets: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }),
      satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      }),
    };

    currentBaseLayer = baseLayers.clean.addTo(map);
    houseLayer = L.layerGroup().addTo(map);
    trafficLayer = L.layerGroup().addTo(map);
    crimeLayer = L.layerGroup().addTo(map);
  }

  function setBasemap(name) {
    if (!baseLayers[name] || name === state.basemap) return;
    state.basemap = name;
    if (currentBaseLayer) map.removeLayer(currentBaseLayer);
    currentBaseLayer = baseLayers[name].addTo(map);

    const meta = BASEMAP_STEPS.find((b) => b.id === name);
    if (meta && el.cycleBasemapLabel) el.cycleBasemapLabel.textContent = meta.label;
    document.querySelectorAll("[data-basemap]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.basemap === name);
    });
  }

  function createEventPopupHtml(item) {
    const isTraffic = item.kind === "transito";
    const catalog = isTraffic ? TRAFFIC_TYPES : CRIME_TYPES;
    const meta = catalog[item.tipo] || catalog.outro;
    const recent = isEventRecent(item);
    const locParts = [item.bairro, item.endereco].filter(Boolean);
    const precPill =
      item.precisao === "rua"
        ? `<span class="prec-pill prec-pill--rua">Local exato (rua)</span>`
        : `<span class="prec-pill prec-pill--bairro">Aproximado (bairro)</span>`;
    const gravPill =
      isTraffic && item.gravidade && GRAVIDADE_LABELS[item.gravidade]
        ? `<span class="grav-pill grav-pill--${item.gravidade}">${GRAVIDADE_LABELS[item.gravidade]}</span>`
        : "";

    return `
      <div class="event-popup">
        <div class="event-popup__head">
          <span class="event-card__type" style="background:${meta.color}">${meta.icon}<span>${escapeHtml(meta.label)}</span></span>
          ${item.timestampMs ? `<span class="event-card__date">${escapeHtml(formatEventDateTime(item))}</span>` : ""}
        </div>
        <h4 class="event-popup__title">${escapeHtml(item.titulo)}</h4>
        ${locParts.length ? `<p class="event-popup__loc"><strong>Local:</strong> ${escapeHtml(locParts.join(" · "))}</p>` : ""}
        ${item.descricao ? `<p class="event-popup__desc">${escapeHtml(item.descricao)}</p>` : ""}
        <div class="event-popup__meta">
          <div class="event-popup__pills">
            ${recent ? `<span class="recent-pill">Recente</span>` : ""}
            ${gravPill}
            ${precPill}
          </div>
          <div class="event-popup__source">
            <span>${item.fonte ? `Fonte: ${escapeHtml(item.fonte)}` : "Registro local"}</span>
            ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Ver matéria ↗</a>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderMapLayers() {
    if (!map) return;
    crimeLayer.clearLayers();
    trafficLayer.clearLayers();
    houseLayer.clearLayers();
    crimeMarkers.clear();
    trafficMarkers.clear();

    if (state.showCrimes) {
      for (const c of getVisibleCrimes()) {
        const meta = CRIME_TYPES[c.tipo] || CRIME_TYPES.outro;
        const approxCls = c.precisao === "bairro" ? "crime-pin--approx" : "";
        const recentCls = isEventRecent(c) ? "crime-pin--recent" : "";
        const icon = L.divIcon({
          className: "crime-pin-wrap",
          html: `<div class="crime-pin ${approxCls} ${recentCls}" style="background:${meta.color}" title="${escapeHtml(meta.label)}: ${escapeHtml(c.titulo)}">${meta.icon}</div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([c.displayLat, c.displayLng], {
          icon,
          zIndexOffset: recentCls ? 340 : 200,
        }).addTo(crimeLayer);
        marker.bindPopup(() => createEventPopupHtml(c));
        crimeMarkers.set(c.id, { marker, item: c });
      }
    }

    if (state.showTraffic) {
      for (const t of getVisibleTraffic()) {
        const meta = TRAFFIC_TYPES[t.tipo] || TRAFFIC_TYPES.outro;
        const approxCls = t.precisao === "bairro" ? "traffic-pin--approx" : "";
        const recentCls = isEventRecent(t) ? "traffic-pin--recent" : "";
        const icon = L.divIcon({
          className: "traffic-pin-wrap",
          html: `<div class="traffic-pin ${approxCls} ${recentCls}" style="background:${meta.color}" title="${escapeHtml(meta.label)}: ${escapeHtml(t.titulo)}">${meta.icon}</div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([t.displayLat, t.displayLng], {
          icon,
          zIndexOffset: recentCls ? 330 : 190,
        }).addTo(trafficLayer);
        marker.bindPopup(() => createEventPopupHtml(t));
        trafficMarkers.set(t.id, { marker, item: t });
      }
    }

    if (FEATURES.imoveis && state.showImoveis) {
      for (const h of state.houses) {
        const priceLabel = h.preco ? `R$ ${h.preco.toLocaleString("pt-BR")}` : "Imóvel";
        const icon = L.divIcon({
          className: "house-pin-wrap",
          html: `<div class="house-pin"><span class="house-pin__dot"></span><span>${escapeHtml(priceLabel)}</span></div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([h.lat, h.lng], { icon, zIndexOffset: 120 }).addTo(houseLayer);
        marker.bindPopup(
          `<div class="event-popup"><h4 class="event-popup__title">${escapeHtml(h.titulo)}</h4><p class="event-popup__loc">${escapeHtml(h.bairro)}</p>${h.link ? `<a href="${escapeHtml(h.link)}" target="_blank" rel="noopener noreferrer">Ver anúncio ↗</a>` : ""}</div>`
        );
      }
    }
  }

  function fitMapToCity(preferEvents = true) {
    if (!map) return;
    const pts = [];
    if (preferEvents) {
      if (state.showCrimes) getVisibleCrimes().forEach((c) => pts.push([c.displayLat, c.displayLng]));
      if (state.showTraffic) getVisibleTraffic().forEach((t) => pts.push([t.displayLat, t.displayLng]));
    }
    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), {
        paddingTopLeft: [40, isDesktop() ? 74 : 124],
        paddingBottomRight: [40, isDesktop() ? 74 : 60],
        maxZoom: 14,
        animate: true,
      });
      return;
    }
    if (pts.length === 1) {
      map.flyTo(pts[0], 14, { duration: 0.45 });
      return;
    }
    const center = state.cityGeo?.centro || state.cityMeta?.centro || { lat: -20.4697, lng: -54.6201 };
    const zoom = state.cityGeo?.zoom || state.cityMeta?.zoom || 12;
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.45 });
  }

  function focusEventOnMap(kind, id) {
    const isTraffic = kind === "transito";
    const entry = isTraffic ? trafficMarkers.get(id) : crimeMarkers.get(id);
    if (!entry) {
      if (isTraffic) state.showTraffic = true;
      else state.showCrimes = true;
      refreshAllViews();
    }
    const target = isTraffic ? trafficMarkers.get(id) : crimeMarkers.get(id);
    if (!target) return;
    if (!isDesktop()) switchMobileTab("mapa");
    map.flyTo([target.item.displayLat, target.item.displayLng], Math.max(map.getZoom(), 15), { duration: 0.45 });
    setTimeout(() => target.marker.openPopup(), 420);
  }

  // ==================== MAP DOCK & STATUS ====================

  function renderMapLayerBar() {
    const crimeCount = getVisibleCrimes().length;
    const trafficCount = getVisibleTraffic().length;
    const parts = [
      `
        <button type="button" class="cat-toggle cat-toggle--crime ${state.showCrimes ? "is-on" : ""}" id="dockToggleCrimes" aria-pressed="${state.showCrimes}">
          <span class="cat-toggle__dot" style="background:#b91c1c">${UI_ICONS.shieldAlert}</span>
          <span>Crimes</span>
          <span class="cat-toggle__count">${crimeCount}</span>
        </button>
      `,
      `
        <button type="button" class="cat-toggle cat-toggle--traffic ${state.showTraffic ? "is-on" : ""}" id="dockToggleTraffic" aria-pressed="${state.showTraffic}">
          <span class="cat-toggle__dot" style="background:#d97706">${UI_ICONS.trafficAlert}</span>
          <span>Trânsito</span>
          <span class="cat-toggle__count cat-toggle__count--traffic">${trafficCount}</span>
        </button>
      `,
    ];

    if (FEATURES.imoveis) {
      parts.push(`
        <button type="button" class="cat-toggle cat-toggle--imoveis ${state.showImoveis ? "is-on" : ""}" id="dockToggleImoveis" aria-pressed="${state.showImoveis}">
          <span class="cat-toggle__dot" style="background:#15803d">${UI_ICONS.house}</span>
          <span>Imóveis</span>
          <span class="cat-toggle__count cat-toggle__count--imoveis">${state.houses.length}</span>
        </button>
      `);
    }

    el.mapLayerBar.innerHTML = parts.join("");

    document.getElementById("dockToggleCrimes").addEventListener("click", () => {
      state.showCrimes = !state.showCrimes;
      refreshAllViews();
    });
    document.getElementById("dockToggleTraffic").addEventListener("click", () => {
      state.showTraffic = !state.showTraffic;
      refreshAllViews();
    });
    const imvBtn = document.getElementById("dockToggleImoveis");
    if (imvBtn) {
      imvBtn.addEventListener("click", () => {
        state.showImoveis = !state.showImoveis;
        refreshAllViews();
      });
    }
  }

  function updateStatusPills() {
    const timestamps = [state.crimesFeed?.atualizado_em, state.trafficFeed?.atualizado_em]
      .filter(Boolean)
      .sort()
      .reverse();
    const newestIso = timestamps[0] || "";
    const statusLabel = formatUpdatedPill(newestIso);
    if (el.feedStatusText) el.feedStatusText.textContent = statusLabel;
    if (el.mobileStatusText) el.mobileStatusText.textContent = statusLabel;

    const totalVisible = getVisibleCrimes().length + getVisibleTraffic().length;
    if (el.navReportsCount) {
      el.navReportsCount.textContent = String(totalVisible);
      el.navReportsCount.hidden = state.crimes.length === 0 && state.traffic.length === 0;
    }

    if (FEATURES.imoveis) {
      el.toggleImoveisModeBtn.hidden = false;
      el.navImoveisBtn.hidden = false;
      el.headerImoveisCount.textContent = String(state.houses.length);
      el.headerImoveisCount.hidden = state.houses.length === 0;
      el.navImoveisCount.textContent = String(state.houses.length);
      el.navImoveisCount.hidden = state.houses.length === 0;
    }
  }

  // ==================== CENTRALIZED REPORT PANEL ====================

  let reportShellReady = false;
  function ensureReportShell() {
    if (reportShellReady) return;
    el.reportView.innerHTML = `
      <div class="report-head">
        <div class="report-head__top">
          <div class="report-head__title">
            <h2>
              <span class="report-head__ico" id="reportHeadIco">${UI_ICONS.radar}</span>
              <span id="reportHeadTitle">Radar de Ocorrências</span>
            </h2>
            <p id="reportHeadSub">Campo Grande — MS</p>
          </div>
        </div>

        <div class="report-tabs" role="tablist" aria-label="Filtrar relatório">
          <button type="button" class="report-tab is-active" data-report-kind="todos" role="tab" aria-selected="true">
            <span>Todos</span>
            <span class="report-tab__cnt" id="tabTodosCnt">0</span>
          </button>
          <button type="button" class="report-tab" data-report-kind="crimes" role="tab" aria-selected="false">
            ${UI_ICONS.shieldAlert}
            <span>Crimes</span>
            <span class="report-tab__cnt" id="tabCrimesCnt">0</span>
          </button>
          <button type="button" class="report-tab" data-report-kind="transito" role="tab" aria-selected="false">
            ${UI_ICONS.trafficAlert}
            <span>Trânsito</span>
            <span class="report-tab__cnt" id="tabTrafficCnt">0</span>
          </button>
        </div>

        <label class="report-searchbox" aria-label="Buscar bairro, rua, avenida, título ou fonte">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.9"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
          </svg>
          <input id="reportSearchInput" type="search" placeholder="Bairro, rua, avenida, título, fonte…" autocomplete="off" enterkeyhint="search">
          <button id="clearReportSearchBtn" class="report-searchbox__clear" type="button" hidden aria-label="Limpar busca">×</button>
        </label>

        <div class="filter-block">
          <div class="filter-block__head">
            <span>Janela de Hora / Data</span>
          </div>
          <div class="time-chips" id="reportTimeChips" role="group" aria-label="Filtrar por hora ou data">
            ${TIME_WINDOWS.map(
              (w) =>
                `<button type="button" class="time-chip ${w.hourly ? "time-chip--hourly" : ""}" data-time-win="${w.id}">${w.label}</button>`
            ).join("")}
          </div>
          <div class="date-range-row" id="reportDateRange" hidden>
            <label><span>De</span><input type="date" id="reportDateFrom"></label>
            <label><span>Até</span><input type="date" id="reportDateTo"></label>
          </div>
        </div>

        <div class="filter-block" id="reportTypesBlock" hidden>
          <div class="filter-block__head">
            <span id="reportTypesHeading">Tipos</span>
            <span class="filter-block__links">
              <button type="button" id="reportAllTypesBtn">Todos</button>
              <button type="button" id="reportClearTypesBtn">Nenhum</button>
              <button type="button" id="reportExpandTypesBtn">Ver todos ▾</button>
            </span>
          </div>
          <div class="type-chips" id="reportTypeChips" role="group" aria-label="Filtrar por tipo"></div>
        </div>

        <div class="controls-row">
          <div class="segmented" role="group" aria-label="Precisão do local">
            <button type="button" class="segmented__btn is-active" data-prec="todas">Todas</button>
            <button type="button" class="segmented__btn" data-prec="rua">Rua</button>
            <button type="button" class="segmented__btn" data-prec="bairro">Bairro</button>
          </div>
          <select id="reportSortSelect" class="select-pill" aria-label="Ordenar registros">
            <option value="recente">Mais recentes</option>
            <option value="antigo">Mais antigas</option>
            <option value="tipo">Tipo</option>
            <option value="bairro">Bairro (A–Z)</option>
          </select>
        </div>

        <div class="report-meta">
          <span id="reportMetaCount">0 registros</span>
          <button type="button" class="link-btn" id="resetReportFiltersBtn" hidden>Limpar filtros</button>
        </div>
      </div>

      <div class="report-summary" id="reportSummary" hidden></div>
      <div class="report-list" id="reportList" role="list"></div>
    `;

    el.reportView.querySelectorAll("[data-report-kind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.reportKind = btn.dataset.reportKind;
        state.typesExpanded = false;
        refreshAllViews();
      });
    });

    const searchInput = document.getElementById("reportSearchInput");
    const clearSearch = document.getElementById("clearReportSearchBtn");
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value;
      clearSearch.hidden = !state.query;
      refreshAllViews();
    });
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      state.query = "";
      clearSearch.hidden = true;
      refreshAllViews();
    });

    el.reportView.querySelectorAll("[data-time-win]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.timeWindow = btn.dataset.timeWin;
        refreshAllViews();
      });
    });

    document.getElementById("reportDateFrom").addEventListener("change", (e) => {
      state.dateFrom = e.target.value;
      state.timeWindow = "custom";
      refreshAllViews();
    });
    document.getElementById("reportDateTo").addEventListener("change", (e) => {
      state.dateTo = e.target.value;
      state.timeWindow = "custom";
      refreshAllViews();
    });

    document.getElementById("reportAllTypesBtn").addEventListener("click", () => {
      if (state.reportKind === "transito") state.activeTrafficTypes = new Set(Object.keys(TRAFFIC_TYPES));
      else state.activeCrimeTypes = new Set(Object.keys(CRIME_TYPES));
      refreshAllViews();
    });
    document.getElementById("reportClearTypesBtn").addEventListener("click", () => {
      if (state.reportKind === "transito") state.activeTrafficTypes.clear();
      else state.activeCrimeTypes.clear();
      refreshAllViews();
    });
    document.getElementById("reportExpandTypesBtn").addEventListener("click", () => {
      state.typesExpanded = !state.typesExpanded;
      renderReportContent();
    });

    el.reportView.querySelectorAll("[data-prec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.precisao = btn.dataset.prec;
        refreshAllViews();
      });
    });

    document.getElementById("reportSortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      refreshAllViews();
    });

    document.getElementById("resetReportFiltersBtn").addEventListener("click", resetAllFilters);
    reportShellReady = true;
  }

  function renderReportContent() {
    ensureReportShell();

    el.reportView.classList.toggle("report-view--crimes", state.reportKind === "crimes");
    el.reportView.classList.toggle("report-view--transito", state.reportKind === "transito");

    const visCrimes = getVisibleCrimes();
    const visTraffic = getVisibleTraffic();
    const items = getReportItems();
    const cityLabel = state.cityMeta?.rotulo || "Campo Grande — MS";

    document.getElementById("reportHeadIco").innerHTML =
      state.reportKind === "crimes"
        ? UI_ICONS.shieldAlert
        : state.reportKind === "transito"
        ? UI_ICONS.trafficAlert
        : UI_ICONS.radar;
    document.getElementById("reportHeadTitle").textContent =
      state.reportKind === "crimes"
        ? "Relatório de Crimes"
        : state.reportKind === "transito"
        ? "Acidentes de Trânsito"
        : "Radar de Ocorrências";
    document.getElementById("reportHeadSub").textContent = `${cityLabel} · atualização horária`;

    document.getElementById("tabTodosCnt").textContent = String(visCrimes.length + visTraffic.length);
    document.getElementById("tabCrimesCnt").textContent = String(visCrimes.length);
    document.getElementById("tabTrafficCnt").textContent = String(visTraffic.length);

    el.reportView.querySelectorAll("[data-report-kind]").forEach((btn) => {
      const on = btn.dataset.reportKind === state.reportKind;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
    });

    el.reportView.querySelectorAll("[data-time-win]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.timeWin === state.timeWindow);
    });
    document.getElementById("reportDateRange").hidden = state.timeWindow !== "custom";

    el.reportView.querySelectorAll("[data-prec]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.prec === state.precisao);
    });
    document.getElementById("reportSortSelect").value = state.sort;
    document.getElementById("clearReportSearchBtn").hidden = !state.query;

    // Type filter block (shown on Crimes and Trânsito tabs)
    const typesBlock = document.getElementById("reportTypesBlock");
    if (state.reportKind === "todos") {
      typesBlock.hidden = true;
    } else {
      typesBlock.hidden = false;
      const isTraffic = state.reportKind === "transito";
      const catalog = isTraffic ? TRAFFIC_TYPES : CRIME_TYPES;
      const activeSet = isTraffic ? state.activeTrafficTypes : state.activeCrimeTypes;
      const baseList = filterItems(isTraffic ? state.traffic : state.crimes, {
        kind: state.reportKind,
        ignoreTypes: true,
      });
      const counts = {};
      for (const it of baseList) counts[it.tipo] = (counts[it.tipo] || 0) + 1;

      const totalCatalog = Object.keys(catalog).length;
      document.getElementById("reportTypesHeading").textContent = isTraffic
        ? "Tipos de acidente"
        : "Tipos de crime (CrimeReports)";
      document.getElementById("reportExpandTypesBtn").textContent = state.typesExpanded
        ? "Recolher ▴"
        : `Ver ${totalCatalog} ▾`;

      const chipsEl = document.getElementById("reportTypeChips");
      chipsEl.classList.toggle("is-expanded", state.typesExpanded);
      const ordered = Object.values(catalog).sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
      chipsEl.innerHTML = ordered
        .map((meta) => {
          const cnt = counts[meta.id] || 0;
          const on = activeSet.has(meta.id);
          return `
            <button type="button" class="type-chip ${on ? "" : "is-off"} ${cnt === 0 ? "is-empty" : ""}" data-type-id="${meta.id}" aria-pressed="${on}" title="${escapeHtml(meta.label)} — ${escapeHtml(meta.short)}">
              <span class="type-chip__ico" style="background:${meta.color}">${meta.icon}</span>
              <span>${escapeHtml(meta.label)}</span>
              <span class="type-chip__cnt">${cnt}</span>
            </button>
          `;
        })
        .join("");

      chipsEl.querySelectorAll("[data-type-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.typeId;
          if (activeSet.has(id)) activeSet.delete(id);
          else activeSet.add(id);
          refreshAllViews();
        });
      });
    }

    const totalRaw =
      state.reportKind === "crimes"
        ? state.crimes.length
        : state.reportKind === "transito"
        ? state.traffic.length
        : state.crimes.length + state.traffic.length;
    document.getElementById("reportMetaCount").textContent =
      totalRaw === 0
        ? `Aguardando feed horário de ${state.cityMeta?.nome || "Campo Grande"}`
        : items.length === totalRaw
        ? `${items.length} ${items.length === 1 ? "registro" : "registros"}`
        : `Mostrando ${items.length} de ${totalRaw} registros`;
    document.getElementById("resetReportFiltersBtn").hidden = countActiveFilters() === 0;

    // Summary stats bar
    const summaryEl = document.getElementById("reportSummary");
    if (items.length === 0) {
      summaryEl.hidden = true;
      summaryEl.innerHTML = "";
    } else {
      const recentCount = items.filter(isEventRecent).length;
      const byCat = new Map();
      for (const it of items) {
        const key = `${it.kind}:${it.tipo}`;
        byCat.set(key, (byCat.get(key) || 0) + 1);
      }
      const statPills = [];
      if (recentCount > 0) {
        statPills.push(`<span class="stat-pill stat-pill--recent">${recentCount} ${recentCount === 1 ? "recente" : "recentes"} (3h)</span>`);
      }
      [...byCat.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .forEach(([key, cnt]) => {
          const [kind, tipo] = key.split(":");
          const cat = kind === "transito" ? TRAFFIC_TYPES : CRIME_TYPES;
          const meta = cat[tipo] || cat.outro;
          statPills.push(`
            <span class="stat-pill">
              <span class="stat-pill__dot" style="background:${meta.color}">${meta.icon}</span>
              <span>${cnt} ${escapeHtml(meta.label)}</span>
            </span>
          `);
        });
      summaryEl.hidden = false;
      summaryEl.innerHTML = statPills.join("");
    }

    // Feed list
    const listEl = document.getElementById("reportList");
    if (totalRaw === 0) {
      const slug = state.currentCitySlug;
      listEl.innerHTML = `
        <div class="empty-box">
          <h3>Radar ativo em ${escapeHtml(cityLabel)}</h3>
          <p>Pronto para exibir ocorrências horárias assim que o Grokbot atualizar <code>data/${escapeHtml(slug)}/crimes.json</code> e <code>data/${escapeHtml(slug)}/transito.json</code>.</p>
        </div>
      `;
      return;
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-box">
          <h3>Nenhum registro nessa janela</h3>
          <p>Tente ampliar o período (ex.: 24h, 7 dias ou Todos) ou limpar a busca.</p>
          <button type="button" class="btn-primary" id="emptyResetBtn">Mostrar todos</button>
        </div>
      `;
      document.getElementById("emptyResetBtn").addEventListener("click", resetAllFilters);
      return;
    }

    listEl.innerHTML = items
      .map((item) => {
        const isTraffic = item.kind === "transito";
        const catalog = isTraffic ? TRAFFIC_TYPES : CRIME_TYPES;
        const meta = catalog[item.tipo] || catalog.outro;
        const recent = isEventRecent(item);
        const locParts = [item.bairro, item.endereco].filter(Boolean);
        const precPill =
          item.precisao === "rua"
            ? `<span class="prec-pill prec-pill--rua">Rua</span>`
            : `<span class="prec-pill prec-pill--bairro">Bairro aprox.</span>`;
        const gravPill =
          isTraffic && item.gravidade && GRAVIDADE_LABELS[item.gravidade]
            ? `<span class="grav-pill grav-pill--${item.gravidade}">${GRAVIDADE_LABELS[item.gravidade]}</span>`
            : "";
        return `
          <article class="event-card ${recent ? "event-card--recent" : ""}" style="--event-color:${meta.color}" data-evt-kind="${item.kind}" data-evt-id="${escapeHtml(item.id)}" role="listitem">
            <div class="event-card__top">
              <div class="event-card__badges">
                <span class="event-card__type" style="background:${meta.color}">${meta.icon}<span>${escapeHtml(meta.label)}</span></span>
                ${recent ? `<span class="recent-pill">Recente</span>` : ""}
              </div>
              ${item.timestampMs ? `<span class="event-card__date">${escapeHtml(formatEventDateTime(item))}</span>` : ""}
            </div>
            <h3 class="event-card__title">${escapeHtml(item.titulo)}</h3>
            <p class="event-card__loc">
              <span>${escapeHtml(locParts.join(" · ") || item.cidade)}</span>
              ${gravPill}
              ${precPill}
            </p>
            ${item.descricao ? `<p class="event-card__desc">${escapeHtml(item.descricao)}</p>` : ""}
            <div class="event-card__foot">
              <span class="event-card__source">${item.fonte ? `Fonte: ${escapeHtml(item.fonte)}` : "Registro local"}</span>
              <div class="event-card__actions">
                <button type="button" class="event-btn ${isTraffic ? "event-btn--map-traffic" : "event-btn--map"}">Ver no mapa</button>
                ${
                  item.link
                    ? `<a class="event-btn" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Matéria ↗</a>`
                    : ""
                }
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    listEl.querySelectorAll(".event-card").forEach((card) => {
      const kind = card.dataset.evtKind;
      const id = card.dataset.evtId;
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        focusEventOnMap(kind, id);
      });
      card.addEventListener("mouseenter", () => {
        const entry = kind === "transito" ? trafficMarkers.get(id) : crimeMarkers.get(id);
        const sel = kind === "transito" ? ".traffic-pin" : ".crime-pin";
        const pin = entry?.marker.getElement()?.querySelector(sel);
        if (pin) pin.classList.add("is-highlighted");
      });
      card.addEventListener("mouseleave", () => {
        document.querySelectorAll(".crime-pin.is-highlighted, .traffic-pin.is-highlighted").forEach((n) => {
          n.classList.remove("is-highlighted");
        });
      });
    });
  }

  function renderImoveisModule() {
    if (!FEATURES.imoveis || !el.imoveisView) return;
    el.imoveisView.hidden = false;
    if (state.houses.length === 0) {
      el.imoveisView.innerHTML = `
        <div class="empty-box">
          <h3>Módulo de Imóveis (em espera)</h3>
          <p>Nenhum imóvel cadastrado em <code>data/${escapeHtml(state.currentCitySlug)}/casas.json</code>.</p>
        </div>
      `;
      return;
    }
    el.imoveisView.innerHTML = state.houses
      .map(
        (h) => `
      <article class="event-card" style="--event-color:#15803d">
        <h3 class="event-card__title">${escapeHtml(h.titulo)}</h3>
        <p class="event-card__loc">${escapeHtml(h.bairro)}${h.preco ? ` · R$ ${h.preco.toLocaleString("pt-BR")}` : ""}</p>
        ${h.link ? `<div class="event-card__foot"><span>${escapeHtml(h.finalidade)}</span><a class="event-btn" href="${escapeHtml(h.link)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div>` : ""}
      </article>
    `
      )
      .join("");
  }

  function refreshAllViews() {
    updateStatusPills();
    renderMapLayerBar();
    renderMapLayers();
    renderReportContent();
    if (FEATURES.imoveis) renderImoveisModule();
  }

  // ==================== NAVIGATION & CITY LOADING ====================

  function switchMobileTab(tab) {
    state.activeTab = tab;
    document.body.dataset.tab = tab;
    document.querySelectorAll("[data-nav-tab]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.navTab === tab);
    });
    if (tab === "mapa" && map) {
      setTimeout(() => map.invalidateSize(), 160);
    }
  }

  async function loadCityData(slug, { silent = false, fit = true } = {}) {
    const cityObj = state.cities.find((c) => c.slug === slug) || state.cities[0];
    if (!cityObj) return;

    state.currentCitySlug = cityObj.slug;
    state.cityMeta = cityObj;
    el.citySelect.value = cityObj.slug;
    document.title = `RadarBR — ${cityObj.rotulo}`;

    // Reflect selected city in URL without page reload
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("cidade", cityObj.slug);
    window.history.replaceState({}, "", nextUrl);

    el.refreshFeedBtn.classList.add("is-spinning");

    const base = `./data/${cityObj.slug}`;
    const fetches = [
      fetch(`${base}/cidade.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${base}/crimes.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${base}/transito.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      FEATURES.imoveis
        ? fetch(`${base}/casas.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        : Promise.resolve(null),
    ];

    try {
      const [cityGeo, crimesJson, trafficJson, casasJson] = await Promise.all(fetches);
      state.cityGeo = cityGeo;
      ingestCrimes(crimesJson);
      ingestTraffic(trafficJson);
      ingestHouses(casasJson);

      if (!map) initMap();
      refreshAllViews();
      if (fit) fitMapToCity(true);
      if (!silent) showToast(`${cityObj.rotulo} atualizado`);
    } finally {
      setTimeout(() => el.refreshFeedBtn.classList.remove("is-spinning"), 260);
    }
  }

  function bindEvents() {
    el.citySelect.addEventListener("change", () => {
      loadCityData(el.citySelect.value, { silent: false, fit: true });
    });

    el.refreshFeedBtn.addEventListener("click", () => {
      loadCityData(state.currentCitySlug, { silent: false, fit: false });
    });

    document.querySelectorAll("[data-nav-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchMobileTab(btn.dataset.navTab));
    });

    el.cycleBasemapBtn.addEventListener("click", () => {
      const idx = BASEMAP_STEPS.findIndex((b) => b.id === state.basemap);
      const next = BASEMAP_STEPS[(idx + 1) % BASEMAP_STEPS.length];
      setBasemap(next.id);
      showToast(`Mapa: ${next.label}`);
    });
    document.querySelectorAll("[data-basemap]").forEach((btn) => {
      btn.addEventListener("click", () => setBasemap(btn.dataset.basemap));
    });

    el.fitBoundsBtn.addEventListener("click", () => fitMapToCity(true));
    el.fitBoundsMobileBtn.addEventListener("click", () => fitMapToCity(true));

    if (el.toggleImoveisModeBtn) {
      el.toggleImoveisModeBtn.addEventListener("click", () => {
        state.sidebarMode = state.sidebarMode === "imoveis" ? "relatorios" : "imoveis";
        document.body.dataset.sidebarMode = state.sidebarMode;
        el.toggleImoveisModeBtn.classList.toggle("is-active", state.sidebarMode === "imoveis");
        el.toggleImoveisModeBtn.setAttribute("aria-pressed", String(state.sidebarMode === "imoveis"));
      });
    }

    window.addEventListener("resize", () => {
      if (map) map.invalidateSize();
    });
  }

  async function init() {
    bindEvents();

    try {
      const resp = await fetch("./data/cidades.json", { cache: "no-cache" });
      if (!resp.ok) throw new Error("Não foi possível carregar data/cidades.json");
      const registry = await resp.json();
      state.cities = (registry.cidades || []).filter((c) => c && c.ativa !== false);
      if (!state.cities.length) throw new Error("Nenhuma cidade ativa em data/cidades.json");

      el.citySelect.innerHTML = state.cities
        .map((c) => `<option value="${escapeHtml(c.slug)}">${escapeHtml(c.rotulo || `${c.nome} — ${c.uf}`)}</option>`)
        .join("");

      const requestedSlug = URL_PARAMS.get("cidade");
      const initialSlug = state.cities.some((c) => c.slug === requestedSlug)
        ? requestedSlug
        : registry.cidade_padrao || state.cities[0].slug;

      await loadCityData(initialSlug, { silent: true, fit: true });

      // Periodic silent check for hourly Grokbot updates
      setInterval(() => {
        if (!document.hidden) {
          loadCityData(state.currentCitySlug, { silent: true, fit: false });
        }
      }, AUTO_REFRESH_MS);
    } catch (err) {
      console.error(err);
      el.feedStatusText.textContent = "Erro ao carregar dados";
      el.reportView.innerHTML = `
        <div class="empty-box">
          <h3>Não foi possível carregar o RadarBR</h3>
          <p>${escapeHtml(err.message)}. Para testar localmente, rode <code>python -m http.server</code> na pasta <code>RadarBR</code>.</p>
        </div>
      `;
    }
  }

  init();
})();
