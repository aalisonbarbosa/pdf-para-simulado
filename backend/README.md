# PDF para Simulado API

API responsável por extrair questões e gabaritos de arquivos PDF e convertê-los para um JSON estruturado, pronto para utilização em simulados digitais.

---

# Visão Geral

O objetivo deste projeto é automatizar a transformação de provas em PDF para um formato estruturado que possa ser consumido por aplicações web, mobile ou desktop.

A API recebe:

* Um PDF contendo as questões da prova;
* Um PDF contendo o gabarito.

E retorna um JSON contendo todas as questões, alternativas e respostas corretas.

A solução foi projetada para ser simples e stateless:

* Sem banco de dados;
* Sem autenticação;
* Sem armazenamento de arquivos;
* Processamento totalmente em memória;
* Resposta imediata em JSON.

Dessa forma, qualquer frontend pode utilizar a API e decidir como armazenar os simulados gerados.

---

# Funcionalidades

## Extração de Questões

A API identifica automaticamente:

* Número da questão;
* Enunciado;
* Alternativas A, B, C, D e E.

## Extração de Gabarito

A API identifica:

* Número da questão;
* Alternativa correta.

## Montagem do Simulado

Após processar os dois arquivos, a API gera uma estrutura contendo:

* Título do simulado;
* Questões;
* Alternativas;
* Respostas corretas.

---

# Arquitetura

A aplicação segue uma arquitetura simples baseada em uma API stateless.

```text
     Frontend
        |
        v
   API Express
        |
        v
 Processamento PDF
        |
        v
 JSON Estruturado
```

O backend não realiza persistência de dados.

Todo armazenamento dos simulados fica sob responsabilidade da aplicação cliente.

---

# Fluxo da Aplicação

```text
Frontend
   |
   v
Upload PDF da Prova
Upload PDF do Gabarito
   |
   v
API Express
   |
   +--> Extrai texto da prova
   |
   +--> Extrai texto do gabarito
   |
   +--> Associa respostas corretas
   |
   v
JSON Estruturado
   |
   v
Frontend monta o simulado
```

---

# Como Funciona

## Processamento em Memória

Os arquivos enviados não são armazenados em disco.

Todo o processamento é realizado utilizando buffers carregados pelo Multer, tornando a aplicação mais simples e rápida para cenários de conversão sob demanda.

---

# Tecnologias Utilizadas

## Backend

* Node.js
* TypeScript
* Express
* Multer

## Processamento de PDF

* pdf-parse

## Ferramentas

* tsx
* npm

---

# Endpoint

## POST /extrair

Recebe um formulário multipart contendo:

```multipart/form-data
prova: arquivo PDF
gabarito: arquivo PDF
titulo: texto opcional
```

### Exemplo de Requisição

```bash
curl -X POST http://localhost:3001/extrair \
  -F "prova=@prova.pdf" \
  -F "gabarito=@gabarito.pdf" \
  -F "titulo=Simulado de Português"
```

---

# Formatos de Entrada Suportados

## PDF da Prova

A API foi projetada para identificar questões numeradas seguidas por alternativas A-E.

### Exemplo 1

```text
QUESTÃO 01

Ao mencionar os "imigrantes digitais" e os
"nativos digitais", o texto os identifica como:

A) Quem vê o computador como uma invenção recente.

B) Quem vê o computador como algo presente desde cedo.

C) Quem utiliza apenas dispositivos móveis.

D) Quem trabalha exclusivamente com tecnologia.

E) Quem rejeita o uso da internet.
```

### Exemplo 2

```text
1.
Enunciado...

A)
B)
C)
D)
E)
```

### Exemplo 3

```text
01)
Enunciado...

A.
B.
C.
D.
E.
```

### Exemplo 4

```text
QUESTÃO 15
Enunciado...

A-
B-
C-
D-
E-
```

---

## PDF do Gabarito

O gabarito deve conter o número da questão seguido da alternativa correta.

### Exemplo 1

```text
01 A
02 C
03 B
04 D
05 E
```

### Exemplo 2

```text
01 - A
02 - C
03 - B
```

### Exemplo 3

```text
01: A
02: C
03: B
```

### Exemplo 4

```text
01 => A
02 => C
03 => B
```

---

# Estrutura da Resposta

## Exemplo

```json
{
  "titulo": "Simulado de Português",
  "questoes": [
    {
      "numero": 1,
      "enunciado": "Ao mencionar os imigrantes digitais...",
      "alternativas": [
        {
          "letra": "A",
          "texto": "Alternativa A"
        },
        {
          "letra": "B",
          "texto": "Alternativa B"
        }
      ],
      "correta": "B"
    }
  ]
}
```

---

# Estrutura do Projeto

```text
src/
├── parser.ts
├── server.ts
├── types.ts
```

## parser.ts

Responsável por:

* Extrair texto dos PDFs;
* Separar questões;
* Extrair alternativas;
* Interpretar gabaritos;
* Montar o resultado final.

## server.ts

Responsável por:

* Receber uploads;
* Validar arquivos enviados;
* Executar o processamento;
* Retornar o JSON gerado.

## types.ts

Contém as interfaces e tipos utilizados pela aplicação.

---

# Limitações

O parser depende da estrutura textual extraída do PDF.

Podem ocorrer falhas em arquivos que:

* Foram gerados a partir de imagens escaneadas;
* Possuem múltiplas colunas;
* Utilizam alternativas fora do padrão A-E;
* Possuem layouts muito personalizados.

Para PDFs escaneados será necessário utilizar OCR.

---

# Evoluções Futuras

* Suporte a OCR utilizando Tesseract;
* Questões discursivas;
* Questões contendo imagens;
* Exportação para bancos de questões;
* Geração automática de simulados online;
* Integração com plataformas educacionais;
* Microserviço dedicado em Python ou FastAPI para OCR e IA.

---

# Licença

Projeto desenvolvido para fins educacionais e experimentação de processamento de documentos PDF.
