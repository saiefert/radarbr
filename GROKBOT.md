# Guia de Integração — Grokbot → RadarBR (Imóveis & Radar por Cidade)

O **RadarBR** possui **2 abas principais** completamente separadas:
1. **Imóveis** *(aba padrão)* — alimentada por `data/<slug>/casas.json` (com utilidades do entorno em `data/<slug>/pois.json`).
2. **Radar** *(subabas Todos, Crimes e Trânsito)* — alimentada por `data/<slug>/crimes.json` e `data/<slug>/transito.json`.

> **Cidades ativas no momento:** atualizar **APENAS** **Campo Grande — MS** (`data/campo-grande-ms/`) e **Maringá — PR** (`data/maringa-pr/`). As demais cidades (`sao-paulo-sp`, `rio-de-janeiro-rj`, `salvador-ba`) estão preservadas no repositório com `"ativa": false` em `data/cidades.json` e devem permanecer pausadas/ocultas até nova orientação.

Arquivos atualizados pelo Grokbot para cada cidade ativa:
- `data/<slug>/casas.json` — catálogo de imóveis (schema formal em `data/casas.schema.json`)
- `data/<slug>/crimes.json` — ocorrências policiais
- `data/<slug>/transito.json` — acidentes de trânsito

---

## 0. Formato de `data/<slug>/casas.json` (Imóveis — Aba Padrão)

Fonte prioritária inicial para **Campo Grande — MS**: **`https://perezimoveis.com/`** (`/imoveis-para-aluguel` e `/imoveis-de-venda`).

```json
{
  "atualizado_em": "2026-11-25T12:00:00-04:00",
  "fonte": "Grokbot / Perez Imóveis",
  "cidade": "Campo Grande - MS",
  "observacao": "Coleta de imóveis em Campo Grande - MS via perezimoveis.com.",
  "casas": [
    {
      "id": "perez-12345",
      "codigo": "12345",
      "titulo": "Casa 3 quartos no Jardim dos Estados",
      "finalidade": "aluguel",
      "tipo": "Casa",
      "casa": true,
      "chacara": false,
      "preco": 3500,
      "condominio": null,
      "iptu": 180,
      "bairro": "Jardim dos Estados",
      "endereco": "Rua aproximada ou referência",
      "lat": -20.4596,
      "lng": -54.6025,
      "quartos": 3,
      "suites": 1,
      "banheiros": 2,
      "vagas": 2,
      "area_m2": 160,
      "terreno_m2": 360,
      "aceita_pets": true,
      "quintal": true,
      "moveis": false,
      "nova": true,
      "destaque": false,
      "descricao": "Resumo objetivo do imóvel.",
      "nota_grokbot": "Pontos fortes e observações.",
      "tags": ["Quintal", "Suíte"],
      "fotos": ["https://..."],
      "link": "https://perezimoveis.com/...",
      "portal": "Perez Imóveis",
      "encontrado_em": "2026-11-25"
    }
  ]
}
```

- Sempre usar a chave raiz `"casas"` (compatível com `data/casas.schema.json`).
- Sempre salvar o **link direto do imóvel** no campo `"link"` e URLs diretas das fotos em `"fotos"`.
- Se `lat`/`lng` não vierem explícitos, preencher `"bairro"` corretamente que o site geocodifica automaticamente por `data/<slug>/cidade.json`.

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
3. **Link exato da matéria (obrigatório):** no campo `"link"`, salve SEMPRE a URL específica da notícia/matéria correspondente — **nunca** a página inicial do portal (ex.: evitar `https://www.dgabc.com.br/` ou `https://www.metropoles.com/sao-paulo/`). Somente registros provenientes de planilhas oficiais em massa (`SSP-SP` / `SEJUSP-MS (SIGO)`) apontam para a página oficial do conjunto de dados.
4. Marque `"nova": true` apenas nos registros recém-encontrados na rodada da última hora (e `false` nos anteriores). O site também destaca automaticamente qualquer registro com menos de 3 horas com o selo **Recente**.
5. Mantenha **`"id"`** estável para evitar duplicatas entre coletas horárias e acumule o histórico recente (ex.: últimos 30–90 dias).
6. Use `"precisao": "rua"` quando houver rua/avenida/cruzamento/km exato e `"precisao": "bairro"` quando só houver o bairro (se `lat`/`lng` ficarem nulos, o site posiciona automaticamente usando `data/campo-grande-ms/cidade.json`).
7. Para adicionar uma **nova cidade** no futuro: adicione a entrada em `data/cidades.json` e crie `data/<slug>/cidade.json`, `crimes.json` e `transito.json`.

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
*(Nota: alguns portais podem não expor RSS nativo ou apresentar certificado TLS antigo; nesses casos, coletar via Google News RSS com `site:<dominio>` mantendo sempre o link exato da matéria.)*

- **Portais específicos de bairro/região (hiperlocais):**
  - **Nova Lima News:** `https://novalima.news/` (região norte: Nova Lima, Columbia, Anache, Vida Nova, Tarsila do Amaral, Campo Belo e Novos Estados)
  - **Moreninhas News:** `https://moreninhasnews.com.br/` (Moreninhas e região sul — forte cobertura policial e comunitária)
  - **Comunidade.MS:** `http://www.comunidadems.com.br/` *(monitorar retorno — foco em jornalismo de bairro em CG)*

- **Portais que cobrem Campo Grande inteira (com seção de bairros / ruas):**
  - **Campo Grande News ("Direto das Ruas"):** `https://www.campograndenews.com.br/direto-das-ruas` e `https://www.campograndenews.com.br/`
  - **Midiamax (Polícia e Campo Grande):** `https://midiamax.com.br/policia/feed/` e `https://midiamax.com.br/municipios/campo-grande/`
  - **G1 MS:** `https://g1.globo.com/rss/g1/ms/mato-grosso-do-sul/`
  - **Capital News:** `https://www.capitalnews.com.br/`
  - **TOP Mídia News:** `https://www.topmidianews.com.br/`
  - **Correio do Estado:** `https://correiodoestado.com.br/cidades` e `https://correiodoestado.com.br/rss/`
  - **MS News (Campo Grande):** `https://www.msnews.com.br/categorias/56/campo-grande`
  - **Diário Digital:** `https://www.diariodigital.com.br/`
  - **Folha MS:** `https://folhams.com.br/`
  - **MS Notícias:** `https://www.msnoticias.com.br/`
  - **JD1 Notícias:** `https://www.jd1noticias.com/rss/`
  - **O Estado Online:** `https://oestadoonline.com.br/feed/`
  - **Primeira Página:** `https://primeirapagina.com.br/feed/`
  - **A Crítica de Campo Grande / CGNotícias (Prefeitura — obras/serviços por bairro):** `https://www.campogrande.ms.gov.br/cgnoticias/noticias/`

- **Interior de MS (referência para futuras cidades de MS):**
  - **Dourados News** (`https://www.douradosnews.com.br/`), **O Progresso** (`https://www.progresso.com.br/`), **Diário Corumbaense** (`https://diarionline.com.br/`), **Perfil News — Três Lagoas** (`https://www.perfilnews.com.br/`)

- **Diretórios de imprensa de MS:**
  - Guia da Mídia — MS: `https://www.guiademidia.com.br/jornaisdomatogrossodosul.htm`
  - Atlas da Imprensa — MS: `https://atlasdaimprensa.com.br/matogrossodosul-jornais/`
  - ABYZ News Links — MS: `https://www.abyznewslinks.com/brazims.htm`

---

## 5. Fontes oficiais e portais para Maringá — PR (`data/maringa-pr/`)

### Dados oficiais do Paraná (SESP-PR / CAPE / PCPR / PMPR)
- A **SESP-PR (CAPE)** publica relatórios estatísticos consolidados em **PDF** (por município/AISP, sem download aberto de BOs por bairro em CSV/Excel) em `https://www.seguranca.pr.gov.br/Estatisticas`.
- A **PCPR** (`https://www.policiacivil.pr.gov.br/`) e a **PMPR** (`https://www.pmpr.pr.gov.br/`) divulgam notas oficiais de prisões e operações.

### Portais de notícias de Maringá (tempo real / hora em hora)
- **Plantão Maringá:** `https://plantaomaringa.com/`
- **GMC Online (Geral e Policial):** `https://gmconline.com.br/feed/` e `https://gmconline.com.br/noticias/policial/feed/`
- **O Diário de Maringá:** `https://odiariodemaringa.com.br/feed/`
- **Maringá.com:** `https://noticias.maringa.com/feed/`
- **Portal de Maringá:** `https://portaldemaringa.com.br/feed/`
- **Maringá Mais / Jornal do Povo:** `https://www.jornaldopovomaringa.com.br/feed/`
- **Maringá Post:** `https://maringapost.com.br/`
- **Maringá Manchete:** `https://www.maringamanchete.com.br/feed/`
- **O Fato Maringá:** `https://www.ofatomaringa.com.br/`
- **O Maringá:** `https://omaringa.com.br/feed/`
- **Pinga Fogo Notícias:** `https://www.pingafogo.com.br/feed/`
- **Expresso Online:** `https://www.expressoonline.com.br/`
- **O Dia na Cidade:** `https://odianacidade.com.br/`
- **CBN Maringá:** `https://cbnmaringa.com.br/feed/`
- **Blog Angelo Rigon (apuração local, política e cidade):** `https://angelorigon.com.br/`
- **G1 Norte e Noroeste PR:** `https://g1.globo.com/rss/g1/pr/norte-noroeste/`
- **Prefeitura de Maringá (obras, serviços e agenda por região):** `https://www.maringa.pr.gov.br/noticias`
- **Outros:** André Almenara / Catve
- **Diretórios de Maringá:** Guia da Mídia (`https://www.guiademidia.com.br/parana/jornais-de-maringa.htm`) e ListaMídia (`https://listamidia.com.br/pr/maringa`)

---

## 6. Fontes oficiais e portais para São Paulo e Região — SP (`data/sao-paulo-sp/`)

### Base oficial da SSP-SP, PM-SP, PC-SP e Agência SP
- **SSP-SP Planilha Excel Oficial 2026 (`.xlsx` com lat/lng/rua/bairro/hora):** `https://www.ssp.sp.gov.br/assets/estatistica/transparencia/spDados/SPDadosCriminais_2026.xlsx` (portal: `https://www.ssp.sp.gov.br/estatistica/consultas`)
- **PM-SP Notícias:** `https://www.policiamilitar.sp.gov.br/noticias`
- **PC-SP Notícias:** `https://www.policiacivil.sp.gov.br/`
- **Agência SP (comunicados oficiais PM/PC/SSP):** `https://www.agenciasp.sp.gov.br/`

### Portais e jornais locais/de bairro de SP e Grande SP (tempo real / hora em hora)
*(Nota: alguns sites de bairro menores podem apresentar certificado TLS antigo/expirado ou não expor RSS nativo; nesses casos, coletar via Google News RSS com `site:<dominio>` para obter sempre o link exato da matéria.)*

- **Portais gerais e regionalizados (toda a cidade):**
  - G1 SP (`https://g1.globo.com/rss/g1/sp/sao-paulo/`)
  - BNews São Paulo (`https://www.bnewssaopaulo.com.br/feed/`)
  - Metrópoles SP (`https://www.metropoles.com/sao-paulo/feed`)
  - Folha de S.Paulo (`https://feeds.folha.uol.com.br/cotidiano/rss091.xml` e `https://www1.folha.uol.com.br/folha-topicos/sao-paulo/`)
  - SP Jornal (`https://spjornal.com.br/feed/`) — seções por zona (leste, oeste, norte, sul, centro)
  - São Paulo Agora (`https://www.spagora.com.br/feed/` e `https://www.spagora.com.br/bairros/`)
  - Sampa na Web (`https://sampanaweb.com.br/`)
  - Metropolitano SP (`https://metropolitanosp.com.br/`)
  - Diário do Transporte (`https://diariodotransporte.com.br/feed/`), R7, Band, SBT News, CNN Brasil, UOL

- **Zona Leste:**
  - ZL Notícias (`https://zlnoticias.com.br/feed/`), Jornal ZL (`https://zlnews.com.br/`), Leste Online (`https://lesteonline.com.br/`), Jornal Infoleste / Vila Matilde (`https://www.infoleste.com.br/feed/`), Jornal do Momento News (`https://jornaldomomento.com.br/feed/`), Gazeta Penhense (`https://gazetapenhense.com.br/`), Gazeta da Mooca (`http://www.gazetadamooca.com/`), Gazeta de São Mateus (`https://www.gazetasaomateus.com.br/feed/`), Folha de São Miguel (`https://www.folhadesaomiguel.com.br/feed/`), Voz do Bairro / Vila Prudente (`https://vozdobairro.com.br/`), Cidade Tiradentes News (`https://www.cidadetiradentesnews.com.br/`)

- **Zona Norte:**
  - Diário da Zona Norte (`https://www.diariozonanorte.com.br/feed/`), Semanário Zona Norte (`https://www.semanariozonanorte.com.br/`), Jornal SP Norte (`https://www.jornalspnorte.com.br/`), ZN Mais Notícias (`https://www.znmaisnoticias.com.br/feed/`), A Gazeta da Zona Norte (`http://www.gazetazn.com.br/`), Freguesia News (`http://freguesianews.com.br/`), Gazeta da Vila Guilherme (`https://gazetadavilaguilherme.com.br/feed/`)

- **Zona Sul e Extremo Sul:**
  - Jornal São Paulo Zona Sul (`https://jornalzonasul.com.br/feed/`), Zona Sul Notícias (`https://www.zonasulnoticias.com.br/feed/`), Grupo Sul News (`https://gruposulnews.com.br/`), Ipiranga News (`https://ipiranganews.inf.br/feed/`), Jabaquara News (`https://jabaquaranews.com.br/feed/`), Grajaú News (`https://grajaunews.com/`), Folha do Capão (`http://folhadocapao.com.br/`), Cidade Ademar em Notícias (`http://www.cidadeademaremnoticias.com.br/`), Espaço do Povo / Paraisópolis (`https://espacodopovo.com.br/feed/`), Folha Minha Sampa / Parelheiros-Marsilac (`https://www.folhadaminhasampa.com.br/`), Periferia em Movimento (`http://periferiaemmovimento.com.br/`)

- **Zona Oeste:**
  - Jornal Oeste News (`https://www.jornaloestenews.com.br/`), Folha Noroeste (`http://folhanoroeste.com/`), Jornal da Gente / Lapa (`http://www.jornaldagente.inf.br/`), Daqui Lapa (`http://www.daquilapa.com.br/`), Gazeta de Pinheiros (`https://gazetadepinheiros.com.br/`), Perdizes Digital (`https://www.perdizesdigital.com.br/`), Pirituba Agora (`http://piritubaagora.com.br/`), Perus e Região (`http://peruseregiao.com.br/`), Barra Funda News (`https://www.barranewssp.com/`)

- **Centro:**
  - Jornal do Brás (`https://jornaldobras.com.br/`), Bom Retiro Digital (`https://www.bomretirodigital.com.br/`), Jornal da Liberdade (`https://www.ajorb.com.br/associados/jornal-da-liberdade/`), Notícias da Aclimação e Cambuci (`https://www.ajorb.com.br/associados/noticias-da-aclimacao-e-cambuci/`)

- **Grande São Paulo (RMSP):**
  - **Grande ABC:** Diário do Grande ABC (`https://www.dgabc.com.br/rss/`), Repórter Diário (`https://www.reporterdiario.com.br/feed/`), ABC Agora (`https://abcagora.com.br/`), Clique ABC (`https://cliqueabc.com.br/`), ABCD Jornal (`https://abcdjornal.com.br/feed/`), ABC do ABC
  - **Oeste RMSP (Osasco / Barueri / Taboão):** Portal Mídia Oeste (`https://midiaoeste.com.br/feed/`), Visão Oeste (`https://visaooeste.com.br/feed/`), Giro S/A (`https://girosa.com.br/feed/`), O Taboanense (`https://www.otaboanense.com.br/feed/`), Folha de Alphaville (`https://www.folhadealphaville.com.br/feed/`), Webdiário Osasco
  - **Periferia da Grande SP / Guarulhos / Alto Tietê:** Agência Mural (`https://www.agenciamural.org.br/feed/`), Guarulhos Hoje (`https://www.guarulhoshoje.com.br/feed/`), Click Guarulhos (`https://www.clickguarulhos.com.br/feed/`), G1 Mogi/Suzano (`https://g1.globo.com/rss/g1/sp/mogi-das-cruzes-suzano/`), O Diário de Mogi (`https://www.odiariodemogi.net.br/feed/`), Diário de Suzano (`https://www.diariodesuzano.com.br/feed/`)

- **Diretórios de referência para descoberta de novos jornais locais:**
  - AJORB (Associação dos Jornais e Revistas de Bairro de SP): `https://www.ajorb.com.br/associados/`
  - Guia da Mídia — Bairros da Capital: `https://www.guiademidia.com.br/jornais/saopaulo/bairros.htm`
  - Guia da Mídia — Grande SP: `https://www.guiademidia.com.br/jornais/saopaulo/grandesp.htm`

---

## 7. Fontes oficiais e portais para Rio de Janeiro e Região — RJ (`data/rio-de-janeiro-rj/`)

### Base oficial da Polícia / ISP-RJ, PCERJ e PMERJ (CSVs abertos)
O **ISP-RJ (Instituto de Segurança Pública do Estado do Rio de Janeiro)** consolida mensalmente os registros oficiais da **Polícia Civil (CISP / Delegacia)** e da **Polícia Militar (AISP / Batalhão)** em `https://www.ispdados.rj.gov.br/estatistica.html`:
- **Base Mensal por Delegacia (CISP / AISP):** `https://www.ispdados.rj.gov.br/Arquivos/BaseDPEvolucaoMensalCisp.csv` (CVLI, homicídio doloso, latrocínio, feminicídio, intervenção policial, roubo de rua/transeunte/celular/veículo/carga, furtos, estupro, tráfico/apreensão de drogas, estelionato)
- **Armas de Fogo Apreendidas por Delegacia (CISP / AISP):** `https://www.ispdados.rj.gov.br/Arquivos/ArmasApreendidasEvolucaoCisp.csv` (fuzis, pistolas, revólveres, submetralhadoras, espingardas, carabinas, artefatos explosivos)
- **Drogas Apreendidas por Delegacia (CISP):** `https://www.ispdados.rj.gov.br/Arquivos/DrogasEvolucaoMensalCisp.csv`
- **Base Municipal Mensal & UPPs:** `https://www.ispdados.rj.gov.br/Arquivos/BaseMunicipioMensal.csv` e `https://www.ispdados.rj.gov.br/Arquivos/UppEvolucaoMensalDeTitulos.csv`
- **Portais oficiais:** PMERJ (`https://sepm.rj.gov.br/`) e PCERJ (`https://www.policiacivil.rj.gov.br/`)

### Portais com editoria de bairro (tempo real / hora em hora)
- **g1 Rio:** `https://g1.globo.com/rss/g1/rj/rio-de-janeiro/` (`https://g1.globo.com/rj/rio-de-janeiro/`)
- **O Globo — Bairros (Zona Sul, Barra, Tijuca/ZN, Niterói):** `https://oglobo.globo.com/rio/bairros/`
- **Extra — Zona Oeste / Polícia:** `https://extra.globo.com/noticias/rio/zona-oeste/`
- **Diário do Rio (bairro a bairro — ZN, ZO, Centro, ZS):** `https://diariodorio.com/`
- **O Dia Rio:** `https://odia.ig.com.br/_conteudo/rio-de-janeiro/rss.xml`

### Jornais de bairro e regionais do RJ
- **Correio Carioca (Zona Norte):** `https://correiocarioca.com.br/feed/`
- **Notícias Úteis da Zona Oeste:** `https://www.noticiasuteisdazonaoeste.com.br/`
- **Jornal do Recreio:** `https://jornaldorecreio.com.br/feed/`
- **Tipo Carioca (Recreio):** `https://www.tipocarioca.com.br/`
- **Jornal Orla Sul:** `https://jornalorlasul.com.br/`
- **Ilha Carioca (Ilha do Governador):** `https://ilhacarioca.com/feed/`
- **O Cidadão (Maré):** `https://jornalocidadao.net/feed/`
- **Expresso Carioca (Vila da Penha):** `https://www.expressocarioca.com.br/feed/`
- **JB em Folhas (Jardim Botânico, Gávea, Humaitá, Lagoa):** `https://jbemfolhas.com.br/feed/`
- **Folha do Centro:** `https://www.jornalfolhadocentro.com.br/`
- **Guias por bairro:** Realengo (`https://realengo.net.br/`), Bangu (`https://bangu.net.br/`), Botafogo (`https://botafogo.net.br/`)

### Comunicação comunitária de favela
- **Voz das Comunidades:** `https://vozdascomunidades.com.br/feed/`
- **ANF — Agência de Notícias das Favelas:** `https://www.anf.org.br/feed/`
- **RioOnWatch:** `https://rioonwatch.org.br/`
- **Maré de Notícias:** perfil em `https://rioonwatch.org.br/?p=12900`

### Diretórios de imprensa do RJ
- Guia da Mídia — RJ: `https://www.guiademidia.com.br/rio-de-janeiro/jornais-do-rio-de-janeiro.htm`
- Atlas da Imprensa — RJ: `https://atlasdaimprensa.com.br/riodejaneiro-jornais/`
- ABYZ News Links — RJ: `https://www.abyznewslinks.com/brazirj.htm`

---

## 8. Fontes oficiais e portais para Salvador e Região — BA (`data/salvador-ba/`)

### Fontes oficiais da Segurança Pública e território (SSP-BA / PMBA / PCBA / Prefeitura-Bairro)
- **SSP-BA Estatísticas 2026 (portal oficial):** `https://www.ba.gov.br/ssp/estatistica` e `https://www.ba.gov.br/ssp/publicacoes?combine=2026&term_node_tid_depth=All`
- **SSP-BA Microdados Oficiais de Mortes Violentas 2026 (`.csv` com lat/lng, bairro, data e hora):** `https://www.ba.gov.br/ssp/sites/site-ssp/files/2026-11/01_MORTES_VIOLENTAS_ESTADO_MICRODADOS.csv`
- **SSP-BA Microdados Oficiais de Veículos 2026 (`.xlsx` com bairro, AISP, marca/modelo e data):** `https://www.ba.gov.br/ssp/sites/site-ssp/files/2026-11/05_MICRODADOS_VEICULOS.xlsx`
- **SSP-BA Outros Delitos e Violência contra Mulher 2026 (`.xlsx`):** `05_OUTROS_DELITOS_ESTADO.xlsx` e `06_VIOLENCIA_CONTRA_MULHER.xlsx` (portal `https://dados.ba.gov.br/`)
- **PMBA / PCBA:** comunicados oficiais de operações em `https://www.ba.gov.br/ssp/noticias`, `https://www.ba.gov.br/policiacivil/noticias` e `https://www.ba.gov.br/pm/noticias`
- **Prefeitura-Bairro (notícia e serviço por território):** `https://prefeiturabairro.salvador.ba.gov.br/noticias/`
- **TBC Cabula (17 bairros da área do Cabula):** `https://tbccabula.com.br/`

### Portais que cobrem Salvador inteira (tempo real / hora em hora)
- **G1 Bahia:** `https://g1.globo.com/rss/g1/ba/bahia/`
- **Bahia Notícias:** `https://www.bahianoticias.com.br/`
- **Correio 24 Horas:** `https://www.correio24horas.com.br/`
- **A Tarde:** `https://atarde.com.br/`
- **Metro1:** `https://www.metro1.com.br/`
- **BNews:** `https://www.bnews.com.br/`
- **Aratu On:** `https://aratuon.com.br/feed/`
- **Portal Massa:** `https://jornalmassa.com.br/`
- **Tribuna da Bahia:** `http://www.tribunadabahia.com.br/`
- **Leia Mais BA:** `https://leiamaisba.com.br/`
- **Relata Bahia:** `https://relatabahia.com.br/`
- **iBahia:** `https://www.ibahia.com/`
- **Alô Alô Bahia (cultura/eventos):** `https://aloalobahia.com/`

### Portais e mídias comunitárias por bairro (Salvador — ecossistema Rede Midicom)
- **Subúrbio Ferroviário:** Paripe.net (`https://www.paripe.net/`), Subúrbio News (`https://www.suburbionews.com.br/`), Subúrbio Online (`https://suburbioonline.com/`)
- **Cajazeiras:** Fala Cajazeiras (`https://falacajazeiras.com.br/`), Jornal Cajazeiras (`https://jornalcajazeiras.com.br/`), Cajaon (`https://cajaon.com.br/`)
- **Itapuã:** Itapuã City (`https://www.itapuacity.com.br/`), Itapuã News (`https://medium.com/@itapuanews`)
- **Boca do Rio:** Boca do Rio Magazine (`https://bocadoriomagazine.com.br/`)
- **Perfis hiperlocais em redes sociais (monitoramento complementar):**
  - Pernambués / Saramandaia: Portal Pernambués (`https://www.instagram.com/portalpernambues/`)
  - Sussuarana: Sussuarana City (`https://www.instagram.com/sussuaranacity_/`)
  - Castelo Branco: CBX Notícias (`https://www.instagram.com/cbxnoticias/`)
  - Valéria: Valéria City Oficial (`https://www.instagram.com/valeriacityoficial/`) e Valéria News (`https://www.instagram.com/valerianews/`)
  - Mata Escura: Mata Escura em Foco (`https://www.instagram.com/mataescuraemfoco/`)
  - Engenho Velho: Nosso Engenho (`https://www.facebook.com/SiteNossoEngenho`)
  - Bairro da Paz: Bairro da Paz News (`https://www.instagram.com/bairrodapaznews/`)
- **Coletivos, redes e jornalismo periférico:**
  - Rede Midicom (`https://www.instagram.com/redemidicom/`), Coletivo Entre Becos (`https://www.instagram.com/entrebecos/`), ANF — Agência de Notícias das Favelas (`https://www.anf.org.br/`), Portal UMBU (`https://portalumbu.com.br/`), Mídia Periférica (`https://midiaperiferica.blogspot.com/`)

### Diretórios de Salvador / Bahia
- Mapeamento de Veículos de Bairros (catálogo anual dos 37 veículos comunitários): `https://www.mapeamentocmtv.com.br/`
- Guia da Mídia — Salvador: `https://www.guiademidia.com.br/bahia/jornais-de-salvador.htm`
- ABYZ News Links — BA: `https://www.abyznewslinks.com/braziba.htm`
