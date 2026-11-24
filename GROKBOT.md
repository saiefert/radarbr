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
| `arma` | Arma / Disparo | Mira / disparo (carmim) | Disparo de arma de fogo, tiroteio, porte/posse ilegal de arma |
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
