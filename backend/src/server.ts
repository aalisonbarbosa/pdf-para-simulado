import express from "express";
import multer from "multer";
import { montarResultado, parsearGabarito, parsearProva } from "./parser";

const app = express();

const upload = multer({ storage: multer.memoryStorage() });

type ArquivosDoFormulario = {
  prova?: Express.Multer.File[];
  gabarito?: Express.Multer.File[];
};

app.post(
  "/extrair",
  upload.fields([
    { name: "prova", maxCount: 1 },
    { name: "gabarito", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const arquivos = req.files as ArquivosDoFormulario;

      const arquivoProva = arquivos?.prova?.[0];
      const arquivoGabarito = arquivos?.gabarito?.[0];

      console.log(arquivoProva, arquivoGabarito);

      if (!arquivoProva || !arquivoGabarito) {
        return res.status(400).json({
          erro: "Envie os dois arquivos: 'prova' e 'gabarito'.",
        });
      }

      const titulo = (req.body.titulo as string) || "Simulado";

      const questoes = await parsearProva(arquivoProva.buffer);
      const gabarito = await parsearGabarito(arquivoGabarito.buffer);

      const resultado = montarResultado(titulo, questoes, gabarito);

      return res.json(resultado);
    } catch (err) {
      console.error(err);

      const mensagem = err instanceof Error ? err.message : "Erro desconhecido";

      return res.status(500).json({
        erro: "Falha ao processar os arquivos.",
        detalhe: mensagem,
      });
    }
  },
);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
