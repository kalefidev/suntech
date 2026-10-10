# models-src

Fonte do modelo 3D feito à mão (passo a passo em `docs/v3-modelo-a-mao.md`).

- `suntech.blend`: o arquivo do Blender. **Entra no commit** (é a fonte do modelo).
- `suntech.glb`: o export cru do Blender (*File → Export → glTF 2.0*). Fica fora do git: é refeito a partir do `.blend`.

Para publicar no site: `npm run model:import` (confere o contrato, comprime e grava `public/models/suntech.glb`).
