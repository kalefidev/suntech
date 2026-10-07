# Licenças dos ativos 3D

## `suntech.glb`

Modelo **original do projeto SunTech**, gerado por código: o `npm run model` (pasta
`scripts/model/`) monta cada peça com geometria chanfrada do three.js (`ExtrudeGeometry`,
`LatheGeometry`, subtração booleana), exporta com o `GLTFExporter` e comprime com
gltf-transform + meshopt. **Nenhuma malha, textura ou material de terceiros está dentro do
arquivo.** Os direitos são do projeto, como o resto do repositório.

Unidades: 1 = 100 mm. Peças nomeadas pelo contrato do `CLAUDE.md` (`case_base`, `case_lid`,
`cell_a`, `cell_b`, `pcb_charge`, `pcb_boost`, `panel_a`, `panel_b`, `usb_port`, `led`,
`phone`). Materiais e texturas em canvas são do runtime (`src/scene/model/` e
`src/scene/textures/`).

### Terceiros que influenciam o arquivo

| O quê | Onde aparece | Licença |
| --- | --- | --- |
| Contornos das letras da fonte **Archivo** (variável, `wght` 800 e `wdth` 125), de `@fontsource-variable/archivo` | O nome "SunTech" extrudado na tampa da caixa | SIL OFL 1.1 |

### Ferramentas do gerador (não entram no arquivo)

| Pacote | Licença |
| --- | --- |
| `three` 0.186 | MIT |
| `three-bvh-csg`, `three-mesh-bvh` | MIT |
| `@gltf-transform/core`, `extensions`, `functions` | MIT |
| `meshoptimizer` | MIT |
| `fontkit`, `wawoff2` | MIT |

### Fontes abertas consultadas e não usadas

Procuramos peças prontas com licença permissiva (celular, célula 18650, módulo TP4056, painel
solar) em Poly Pizza (CC0 e CC-BY), OpenGameArt ("lowpoly electronic components", CC0) e Poly
Haven (CC0). **Nada foi importado.** Se alguma malha de terceiros entrar no gerador, registre
aqui: autor, link, licença e o que foi alterado (a CC-BY exige a atribuição também no site).
