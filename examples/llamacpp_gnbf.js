#!/usr/bin/env node
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import { Lm } from "../packages/api/dist/main.es.js";

const rawInfo = `Nom commercial
ENEDIS
SIRET
444 608 442 13631
Dirigeants
Marianne LAIGNEAU
Voir tous les dirigeants
Greffe du tribunal de commerce de NANTERRE
Chiffre d'affaires 2022
15 K€
Effectif 2022
Non communiqué
Inscription
Première immatriculation le 23 / 12 / 2002
Activité (code NAF)
3513Z : Distribution d'électricité
Forme juridique
Société anonyme à directoire et conseil de surveillance`;
const prompt = `Extract relevant company information from this text:\n\n${rawInfo}`;

async function main() {
  const grammar = await compile(
    `interface Company {
         name: string;
         activity: string;
         revenue: string;
         registration_date: string;
         leaders: Array<string>;
         siret: string;
     }`, "Company");

  const template = "<s>[INST] {prompt} [/INST]";
  const lm = new Lm({
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    onToken: (t) => process.stdout.write(t),
  });
  process.on('SIGINT', () => {
    lm.abort().then(() => process.exit());
  });
  const _prompt = template.replace("{prompt}", prompt);
  console.log(_prompt);
  const res = await lm.infer(_prompt, {
    temperature: 0,
    max_tokens: 512,
    grammar: serializeGrammar(grammar),
    stop: ["</s>"],
  });
  const data = JSON.parse(res.text);
  console.log("\n", data)
}

(async () => {
  await main();
})();