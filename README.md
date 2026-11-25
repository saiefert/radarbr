# RadarBR — Imóveis & Radar Urbano

App web estático mobile-first + desktop split pensado para **GitHub Pages** (sem build), com **2 abas principais totalmente distintas**:

1. **Imóveis** *(aba padrão)* — listagem completa de imóveis (estilo BotucaSite) com filtros avançados, comparador, favoritos/notas em `localStorage`, **mapa limpo por padrão** (pins de escolas municipais, estaduais e particulares, igrejas, mercados, farmácias, saúde, parques, academias, padarias e pet aparecem somente ao clicar em um imóvel), **análise de dados do entorno e preço/m²** (estilo portais americanos de aluguel), **simulador de rotas** (**Carro, Moto, Bike e A pé**) e cadastro de **Meus Locais** (Trabalho, Onde moro, Escola etc. salvos no navegador).
2. **Radar** — ocorrências policiais (estilo CrimeReports) e acidentes de trânsito com as **3 subabas** (`Todos`, `Crimes` e `Trânsito`) e filtros horários.

## Cidades ativas

- **Campo Grande — MS** (`data/campo-grande-ms/`) — imóveis via **Perez Imóveis** (`https://perezimoveis.com/`) + POIs + Radar.
- **Maringá — PR** (`data/maringa-pr/`) — imóveis + POIs + Radar.
- *(Outras cidades — São Paulo, Rio de Janeiro e Salvador — permanecem preservadas no repositório com `"ativa": false` em `data/cidades.json`, ocultas e desativadas neste momento.)*

## Estrutura do projeto

- `index.html` — interface principal com as 2 abas (`Imóveis` e `Radar`), drawer de detalhes, modais de Filtros, Comparador e Meus Locais.
- `assets/css/style.css` e `assets/css/imoveis.css` — layout responsivo (mobile-first + split desktop).
- `assets/js/app.js` — controlador multi-cidade, mapa Leaflet, alternância isolada entre Imóveis e Radar e motor de Crimes & Trânsito.
- `assets/js/imoveis.js` — listagem, filtros, análise do entorno e preço/m², revelação de POIs sob demanda ao clicar no imóvel, simulador OSRM (Carro/Moto/Bike/A pé) e rotina pessoal em `localStorage`.
- `data/cidades.json` — cadastro das cidades (`ativa: true/false`).
- `data/<slug>/casas.json`, `pois.json`, `cidade.json`, `crimes.json`, `transito.json` — dados por cidade.
- `data/casas.schema.json`, `crimes.schema.json`, `transito.schema.json` — schemas JSON formais.
- `GROKBOT.md` — guia completo de atualização para o Grokbot.

## Como testar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` (aba Imóveis por padrão) ou `http://localhost:8000/?aba=radar&cidade=campo-grande-ms`.
