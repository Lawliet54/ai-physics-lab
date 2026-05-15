function Fraction({ numerator, denominator, lineClassName = "", textClassName = "" }) {
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`border-b px-1 pb-0.5 ${lineClassName} ${textClassName}`.trim()}>
        {numerator}
      </span>
      <span className={`pt-0.5 ${textClassName}`.trim()}>{denominator}</span>
    </span>
  );
}

function FormulaShell({ children, className = "", style = {} }) {
  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-serif tracking-normal ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

export default function FormulaView({
  formula,
  className = "",
  style = {},
  accent = "#0f172a",
  lineColor = "currentColor",
}) {
  const darkText = { color: accent };
  const lineClassName = "border-current";

  switch (formula) {
    case "F = k|q₁q₂| / r²":
      return (
        <FormulaShell className={className} style={style}>
          <span style={{ ...darkText, fontStyle: "italic" }}>F = k</span>
          <span style={{ ...darkText, padding: "0 0.08em" }}>·</span>
          <Fraction
            lineClassName={lineClassName}
            textClassName="px-1 font-semibold"
            numerator={
              <>
                <span>|q₁|</span>
                <span className="px-1">·</span>
                <span>|q₂|</span>
              </>
            }
            denominator="r²"
          />
        </FormulaShell>
      );
    case "E = F / q = kQ / r²":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>E =</span>
          <Fraction lineClassName={lineClassName} numerator="F" denominator="q" />
          <span style={darkText}>=</span>
          <Fraction lineClassName={lineClassName} numerator="kQ" denominator="r²" />
        </FormulaShell>
      );
    case "E = kQ / r²":
      return (
        <FormulaShell className={className} style={style}>
          <span style={{ ...darkText, fontStyle: "italic" }}>E =</span>
          <Fraction lineClassName={lineClassName} numerator="kQ" denominator="r²" />
        </FormulaShell>
      );
    case "φ = W / q = kQ / r":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>φ =</span>
          <Fraction lineClassName={lineClassName} numerator="W" denominator="q" />
          <span style={darkText}>=</span>
          <Fraction lineClassName={lineClassName} numerator="kQ" denominator="r" />
        </FormulaShell>
      );
    case "φ = kQ / r":
      return (
        <FormulaShell className={className} style={style}>
          <span style={{ ...darkText, fontStyle: "italic" }}>φ =</span>
          <Fraction lineClassName={lineClassName} numerator="kQ" denominator="r" />
        </FormulaShell>
      );
    case "C = Q / U = εε₀S / d":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>C =</span>
          <Fraction lineClassName={lineClassName} numerator="Q" denominator="U" />
          <span style={darkText}>=</span>
          <Fraction lineClassName={lineClassName} numerator="εε₀S" denominator="d" />
        </FormulaShell>
      );
    case "I = U / R":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>I =</span>
          <Fraction lineClassName={lineClassName} numerator="U" denominator="R" />
        </FormulaShell>
      );
    case "U = IR":
      return (
        <FormulaShell className={className} style={style}>
          <span style={{ ...darkText, fontStyle: "italic" }}>U = IR</span>
        </FormulaShell>
      );
    case "R = R₁ + R₂ + ...; 1/R = 1/R₁ + 1/R₂ + ...":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>R = R₁ + R₂ + ... ;</span>
          <Fraction lineClassName={lineClassName} numerator="1" denominator="R" />
          <span style={darkText}>=</span>
          <Fraction lineClassName={lineClassName} numerator="1" denominator="R₁" />
          <span style={darkText}>+</span>
          <Fraction lineClassName={lineClassName} numerator="1" denominator="R₂" />
          <span style={darkText}>+ ...</span>
        </FormulaShell>
      );
    case "U = ε - Ir":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>U = ε − Ir</span>
        </FormulaShell>
      );
    case "I = ε / (R + r)":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>I =</span>
          <Fraction lineClassName={lineClassName} numerator="ε" denominator="R + r" />
        </FormulaShell>
      );
    case "A = UIt, P = UI = I²R = U² / R":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>A = UIt, P = UI = I²R =</span>
          <Fraction lineClassName={lineClassName} numerator="U²" denominator="R" />
        </FormulaShell>
      );
    case "B = μ₀I / 2πr":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>B =</span>
          <Fraction lineClassName={lineClassName} numerator="μ₀I" denominator="2πr" />
        </FormulaShell>
      );
    case "F = BIl sin α":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>F = BIl sin α</span>
        </FormulaShell>
      );
    case "F = qvB sin α":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>F = qvB sin α</span>
        </FormulaShell>
      );
    case "ε = −NΔΦ / Δt":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>ε =</span>
          <Fraction lineClassName={lineClassName} numerator="−NΔΦ" denominator="Δt" />
        </FormulaShell>
      );
    case "ε = NBSω sin(ωt)":
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>ε = NBSω sin(ωt)</span>
        </FormulaShell>
      );
    default:
      return (
        <FormulaShell className={className} style={style}>
          <span style={darkText}>{formula}</span>
        </FormulaShell>
      );
  }
}
