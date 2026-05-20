import React, { useState, useEffect } from "react";

export default function KosztorysEditor({ koszty = [] }) {
  // Domyślny stabilny szablon kosztorysu na wypadek braku danych w bazie
  const szablonKosztorysu = {
    nazwa: "Kosztorys ING - FUR",
    wariant: "FUR",
    strefy: [
      {
        nazwa: "Strefa CUSTOM",
        open: true,
        globalMarza: 50,
        kategorie: [
          {
            nazwa: "Meble Modulowe",
            items: [
              { id: 1, nazwa: "Lada MDF", typ: "M", jedn: "szt", ilosc: 1, koszt: 4800, marza: 50, cenaKl: 7200 },
              { id: 2, nazwa: "Kostka 40x40", typ: "M", jedn: "szt", ilosc: 5, koszt: 1375, marza: 60, cenaKl: 2200 }
            ]
          }
        ]
      },
      {
        nazwa: "Logistyka",
        open: true,
        globalMarza: 0,
        kategorie: [
          {
            nazwa: "Transport i Montaż",
            items: [
              { id: 3, nazwa: "Montaż 10os x 4dni", typ: "R", jedn: "kpl", ilosc: 1, koszt: 40000, marza: 0, cenaKl: 40000 },
              { id: 4, nazwa: "Transport TIR", typ: "P", jedn: "kpl", ilosc: 1, koszt: 9400, marza: 0, cenaKl: 9400 }
            ]
          }
        ]
      }
    ]
  };

  // Bezpieczna inicjalizacja stanu
  const [kosztorys, setKosztorys] = useState(szablonKosztorysu);

  // Synchronizacja stanu, gdy dane spłyną z Firebase
  useEffect(() => {
    if (koszty && koszty.length > 0 && koszty[0].strefy) {
      setKosztorys(koszty[0]);
    }
  }, [koszty]);

  // --- FUNKCJE POMOCNICZE DO TRADERSKICH KALKULACJI ---
  const pobierzCeneKlienta = (item) => {
    if (!item) return 0;
    if (item.typ === "M") return (item.koszt || 0) * (1 + (item.marza || 0) / 100);
    return item.cenaKl || 0;
  };

  const pobierzWartoscItemu = (item) => (item.ilosc || 0) * pobierzCeneKlienta(item);
  const pobierzKosztWlasnyItemu = (item) => (item.ilosc || 0) * (item.koszt || 0);

  const sumKatK = (k) => k && k.items ? k.items.reduce((s, i) => s + pobierzWartoscItemu(i), 0) : 0;
  const sumStrefaK = (s) => s && s.kategorie ? s.kategorie.reduce((t, k) => t + sumKatK(k), 0) : 0;
  
  const sumStrefaKoszt = (s) =>
    s && s.kategorie ? s.kategorie.reduce(
      (t, k) => t + (k.items ? k.items.reduce((s2, i) => s2 + pobierzKosztWlasnyItemu(i), 0) : 0),
      0
    ) : 0;

  // Zabezpieczenie pętli renderujących przed brakiem struktury stref
  const strefyBezpieczne = kosztorys.strefy || [];

  const totalK = strefyBezpieczne.reduce((t, s) => t + sumStrefaK(s), 0);
  const totalKost = strefyBezpieczne.reduce((t, s) => t + sumStrefaKoszt(s), 0);
  const totalZysk = totalK - totalKost;
  const efektywnaMarza = totalKost > 0 ? ((totalZysk / totalKost) * 100).toFixed(1) : "0";

  // --- AKCJE EDYCJI INTERFEJSU (STATE MUTATIONS) ---
  const updateItem = (strefaIdx, katIdx, itemIdx, field, value) => {
    const updatedStrefy = [...strefyBezpieczne];
    const item = updatedStrefy[strefaIdx].kategorie[katIdx].items[itemIdx];
    item[field] = value;

    if (item.typ === "M" && (field === "koszt" || field === "marza")) {
      item.cenaKl = item.koszt * (1 + item.marza / 100);
    }

    setKosztorys({ ...kosztorys, strefy: updatedStrefy });
  };

  const toggleTyp = (strefaIdx, katIdx, itemIdx) => {
    const types = ["M", "R", "P"];
    const updatedStrefy = [...strefyBezpieczne];
    const item = updatedStrefy[strefaIdx].kategorie[katIdx].items[itemIdx];
    item.typ = types[(types.indexOf(item.typ) + 1) % 3];
    setKosztorys({ ...kosztorys, strefy: updatedStrefy });
  };

  const applyGlobalMarza = (strefaIdx) => {
    const updatedStrefy = [...strefyBezpieczne];
    const strefa = updatedStrefy[strefaIdx];
    strefa.kategorie.forEach((k) => {
      k.items.forEach((i) => {
        if (i.typ === "M") {
          i.marza = strefa.globalMarza;
          i.cenaKl = i.koszt * (1 + i.marza / 100);
        }
      });
    });
    setKosztorys({ ...kosztorys, strefy: updatedStrefy });
  };

  const dodajPozycje = (strefaIdx, katIdx) => {
    const updatedStrefy = [...strefyBezpieczne];
    updatedStrefy[strefaIdx].kategorie[katIdx].items.push({
      id: Date.now(),
      nazwa: "Nowy element",
      typ: "M",
      jedn: "szt",
      ilosc: 1,
      koszt: 0,
      marza: 50,
      cenaKl: 0
    });
    setKosztorys({ ...kosztorys, strefy: updatedStrefy });
  };

  return (
    <div className="space-y-6 text-[#efefef] animate-fadeIn">
      {/* HEADER Z NAZWĄ KOSZTORYSU */}
      <div className="bg-[#111] border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
            Aktywny dokument wyceny
          </span>
          <input
            type="text"
            value={kosztorys.nazwa || ""}
            onChange={(e) => setKosztorys({ ...kosztorys, nazwa: e.target.value })}
            className="bg-transparent border-none text-base font-black text-white focus:outline-none w-full sm:w-80 mt-0.5"
          />
        </div>
        <div className="flex gap-4 text-[9px] font-bold uppercase text-gray-500">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00e676]" /> [M] Materiał</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#40c4ff]" /> [R] Robocizna</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffd740]" /> [P] Podwykonawca</div>
        </div>
      </div>

      {/* STRUKTURA EDYTORA */}
      <div className="space-y-4">
        {strefyBezpieczne.map((s, si) => (
          <div key={si} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            {/* STREFA HEADER */}
            <div className="p-4 bg-[#161616] border-b border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2.5">
                <span className="text-green-400 font-black text-sm">&rarr;</span>
                <span className="font-black text-sm uppercase tracking-wider text-white">{s.nazwa}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-gray-800/80">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Marża strefy:</label>
                  <input
                    type="number"
                    value={s.globalMarza}
                    onChange={(e) => {
                      const updated = [...strefyBezpieczne];
                      updated[si].globalMarza = parseInt(e.target.value, 10) || 0;
                      setKosztorys({ ...kosztorys, strefy: updated });
                    }}
                    className="w-10 bg-transparent text-center font-bold text-green-400 font-mono outline-none text-xs"
                  />
                  <span className="text-[10px] text-gray-600 font-bold">%</span>
                  <button onClick={() => applyGlobalMarza(si)} className="ml-1 text-[9px] bg-green-500 text-black px-2 py-0.5 rounded font-black hover:bg-green-600 uppercase">
                    Zastosuj
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-green-400">{sumStrefaK(s).toLocaleString()} zł</span>
                </div>
              </div>
            </div>

            {/* KATEGORIE I POZYCJE INSIDE STREFA */}
            <div className="p-4 space-y-6">
              {(s.kategorie || []).map((k, ki) => (
                <div key={ki} className="space-y-2">
                  <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase border-b border-gray-800/40 pb-1 flex justify-between">
                    <span>{k.nazwa}</span>
                    <span className="text-gray-400">Podsuma: {sumKatK(k).toLocaleString()} zł</span>
                  </div>

                  <div className="space-y-1.5">
                    {(k.items || []).map((item, ii) => {
                      const isM = item.typ === "M";
                      return (
                        <div key={item.id || ii} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-[#161616]/40 border border-gray-800/30 p-2 rounded-xl text-xs">
                          <div className="md:col-span-1 flex justify-center">
                            <button
                              onClick={() => toggleTyp(si, ki, ii)}
                              className={`w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-black transition-colors ${
                                item.typ === "M" ? "bg-[#00e676]" : item.typ === "R" ? "bg-[#40c4ff]" : "bg-[#ffd740]"
                              }`}
                            >
                              {item.typ}
                            </button>
                          </div>

                          <div className="md:col-span-3">
                            <input
                              type="text"
                              value={item.nazwa}
                              onChange={(e) => updateItem(si, ki, ii, "nazwa", e.target.value)}
                              className="w-full bg-transparent text-white font-semibold placeholder-gray-700 outline-none"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <select
                              value={item.jedn}
                              onChange={(e) => updateItem(si, ki, ii, "jedn", e.target.value)}
                              className="w-full bg-black/40 border border-gray-800 text-gray-400 p-1 rounded font-medium outline-none text-[11px]"
                            >
                              {["szt", "mb", "m2", "kpl", "godz", "dni"].map((j) => <option key={j} value={j}>{j}</option>)}
                            </select>
                          </div>

                          <div className="md:col-span-1">
                            <input
                              type="number"
                              value={item.ilosc}
                              onChange={(e) => updateItem(si, ki, ii, "ilosc", parseFloat(e.target.value) || 0)}
                              className="w-full bg-black/40 border border-gray-800 text-center text-white p-1 rounded font-mono outline-none"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <input
                              type="number"
                              value={item.koszt}
                              disabled={!isM}
                              onChange={(e) => updateItem(si, ki, ii, "koszt", parseFloat(e.target.value) || 0)}
                              className={`w-full bg-black/40 border border-gray-800 text-center text-white p-1 rounded font-mono outline-none ${!isM ? "opacity-20 select-none" : ""}`}
                            />
                          </div>

                          <div className="md:col-span-1 relative">
                            <input
                              type="number"
                              value={item.marza}
                              disabled={!isM}
                              onChange={(e) => updateItem(si, ki, ii, "marza", parseFloat(e.target.value) || 0)}
                              className={`w-full bg-black/40 border border-gray-800 text-center text-white p-1 rounded font-mono outline-none pr-3 ${!isM ? "opacity-20 select-none" : ""}`}
                            />
                            {isM && <span className="absolute right-1.5 top-1.5 text-[9px] text-gray-600 font-bold">%</span>}
                          </div>

                          <div className="md:col-span-2">
                            <input
                              type="number"
                              value={isM ? pobierzCeneKlienta(item).toFixed(1) : item.cenaKl || 0}
                              disabled={isM}
                              onChange={(e) => updateItem(si, ki, ii, "cenaKl", parseFloat(e.target.value) || 0)}
                              className={`w-full text-right p-1 rounded font-mono font-bold border outline-none ${isM ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-black/40 border-gray-800 text-white"}`}
                            />
                          </div>

                          <div className="md:col-span-2 text-right font-mono font-bold text-white pr-2">
                            {pobierzWartoscItemu(item).toLocaleString()} zł
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1">
                    <button onClick={() => dodajPozycje(si, ki)} className="text-[11px] text-gray-500 hover:text-green-400 font-bold transition flex items-center gap-1">
                      <span>+</span> Dodaj pozycję budżetową
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PODSUMOWANIE FINANSOWE */}
      <div className="bg-[#161616] border border-gray-800 p-5 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 border-r border-gray-800/50 pr-6">
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Zestawienie handlowe (Brutto)</h5>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Wartość Netto:</span>
              <span className="font-mono font-bold text-white">{totalK.toLocaleString()} zł</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Podatek VAT (23%):</span>
              <span className="font-mono text-gray-500">{(totalK * 0.23).toLocaleString()} zł</span>
            </div>
            <div className="flex justify-between text-sm text-gray-200 font-bold pt-2 border-t border-gray-800/40">
              <span>Łącznie Brutto:</span>
              <span className="font-mono text-green-400">{(totalK * 1.23).toLocaleString()} zł</span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kalkulacja rentowności spółki</h5>
            <div className="flex gap-4">
              <div className="bg-black/20 border border-gray-800/60 p-3 rounded-xl flex-1">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Koszt produkcji</span>
                <span className="text-sm font-mono font-bold text-orange-400">{totalKost.toLocaleString()} zł</span>
              </div>
              <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex-1">
                <span className="text-[9px] text-green-500/60 font-bold uppercase tracking-wider block mb-0.5">Zysk na czysto</span>
                <span className="text-sm font-mono font-bold text-green-400">{totalZysk.toLocaleString()} zł</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-black/40 border border-gray-800/40 px-4 py-2 rounded-xl text-xs">
              <span className="text-gray-400 font-semibold">Wypracowana Marża Efektywna:</span>
              <span className="text-sm font-mono font-black text-yellow-400">{efektywnaMarza}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
