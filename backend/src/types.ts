export interface Alternativa {
  letra: string;
  texto: string;
}

export interface Questao {
  numero: number;
  enunciado: string;
  alternativas: Alternativa[];
  correta: string | null;
}

export interface Simulado {
  titulo: string;
  questoes: Questao[];
}
