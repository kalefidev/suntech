import { copy } from "../content/copy";
import { company } from "../content/company";
import { brl } from "../content/format";
import { partsOfFair } from "../content/feira";
import { product, specSheet } from "../content/product";
import { ChapterOpener } from "./ChapterOpener";

const part = partsOfFair[3];
const t = copy.empresa;

/**
 * Plano de voo (Aula 5) como cartão de embarque: é o único objeto "cartão" da
 * página, porque é a metáfora da própria aula. Tem fundo próprio (Nuvem com
 * texto Noite), então não depende da hora do céu.
 */
function BoardingPass() {
  return (
    <div className="ticket-wrap">
      <figure className="ticket" aria-labelledby="plano-de-voo">
      <div className="ticket__main">
        <dl className="ticket__fields">
          {t.flight.map((f) => (
            <div key={f.field} className="ticket__field">
              <dt className="type-caption ticket__label">{f.field}</dt>
              <dd className="type-body">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="ticket__stub" aria-hidden="true">
        <span className="ticket__brand">{company.name}</span>
        <span className="type-caption">{company.event}</span>
        <span className="type-caption">
          {company.school}, {company.semester}
        </span>
      </div>
      </figure>
    </div>
  );
}

function CostsTable() {
  return (
    <div className="table-scroll" role="region" aria-labelledby="custos-titulo" tabIndex={0}>
      <table id="custos" className="data-table data-table--costs">
        <caption id="custos-titulo" className="type-label">
          {t.finance.costsTitle} <span className="estimate">({t.estimateLabel})</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" className="num-col">
              Custo
            </th>
          </tr>
        </thead>
        <tbody>
          {product.costs.map((row) => (
            <tr key={row.item}>
              <th scope="row">{row.item}</th>
              <td className="num num-col">{brl(row.brl)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num num-col">{brl(product.costTotalBRL)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Sectors() {
  const m = t.marketing;
  return (
    <div className="part-block col-text">
      <h3 className="type-h3">{t.sectorsTitle}</h3>
      <div className="sectors">
        <article className="sector">
          <h4 className="type-h3 sector__name">{t.products.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{t.products.lead}</p>
            <p className="type-body mt-3">{t.products.text}</p>
          </div>
        </article>

        <article className="sector" id="financas">
          <h4 className="type-h3 sector__name">{t.finance.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{t.finance.lead}</p>
            <CostsTable />
            <p id="preco" className="type-lead price">
              {t.finance.priceLabel}: <strong className="fact__number num">{brl(product.priceBRL)}</strong>, com
              margem de {product.margin} sobre o preço.
            </p>
            <p className="type-body mt-4">{t.finance.strategy}</p>
          </div>
        </article>

        <article className="sector">
          <h4 className="type-h3 sector__name">{m.name}</h4>
          <div className="sector__body">
            <p className="type-lead">{m.lead}</p>
            <p className="type-body mt-3">{m.identity}</p>
            <ul className="swatches" aria-label="Cores da marca">
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-sol)" }} aria-hidden="true" />
                Sol
              </li>
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-ceu)" }} aria-hidden="true" />
                Céu
              </li>
              <li>
                <span className="swatches__chip" style={{ background: "var(--color-noite)" }} aria-hidden="true" />
                Noite
              </li>
            </ul>
            <p className="type-quote slogan">“{m.slogan}”</p>
            <p className="type-body mt-6">{m.focus}</p>
            <p className="type-body mt-3">{m.booth}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Prototype() {
  return (
    <div className="part-block part-block--last col-text">
      <h3 className="type-h2">{t.prototypeTitle}</h3>
      <p className="type-lead mt-8">{t.prototype}</p>

      <h4 className="type-h3 mt-16" id="ficha">
        {t.specTitle}
      </h4>
      <dl className="spec">
        {specSheet().map((row) => (
          <div key={row.label} className="spec__row">
            <dt className="type-label">{row.label}</dt>
            <dd className="type-body">
              {row.value}
              {row.estimate && <span className="estimate"> ({t.estimateLabel})</span>}
            </dd>
          </div>
        ))}
      </dl>

      <h4 className="type-h3 mt-16">{t.historyTitle}</h4>
      <ol className="history">
        {company.history.map((step, i) => (
          <li key={step.title} className="history__step">
            <span className="type-label num">{i + 1}</span>
            <div>
              <p className="type-label">{step.title}</p>
              <p className="type-body mt-2">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="type-caption mt-8">{company.team}</p>
    </div>
  );
}

/** Parte 4: A empresa (Aula 5). Dia claro, produto quieto ao lado. */
export function Company() {
  return (
    <section
      id={part.id}
      data-section={part.id}
      data-part={part.n}
      aria-labelledby={`${part.id}-titulo`}
      className="part page-x"
    >
      <ChapterOpener part={part} />

      <div className="part-block col-text">
        <h3 className="type-h3">{t.whoTitle}</h3>
        <p className="type-lead mt-4">{t.who}</p>
      </div>

      <div className="part-block col-text">
        <h3 id="plano-de-voo" className="type-h3">
          {t.flightTitle}
        </h3>
        <BoardingPass />
      </div>

      <Sectors />
      <Prototype />
    </section>
  );
}
