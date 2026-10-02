import { PORTFOLIO_URL } from "../config";
import { copy } from "../content/copy";
import { sources } from "../content/feira";

export function Footer() {
  return (
    <footer className="site-footer page-x">
      <div className="col-text">
        <p className="type-body">
          {copy.footer.credit}{" "}
          {PORTFOLIO_URL ? (
            <a href={PORTFOLIO_URL} className="source-link">
              {copy.footer.author}
            </a>
          ) : (
            copy.footer.author
          )}
          .
        </p>
        <h2 className="type-label mt-10">{copy.footer.sourcesTitle}</h2>
        <ul className="type-caption site-footer__sources">
          {Object.values(sources).map((source) => (
            <li key={source.url}>
              <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
