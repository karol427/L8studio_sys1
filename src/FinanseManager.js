import React, { useState } from "react";

// Komponent przyjmuje teraz aktywne dane z Firebase za pomocą props
export default function FinanseManager({
  faktury = [],
  koszty = [],
  setFaktury,
  setKoszty,
}) {
  const [currentTab, setCurrentTab] = useState("faktury");

  // --- KATEGORIE KOLORÓW DLA KOSZTÓW ---
  const KKAT_COLS = {
    ZUS: "#40c4ff",
    VAT: "#ffd740",
    CIT: "#ff9100",
    Wynagrodzenia: "#00e676",
    Najem: "#e040fb",
    Inne: "#888",
  };

  // --- KALKULACJE FINANSOWE LIVE (KPI) ---
  const przychodyLacznie = faktury.reduce((s, f) => s + (f.kwota || 0), 0);
  const wplacono = faktury
    .filter((f) => f.status === "Opłacona")
    .reduce((s, f) => s + (f.kwota || 0), 0);
  const oczekuje = faktury
    .filter((f) => f.status === "Nieopłacona")
    .reduce((s, f) => s + (f.kwota || 0), 0);

  const kosztyLacznie = koszty.reduce((s, k) => s + (k.kwota || 0), 0);
  const kosztyDoOplaty = koszty
    .filter((k) => k.status === "Nieopłacone")
    .reduce((s, k) => s + (k.kwota || 0), 0);

  // Wynik spółki (EBIT) oparty na opłaconych fakturach minus opłacone koszty
  const zyskBrutto =
    wplacono -
    koszty
      .filter((k) => k.status === "Opłacone")
      .reduce((s, k) => s + (k.kwota || 0), 0);
  const szacowanyCit = Math.max(0, Math.round(zyskBrutto * 0.09)); // 9% CIT dla małego podatnika Sp. z o.o.
  const zyskNetto = zyskBrutto - szacowanyCit;

  const fmtPLN = (v) => v.toLocaleString("pl-PL") + " zł";

  // Sprawdzanie przeterminowania faktur
  const dzis = new Date();
  const przeterminowaneFaktury = faktury.filter(
    (f) => f.status === "Nieopłacona" && new Date(f.termin) < dzis
  );

  return (
    <div className="space-y-6 text-[#efefef] animate-fadeIn">
      {/* GLOBALNE KAFELKI FINANSOWE (KPI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#131313] border border-gray-800 p-3.5 rounded-xl shadow-md">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Suma faktur (Netto)
          </span>
          <span className="text-base font-black text-white">
            {fmtPLN(przychodyLacznie)}
          </span>
        </div>
        <div className="bg-[#131313] border border-gray-800 p-3.5 rounded-xl shadow-md">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Spływ należności
          </span>
          <span className="text-base font-black text-green-400">
            {fmtPLN(wplacono)}
          </span>
          <span className="text-[9px] text-gray-500 block">
            Oczekuje: {fmtPLN(oczekuje)}
          </span>
        </div>
        <div className="bg-[#131313] border border-gray-800 p-3.5 rounded-xl shadow-md">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Zobowiązania (Koszty)
          </span>
          <span className="text-base font-black text-orange-400">
            {fmtPLN(kosztyLacznie)}
          </span>
          <span className="text-[9px] text-red-400 block">
            Do opłaty: {fmtPLN(kosztyDoOplaty)}
          </span>
        </div>
        <div className="bg-[#131313] border border-gray-800 p-3.5 rounded-xl shadow-md">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
            Bilans Netto (Live)
          </span>
          <span
            className={`text-base font-black ${
              zyskNetto >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmtPLN(zyskNetto)}
          </span>
        </div>
      </div>

      {/* PASEK ZAKŁADEK MODUŁU FINANSOWEGO */}
      <div className="flex border-b border-gray-800 text-xs font-bold uppercase tracking-wider">
        {[
          { id: "faktury", label: "Monitor Płatności" },
          { id: "koszty", label: "Koszty i Zobowiązania" },
          { id: "podatki", label: "Podatki & ZUS Spółki" },
          { id: "wyniki", label: "Wyniki Spółki (Analiza)" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setCurrentTab(t.id)}
            className={`px-5 py-3 border-b-2 transition-all ${
              currentTab === t.id
                ? "border-green-500 text-green-400 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ZAKŁADKA 1: MONITOR PŁATNOŚCI (FAKTURY) */}
      {currentTab === "faktury" && (
        <div className="space-y-4">
          {przeterminowaneFaktury.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-bold">
              ⚠️ Uwaga! Wykryto {przeterminowaneFaktury.length} przeterminowane
              faktury przychodowe. Wymagana weryfikacja płatności.
            </div>
          )}

          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#161616] text-[10px] text-gray-500 uppercase border-b border-gray-800">
                    <th className="p-3">Numer FV</th>
                    <th className="p-3">Kontrahent</th>
                    <th className="p-3 text-right">Kwota Netto</th>
                    <th className="p-3 text-center">VAT</th>
                    <th className="p-3 text-right">Wartość Brutto</th>
                    <th className="p-3 text-center">Termin</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-400">
                  {faktury.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-600">
                        Brak faktur w bazie danych Firebase.
                      </td>
                    </tr>
                  ) : (
                    faktury.map((f) => {
                      const isOverdue =
                        f.status === "Nieopłacona" && new Date(f.termin) < dzis;
                      const brutto = Math.round(
                        (f.kwota || 0) * (1 + (f.vat || 23) / 100)
                      );
                      return (
                        <tr
                          key={f.id}
                          className={`hover:bg-black/20 transition ${
                            isOverdue ? "bg-red-500/[0.02]" : ""
                          }`}
                        >
                          <td className="p-3 font-bold text-white">
                            {f.nr || "Brak numeru"}
                          </td>
                          <td className="p-3 font-medium text-gray-300">
                            {f.klient || "Nieznany"}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(f.kwota || 0).toLocaleString()} zł
                          </td>
                          <td className="p-3 text-center font-mono text-gray-500">
                            {f.vat || 23}%
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            {brutto.toLocaleString()} zł
                          </td>
                          <td
                            className={`p-3 text-center font-mono ${
                              isOverdue ? "text-red-400 font-bold" : ""
                            }`}
                          >
                            {f.termin || "-"}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                f.status === "Opłacona"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {f.status === "Nieopłacona" && setFaktury && (
                              <button
                                onClick={() =>
                                  setFaktury(
                                    faktury.map((x) =>
                                      x.id === f.id
                                        ? { ...x, status: "Opłacona" }
                                        : x
                                    )
                                  )
                                }
                                className="bg-green-500 hover:bg-green-600 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase"
                              >
                                Rozlicz
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ZAKŁADKA 2: KOSZTY I ZOBOWIĄZANIA */}
      {currentTab === "koszty" && (
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-[10px] text-gray-500 uppercase border-b border-gray-800">
                  <th className="p-3">Opis kosztu</th>
                  <th className="p-3">Kategoria</th>
                  <th className="p-3 text-right">Kwota</th>
                  <th className="p-3 text-center">Termin płatności</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-gray-400">
                {koszty.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-600">
                      Brak wprowadzonych kosztów w bazie danych Firebase.
                    </td>
                  </tr>
                ) : (
                  koszty.map((k) => {
                    const isOverdue =
                      k.status === "Nieopłacone" && new Date(k.termin) < dzis;
                    const cColor = KKAT_COLS[k.kategoria] || "#666";
                    return (
                      <tr
                        key={k.id}
                        className={`hover:bg-black/20 transition ${
                          isOverdue ? "bg-red-500/[0.02]" : ""
                        }`}
                      >
                        <td className="p-3 font-bold text-white">{k.opis}</td>
                        <td className="p-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded border"
                            style={{
                              color: cColor,
                              borderColor: cColor + "33",
                              background: cColor + "10",
                            }}
                          >
                            {k.kategoria || "Inne"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white">
                          {(k.kwota || 0).toLocaleString()} zł
                        </td>
                        <td
                          className={`p-3 text-center font-mono ${
                            isOverdue ? "text-red-400 font-bold" : ""
                          }`}
                        >
                          {k.termin}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              k.status === "Opłacone"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {k.status === "Nieopłacone" && setKoszty && (
                            <button
                              onClick={() =>
                                setKoszty(
                                  koszty.map((x) =>
                                    x.id === k.id
                                      ? { ...x, status: "Opłacone" }
                                      : x
                                  )
                                )
                              }
                              className="bg-green-500 hover:bg-green-600 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase"
                            >
                              Opłać
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ZAKŁADKA 3: PODATKI & ZUS SPÓŁKI */}
      {currentTab === "podatki" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              t: "VAT-7 (Miesięczny)",
              desc: "Deklaracja podatkowa składana do urzędu skarbowego do 25. dnia każdego miesiąca.",
              term: "Co miesiąc (25-ty)",
              status: "Bieżący",
              col: "#ffd740",
            },
            {
              t: "ZUS Spółki - Zarząd i Kadry",
              desc: "Składki na ubezpieczenia społeczne i zdrowotne pracowników oraz organów zarządzających.",
              term: "Co miesiąc (20-ty)",
              status: "Bieżący",
              col: "#40c4ff",
            },
            {
              t: "Zaliczki CIT (9%)",
              desc: "Zaliczka na podatek dochodowy od osób prawnych dla małych podatników Sp. z o.o.",
              term: "Co miesiąc (20-ty)",
              status: "Bieżący",
              col: "#ff9100",
            },
            {
              t: "JPK_V7M i Sprawozdawczość",
              desc: "Jednolity plik kontrolny przesyłany cyfrowo do Ministerstwa Finansów wraz z deklaracją.",
              term: "Co miesiąc (25-ty)",
              status: "Automatyczny",
              col: "#00e676",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#111] border border-gray-800 p-4 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  {item.t}
                </h4>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{
                    color: item.col,
                    background: item.col + "15",
                    border: `1px solid ${item.col}33`,
                  }}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.desc}
              </p>
              <div className="pt-2 border-t border-gray-800/40 flex justify-between text-[11px]">
                <span className="text-gray-600 font-bold uppercase">
                  Termin ustawowy:
                </span>
                <span className="text-gray-300 font-mono font-bold">
                  {item.term}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ZAKŁADKA 4: WYNIKI SPÓŁKI (ANALIZA STRUKTURY) */}
      {currentTab === "wyniki" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-gray-800/40 text-gray-300">
                <tr className="bg-black/10">
                  <td className="p-3 font-semibold">
                    Przychody netto (Opłacone wpływowe)
                  </td>
                  <td className="p-3 text-right font-mono font-black text-green-400">
                    {fmtPLN(wplacono)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">
                    Koszty operacyjne (Opłacone)
                  </td>
                  <td className="p-3 text-right font-mono font-black text-orange-400">
                    {fmtPLN(
                      koszty
                        .filter((k) => k.status === "Opłacone")
                        .reduce((s, k) => s + (k.kwota || 0), 0)
                    )}
                  </td>
                </tr>
                <tr className="bg-black/10">
                  <td className="p-3 font-bold text-white">
                    Wynik operacyjny brutto (EBIT)
                  </td>
                  <td
                    className={`p-3 text-right font-mono font-black ${
                      zyskBrutto >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {fmtPLN(zyskBrutto)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-500">
                    Szacowany podatek CIT (9% stawka preferencyjna)
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-purple-400">
                    -{fmtPLN(szacowanyCit)}
                  </td>
                </tr>
                <tr className="bg-black/20">
                  <td className="p-3 font-black text-white text-sm uppercase tracking-wide">
                    Czysty wynik finansowy netto
                  </td>
                  <td
                    className={`p-3 text-right font-mono font-black text-sm ${
                      zyskNetto >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {fmtPLN(zyskNetto)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DYNAMICZNY WYKRES STRUKTURY FINANSOWEJ (ASCII-BARS SYSTEM) */}
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Wizualizacja struktury budżetowej
            </h4>

            {[
              { label: "Wpływy gotówkowe", val: wplacono, col: "bg-green-400" },
              {
                label: "Zrealizowane koszty",
                val: koszty
                  .filter((k) => k.status === "Opłacone")
                  .reduce((s, k) => s + (k.kwota || 0), 0),
                col: "bg-orange-400",
              },
              {
                label: "Zysk netto spółki",
                val: zyskNetto,
                col: "bg-purple-500",
              },
            ].map((bar, i) => {
              const maxVal = Math.max(wplacono, 1);
              const pct = Math.min(
                100,
                Math.max(0, (Math.abs(bar.val) / maxVal) * 100)
              );
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                    <span>{bar.label}</span>
                    <span className="font-mono text-gray-300">
                      {fmtPLN(bar.val)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-900 border border-gray-800/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bar.col}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
