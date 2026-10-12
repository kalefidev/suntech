import { copy } from "../content/copy";
import { PART_TONE } from "../scene/choreography";

const t = copy.solucao;

/** Parte 3c: nosso diferencial (amanhecer seguinte; produto montado, girando). */
export function Differential() {
  return (
    <section
      id="diferencial"
      data-section="diferencial"
      data-field={PART_TONE.diferencial}
      data-part="3"
      aria-labelledby="diferencial-titulo"
      className="part part--tight page-x"
    >
      <div className="part-block part-block--first col-text">
        <h3 id="diferencial-titulo" className="type-h2">
          {t.lifeTitle}
        </h3>
        <ul className="benefits">
          {t.life.map((item) => (
            <li key={item.title} className="type-lead">
              <strong className="benefits__lead">{item.title}.</strong> {item.text}
            </li>
          ))}
        </ul>
      </div>

      <div id="diferencial-tabela" className="part-block part-block--last col-text">
        <h3 id="diferencial-tabela-titulo" className="type-h3">
          {t.diffTitle}
        </h3>
        <div className="table-scroll" role="region" aria-labelledby="diferencial-tabela-titulo" tabIndex={0}>
          {/* Papéis explícitos: no celular a tabela vira grade (CSS), e o Safari tira a
              semântica de tabela de quem muda de `display`. */}
          <table className="data-table data-table--compare" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <td role="cell" />
                {t.diffColumns.map((column, i) => (
                  <th key={column} scope="col" role="columnheader" data-ours={i === t.diffColumns.length - 1 || undefined}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody role="rowgroup">
              {t.diffRows.map((row) => (
                <tr key={row.label} role="row">
                  <th scope="row" role="rowheader">
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={i} role="cell" data-ours={i === row.cells.length - 1 || undefined} data-label={t.diffColumns[i]}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
