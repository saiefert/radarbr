# Guia de Integração — Grokbot → RadarBR (Atualização Horária por Cidade)

O **RadarBR** organiza os dados por pasta de cidade em `data/<slug>/`, começando por **Campo Grande — MS** (`data/campo-grande-ms/`).

Arquivos atualizados de hora em hora pelo Grokbot para cada cidade:
- `data/campo-grande-ms/crimes.json` — ocorrências policiais
- `data/campo-grande-ms/transito.json` — acidentes de trânsito
- *(Reservado e oculto por padrão)* `data/campo-grande-ms/casas.json` — imóveis (ativável futuramente)

---

## 1. Formato de `data/campo-grande-ms/crimes.json`

```json
{
  "atualizado_em": "2026-11-24T14:00:00-04:00",
  "fonte": "Grokbot",
  "cidade": "Campo Grande - MS",
  "observacao": "Atualização horária das 14h.",
  "ocorrencias": [
    {
      "id": "cgnews-2026-11-24-1330-roubo-aero-rancho",
      "data": "2026-11-24",
      "hora": "13:30",
      "tipo": "roubo",
      "titulo": "Dupla armada rouba moto no Aero Rancho",
      "cidade": "Campo Grande",
      "bairro": "Aero Rancho",
      "endereco": "Av. Rachel de Queiroz (se houver)",
      "lat": -20.5150,
      "lng": -54.6430,
      "precisao": "rua",
      "nova": true,
      "fonte": "Campo Grande News",
      "link": "https://..."
    }
  ]
}
```

### Catálogo de Tipos de Crime (1 ícone por grupo)

| `"tipo"` | Rótulo no Mapa | Ícone | Lista de crimes que se encaixam |
|---|---|---|---|
| `homicidio` | Homicídio / Letal | Faca (vermelho escuro) | Homicídio doloso/culposo, tentativa de homicídio, latrocínio, feminicídio, execução, achado de cadáver com indício de crime |
| `roubo` | Roubo / Assalto | Máscara de assalto (vermelho) | Roubo a pedestre, assalto à mão armada, roubo a residência/comércio, arrastão, sequestro relâmpago |
| `furto` | Furto | Ladrão com bolsa (âmbar) | Furto simples/qualificado, celular, carteira, bicicleta, comércio, fios/cabos, interior de veículo |
| `invasao` | Invasão / Arromb. | Casa com porta arrombada (âmbar escuro) | Arrombamento de casa/comércio, invasão domiciliar, violação de domicílio |
| `veiculo` | Veículo (Furto/Roubo) | Carro com alerta (ocre) | Furto ou roubo de carro, moto, caminhonete ou carga veicular |
| `trafico` | Tráfico / Drogas | Cápsula / pílula (roxo) | Tráfico de drogas, apreensão de entorpecentes, ponto de tráfico (biqueira) |
| `agressao` | Agressão / Violência | Punho fechado / soco (laranja) | Lesão corporal, agressão física, espancamento, esfaqueamento, briga com feridos, ameaça grave |
| `violencia_domestica` | Violência Doméstica | Casa com alerta (rosa escuro) | Violência doméstica, Lei Maria da Penha, descumprimento de medida protetiva |
| `violencia_sexual` | Crime Sexual | Escudo de alerta (magenta) | Estupro, importunação sexual, assédio sexual, abuso |
| `arma` | Arma / Disparo | Pistola / arma de fogo (carmim) | Disparo de arma de fogo, tiroteio, porte/posse ilegal de arma |
| `incendio` | Incêndio Criminoso | Chama (laranja fogo) | Incêndio criminoso em imóvel, terreno, veículo ou mata |
| `vandalismo` | Vandalismo / Dano | Spray (ardósia) | Vandalismo, depredação, dano ao patrimônio, pichação |
| `estelionato` | Estelionato / Golpe | Cartão com X (azul escuro) | Estelionato, golpe presencial, extorsão, fraude local |
| `operacao_policial` | Operação / Prisão | Algemas (azul polícia) | Operação policial, cumprimento de mandado, captura de foragido, flagrante, receptação |
| `outro` | Outra Ocorrência | Triângulo de alerta (grafite) | Outras ocorrências policiais relevantes |

---

## 2. Formato de `data/campo-grande-ms/transito.json`

```json
{
  "atualizado_em": "2026-11-24T14:00:00-04:00",
  "fonte": "Grokbot",
  "cidade": "Campo Grande - MS",
  "observacao": "Atualização horária das 14h.",
  "ocorrencias": [
    {
      "id": "midiamax-2026-11-24-1315-colisao-afonso-pena",
      "data": "2026-11-24",
      "hora": "13:15",
      "tipo": "colisao",
      "titulo": "Colisão entre carro e moto complica trânsito na Av. Afonso Pena",
      "cidade": "Campo Grande",
      "bairro": "Centro",
      "endereco": "Av. Afonso Pena esquina com Rua 14 de Julho",
      "lat": -20.4632,
      "lng": -54.6148,
      "precisao": "rua",
      "gravidade": "leve",
      "nova": true,
      "fonte": "Midiamax",
      "link": "https://..."
    }
  ]
}
```

### Catálogo de Acidentes de Trânsito (Placas Viárias)

| `"tipo"` | Rótulo no Mapa | Lista de acidentes que se encaixam |
|---|---|---|
| `fatal` | Acidente Fatal | Qualquer acidente de trânsito com óbito / vítima fatal |
| `atropelamento` | Atropelamento | Atropelamento de pedestre em via urbana, faixa ou rodovia |
| `moto` | Acidente de Moto | Queda de moto, colisão envolvendo motocicleta/motoneta/entregador |
| `colisao` | Colisão / Batida | Batida entre veículos, engavetamento, cruzamento, choque em poste/muro |
| `capotamento` | Capotamento / Tomb. | Capotamento, tombamento, saída de pista |
| `ciclista` | Ciclista / Bike | Acidente envolvendo ciclista, bicicleta elétrica ou ciclovia |
| `onibus_caminhao` | Ônibus / Caminhão | Caminhão, carreta, ônibus urbano/rodoviário, van escolar |
| `embriaguez` | Embriaguez / Perigo | Embriaguez ao volante, bafômetro positivo, racha, fuga do local |
| `rodovia` | Rodovia / Trevo | Acidente em rodovia, anel viário ou trevo (BR-163, BR-262, MS-010, MS-040, MS-080) |
| `outro` | Outro Acidente | Incêndio em veículo na via, queda de carga/árvore, animal na pista |

---

## 3. Regras para a rotina horária do Grokbot

1. Sempre preencha **`"atualizado_em"`** com data e hora ISO 8601 (ex.: `2026-11-24T14:00:00-04:00` para Campo Grande/MS) — o cabeçalho do site mostra exatamente há quantos minutos foi atualizado.
2. Sempre preencha **`"data"`** (`YYYY-MM-DD`) e, sempre que a notícia informar, **`"hora"`** (`HH:MM`) para que os filtros de **1h, 6h, 12h e 24h** funcionem com precisão.
3. Marque `"nova": true` apenas nos registros recém-encontrados na rodada da última hora (e `false` nos anteriores). O site também destaca automaticamente qualquer registro com menos de 3 horas com o selo **Recente**.
4. Mantenha **`"id"`** estável para evitar duplicatas entre coletas horárias e acumule o histórico recente (ex.: últimos 30–90 dias).
5. Use `"precisao": "rua"` quando houver rua/avenida/cruzamento/km exato e `"precisao": "bairro"` quando só houver o bairro (se `lat`/`lng` ficarem nulos, o site posiciona automaticamente usando `data/campo-grande-ms/cidade.json`).
6. Para adicionar uma **nova cidade** no futuro: adicione a entrada em `data/cidades.json` e crie `data/<slug>/cidade.json`, `crimes.json` e `transito.json`.

---

## 4. Fontes oficiais e portais para Campo Grande — MS

### Base oficial da Polícia / SEJUSP-MS (CSV / Excel — Portal de Dados Abertos)
O Governo de MS publica planilhas `.csv` (abertas no Excel) e API CKAN direto do sistema policial **SIGO** em `https://www.dados.ms.gov.br` com `Nº/ANO`, `FATO`, `DATA DO FATO`, `HORA DO FATO`, `MUNICÍPIO` (`CAMPO GRANDE`) e `BAIRRO`:
- **CVLI (Homicídios / Feminicídios / Latrocínios):** `https://www.dados.ms.gov.br/dataset/crimes-violentos-letais-intencionais-sejusp`
- **Veículos (Furto e Roubo):** `https://www.dados.ms.gov.br/dataset/veiculos-sejusp`
- **Armas de Fogo apreendidas / disparos:** `https://www.dados.ms.gov.br/dataset/armas-sejusp`
- **Tráfico / Drogas e Ocorrências:** `https://www.dados.ms.gov.br/dataset/ocorrencias-sejusp` e `https://www.dados.ms.gov.br/dataset/drogas-sejusp`
- **Cumprimento de Mandados:** `https://www.dados.ms.gov.br/dataset/cumprimento-de-mandado-sejusp`

*(Obs.: os CSVs da SEJUSP-MS têm defasagem média de ~1 a 2 meses — ideais para o histórico oficial de 90 dias/1 ano. O Detran-MS não publica CSV de acidentes de trânsito no portal, apenas frotas, CNH e infrações.)*

### Portais de notícias de Campo Grande (tempo real / hora em hora)
- **G1 MS:** `https://g1.globo.com/rss/g1/ms/mato-grosso-do-sul/`
- **Midiamax (Polícia e Geral):** `https://midiamax.com.br/policia/feed/` e `https://midiamax.com.br/feed/`
- **Campo Grande News:** `https://www.campograndenews.com.br/`
- **JD1 Notícias:** `https://www.jd1noticias.com/rss/`
- **O Estado Online:** `https://oestadoonline.com.br/feed/`
- **Correio do Estado:** `https://correiodoestado.com.br/rss/`
- **Primeira Página:** `https://primeirapagina.com.br/feed/`
- **A Crítica de Campo Grande / Diário Digital / TopMídiaNews**

---

## 5. Fontes oficiais e portais para Maringá — PR (`data/maringa-pr/`)

### Dados oficiais do Paraná (SESP-PR / CAPE / PCPR / PMPR)
- A **SESP-PR (CAPE)** publica relatórios estatísticos consolidados em **PDF** (por município/AISP, sem download aberto de BOs por bairro em CSV/Excel) em `https://www.seguranca.pr.gov.br/Estatisticas`.
- A **PCPR** (`https://www.policiacivil.pr.gov.br/`) e a **PMPR** (`https://www.pmpr.pr.gov.br/`) divulgam notas oficiais de prisões e operações.

### Portais de notícias de Maringá (tempo real / hora em hora)
- **GMC Online (Geral e Policial):** `https://gmconline.com.br/feed/` e `https://gmconline.com.br/noticias/policial/feed/`
- **Plantão Maringá:** `https://plantaomaringa.com/`
- **Maringá Post:** `https://maringapost.com.br/`
- **G1 Norte e Noroeste PR:** `https://g1.globo.com/rss/g1/pr/norte-noroeste/`
- **O Maringá:** `https://omaringa.com.br/feed/`
- **O Diário de Maringá / CBN Maringá / André Almenara / Catve**

---

## 6. Fontes oficiais e portais para São Paulo e Região — SP (`data/sao-paulo-sp/`)

### Base oficial da SSP-SP, PM-SP, PC-SP e Agência SP
- **SSP-SP Planilha Excel Oficial 2026 (`.xlsx` com lat/lng/rua/bairro/hora):** `https://www.ssp.sp.gov.br/assets/estatistica/transparencia/spDados/SPDadosCriminais_2026.xlsx` (portal: `https://www.ssp.sp.gov.br/estatistica/consultas`)
- **PM-SP Notícias:** `https://www.policiamilitar.sp.gov.br/noticias`
- **PC-SP Notícias:** `https://www.policiacivil.sp.gov.br/`
- **Agência SP (comunicados oficiais PM/PC/SSP):** `https://www.agenciasp.sp.gov.br/`

### Portais e jornais locais/de bairro de SP e Grande SP (tempo real / hora em hora)
- **Capital:** G1 SP (`https://g1.globo.com/rss/g1/sp/sao-paulo/`), BNews São Paulo (`https://www.bnewssaopaulo.com.br/feed/`), Metrópoles SP (`https://www.metropoles.com/sao-paulo/feed`), Folha de S.Paulo (`https://feeds.folha.uol.com.br/cotidiano/rss091.xml` e `https://www1.folha.uol.com.br/folha-topicos/sao-paulo/`), Diário Zona Norte (`https://www.diariozonanorte.com.br/feed/`), Jornal Zona Sul (`https://www.jornalzonasul.com.br/feed/`), Diário do Transporte (`https://diariodotransporte.com.br/feed/`), R7 / Band / SBT News / CNN Brasil / UOL
- **Grande ABC:** Diário do Grande ABC (`https://www.dgabc.com.br/rss/`), Repórter Diário (`https://www.reporterdiario.com.br/feed/`), ABCD Jornal (`https://abcdjornal.com.br/feed/`), ABC do ABC
- **Zona Oeste / RMSP:** Visão Oeste (`https://visaooeste.com.br/feed/`), Giro S/A (`https://girosa.com.br/feed/`), O Taboanense (`https://www.otaboanense.com.br/feed/`), Folha de Alphaville (`https://www.folhadealphaville.com.br/feed/`), Webdiário Osasco
- **Guarulhos & Alto Tietê:** Guarulhos Hoje (`https://www.guarulhoshoje.com.br/feed/`), Click Guarulhos (`https://www.clickguarulhos.com.br/feed/`), G1 Mogi/Suzano (`https://g1.globo.com/rss/g1/sp/mogi-das-cruzes-suzano/`), O Diário de Mogi (`https://www.odiariodemogi.net.br/feed/`), Diário de Suzano (`https://www.diariodesuzano.com.br/feed/`)
