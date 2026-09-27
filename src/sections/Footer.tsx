import { PORTFOLIO_URL } from "../config";

export function Footer() {
  return (
    <footer className="border-nuvem/10 border-t px-6 py-10 text-sm opacity-70 md:px-10">
      <p>
        Conceito de produto criado a partir do protótipo da equipe SunTech,
        num projeto escolar. Design e código do site:{" "}
        <a href={PORTFOLIO_URL} className="underline">
          Kaique Calefi
        </a>
        .
      </p>
    </footer>
  );
}
