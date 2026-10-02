// Aceite da Fase 5 (docs/fase-0.md): nenhum número fora da seção 3 do brief.
// Os fatos moram em src/content/; aqui, procura dígitos no texto que os
// componentes de src/sections põem na tela: texto entre tags JSX, strings
// filhas de tags e os atributos lidos (aria-label, title, alt). Sai com
// código 1 se achar. Uso: node scripts/check-numbers.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const DIR = path.resolve("src/sections");
const SPOKEN = new Set(["aria-label", "title", "alt", "placeholder"]);
const findings = [];

for (const file of (await readdir(DIR)).filter((f) => f.endsWith(".tsx"))) {
  const source = ts.createSourceFile(file, await readFile(path.join(DIR, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (node, text) => {
    if (!/\d/.test(text)) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    findings.push(`${file}:${line + 1}: ${text.trim()}`);
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) report(node, node.text);
    else if (ts.isJsxExpression(node) && node.expression && ts.isJsxElement(node.parent) && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression)))
      report(node, node.expression.text);
    else if (ts.isJsxAttribute(node) && SPOKEN.has(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer))
      report(node, node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (findings.length) {
  console.error(`Números escritos nos componentes (${findings.length}):\n${findings.join("\n")}`);
  process.exit(1);
}
console.log("Nenhum número escrito à mão no texto de src/sections: todos vêm de src/content.");
