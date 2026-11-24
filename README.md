# RadarBR — Mapa de Crimes & Trânsito por Cidade

App web estático mobile-first + desktop split pensado para **GitHub Pages** (sem build), exibindo ocorrências policiais (estilo **CrimeReports**) e acidentes de trânsito por cidade no Brasil com atualização **de hora em hora** pelo **Grokbot**.

Começando por **Campo Grande — MS** (`data/campo-grande-ms/`) e já estruturado para escalar para múltiplas cidades brasileiras via `data/cidades.json`.

## Estrutura do projeto

- `index.html` — interface principal (mapa interativo + menu centralizado de Relatórios + seletor de cidade + status de atualização horária).
- `assets/css/style.css` — layout responsivo (mobile-first + split desktop), pinos de crime em escudo e pinos de trânsito em placa viária (losango).
- `assets/js/app.js` — motor multi-cidade, 15 ícones de crime + 10 ícones de trânsito, filtros horários (`1h`, `6h`, `12h`, `24h`, `3d`, `7d`, `15d`, `30d`, `Período`), atualização ao vivo e camada de imóveis pronta (oculta por padrão; ativável via `?imoveis=1`).
- `data/cidades.json` — cadastro das cidades disponíveis no seletor.
- `data/campo-grande-ms/cidade.json` — centro do mapa e catálogo de bairros/avenidas de Campo Grande — MS para geocodificação automática.
- `data/campo-grande-ms/crimes.json` — feed horário de ocorrências policiais.
- `data/campo-grande-ms/transito.json` — feed horário de acidentes de trânsito.
- `data/campo-grande-ms/casas.json` — camada de imóveis reservada para uso futuro (oculta por padrão).
- `data/crimes.schema.json` e `data/transito.schema.json` — schemas JSON formais.
- `GROKBOT.md` — guia completo e tabelas de tipos para o Grokbot consultar.

## Como testar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` (ou `http://localhost:8000/?cidade=campo-grande-ms`).

## Camada de imóveis (oculta por padrão)

A estrutura de imóveis (`casas.json`) está preservada e oculta por padrão (`FEATURES.imoveis = false` em `assets/js/app.js`). Para pré-visualizar no futuro sem alterar o código, basta abrir com `?imoveis=1` na URL.
