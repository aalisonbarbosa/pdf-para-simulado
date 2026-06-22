import { PDFParse } from "pdf-parse";
import type { Alternativa, Questao } from "./types";

async function extrairTextoPdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const resultado = await parser.getText();
  return resultado.text;
}

const RE_QUESTAO =
  /(?:^|\n)\s*(?:QUEST[ÃA]O\s*)?0*(\d{1,3})(?:\s*[.)\-])?\s*(?:\n|(?=[A-ZÀ-Ú("'\u201c]))/gi;
const RE_ALTERNATIVA = /(?:^|\n)\s*\(?([A-E])\)?(?:[.)\-:]|\s)\s*/gi;
const RE_GABARITO_LINHA = /0*(\d{1,3})\s*(?:[-:=]>?|)\s*([A-E])\b/gi;

function dividirEmBlocosDeQuestao(texto: string) {
  const matches = [...texto.matchAll(RE_QUESTAO)];

  const blocos = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const numero = parseInt(m[1], 10);

    const inicio = m.index + m[0].length;
    const proximoMatch = matches[i + 1];
    const fim = proximoMatch ? proximoMatch.index : texto.length;

    blocos.push({ numero, bloco: texto.slice(inicio, fim).trim() });
  }

  return blocos;
}

function dividirEnunciadoEAlternativas(bloco: string) {
  const matches = [...bloco.matchAll(RE_ALTERNATIVA)];

  if (matches.length === 0) {
    return { enunciado: bloco.trim(), alternativas: [] };
  }

  const enunciado = bloco
    .slice(0, matches[0].index)
    .trim()
    .replace(/\s+/g, " ");

  const alternativas: Alternativa[] = matches.map((m, i) => {
    const letra = m[1];
    const inicio = m.index + m[0].length;
    const proximoMatch = matches[i + 1];
    const fim = proximoMatch ? proximoMatch.index : bloco.length;

    const texto = bloco.slice(inicio, fim).trim().replace(/\s+/g, " ");
    return { letra, texto };
  });

  return { enunciado, alternativas };
}

export async function parsearProva(buffer: Buffer) {
  const texto = await extrairTextoPdf(buffer);
  const blocos = dividirEmBlocosDeQuestao(texto);

  const questoes = [];
  for (let { bloco, numero } of blocos) {
    const { enunciado, alternativas } = dividirEnunciadoEAlternativas(bloco);

    questoes.push({ numero, enunciado, alternativas, correta: null });
  }

  return questoes;
}

type Gabarito = Record<number, string>;

function parsearGabaritoTexto(texto: string) {
  const gabarito: Gabarito = {};
  for (const m of texto.matchAll(RE_GABARITO_LINHA)) {
    const numero = parseInt(m[1], 10);
    const letra = m[2].toUpperCase();
    gabarito[numero] = letra;
  }
  return gabarito;
}

export async function parsearGabarito(buffer: Buffer) {
  const texto = await extrairTextoPdf(buffer);
  return parsearGabaritoTexto(texto);
}

export function montarResultado(
  titulo: string,
  questoes: Questao[],
  gabarito: Gabarito,
) {
  for (const q of questoes) {
    const letraCorreta = gabarito[q.numero];
    q.correta = letraCorreta ?? null;
  }

  return { titulo, questoes };
}
