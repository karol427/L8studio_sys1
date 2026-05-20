import React, { useState } from "react";

export default function TeamManager() {
  const [currentTab, setCurrentTab] = useState("pracownicy");
  const [szukajFrazy, setSzukajFrazy] = useState("");
  const [filtrDzial, setFiltrDzial] = useState("");
  const [filtrTyp, setFiltrTyp] = useState("");

  // --- ORYGINALNE BAZY DANYCH Z TWOJEGO PLIKU INDEX.HTML ---
  const [pracownicy, setPracownicy] = useState([
    { id: 1, imie: "Tomasz", nazwisko: "Kowalski", rola: "Kierownik Produkcji", stawka: 900, dzial: "Zarzadzanie", umiejetnosci: ["Zarzadzanie projektem", "Koordynacja"], typ: "etat", kolor: "#00e676", tel: "+48 601 100 200", email: "t.kowalski@l8studio.pl", miasto: "Wroclaw" },
    { id: 2, imie: "Anna", nazwisko: "Nowak", rola: "Technik Scenografii", stawka: 650, dzial: "Scenografia", umiejetnosci: ["Montaz scenografii", "Projektowanie"], typ: "etat", kolor: "#40c4ff", tel: "+48 602 200 300", email: "a.nowak@l8studio.pl", miasto: "Wroclaw" },
    { id: 3, imie: "Piotr", nazwisko: "Wisniewski", rola: "Ciesla / Stolarz", stawka: 600, dzial: "Stolarnia", umiejetnosci: ["Stolarstwo", "Montaz MDF"], typ: "etat", kolor: "#cd7f32", tel: "+48 603 300 400", email: "p.wisniewski@l8studio.pl", miasto: "Brzeg Dolny" },
    { id: 4, imie: "Marek", nazwisko: "Zielinski", rola: "Elektryk", stawka: 700, dzial: "Elektryka", umiejetnosci: ["Instalacje elektryczne", "LED"], typ: "etat", kolor: "#ffd740", tel: "+48 604 400 500", email: "m.zielinski@l8studio.pl", miasto: "Wroclaw" },
    { id: 5, imie: "Jakub", nazwisko: "Lewandowski", rola: "Pracownik Fizyczny", stawka: 450, dzial: "Montaz", umiejetnosci: ["Montaz", "Pakowanie"], typ: "freelancer", kolor: "#888", tel: "+48 605 500 600", email: "j.lewandowski@gmail.com", miasto: "Warszawa" }
  ]);

  const [kontrahenci, setKontrahenci] = useState([
    { id: 1, firma: "ING Bank Slaski", osoba: "Anna Nowak", tel: "+48 600 111 222", email: "anna@ing.pl", nip: "1080004793", miasto: "Katowice", typ: "klient" },
    { id: 2, firma: "Orange Polska", osoba: "Piotr Wisniewski", tel: "+48 500 333 444", email: "p.w@orange.pl", nip: "5272617105", miasto: "Warszawa", typ: "klient" }
  ]);

  const [rozliczenia, setRozliczenia] = useState([
    { id: 1, osobaId: 1, projekt: "Gala Fintech Warsaw", faza: "montaz", dni: 4, stawka: 900, status: "zatwierdzone", data: "2026-05-20" },
    { id: 2, osobaId: 1, projekt: "Gala Fintech Warsaw", faza: "demontaz", dni: 1, stawka: 900, status: "oczekuje", data: "2026-05-26" },
    { id: 3, osobaId: 2, projekt: "Gala Fintech Warsaw", faza: "montaz", dni: 4, stawka: 650, status: "oczekuje", data: "2026-05-20" }
  ]);

  const [urlopy, setUrlopy] = useState([
    { id: 1, osobaId: 5, od: "2026-06-20", do: "2026-06-27", powod: "Urlop wypoczynkowy", status: "oczekuje" }
  ]);

  // --- FILTROWANIE PRACOWNIKÓW ---
  const filtrowaniPracownicy = pracownicy.filter((b) => {
    const dopasowanieSlowa = (b.imie + " " + b.nazwisko + " " + b.rola).toLowerCase().includes(szukajFrazy.toLowerCase());
    const dopasowanieDzialu = !filtrDzial || b.dzial === filtrDzial;
    const dopasowanieTypu = !filtrTyp || b.typ === filtrTyp;
    return dopasowanieSlowa && dopasowanieDzialu && dopasowanieTypu;
  });

  // --- FILTROWANIE KONTRAHENTÓW ---
  const filtrowaniKontrahenci = kontrahenci.filter((k) => 
    k.firma.toLowerCase().includes(szukajFrazy.toLowerCase()) || (k.miasto && k.miasto.toLowerCase().includes(szukajFrazy.toLowerCase()))
  );

  // --- METODY OBSŁUGI ROZLICZEŃ ---
  const zmienStatusRozliczenia = (id, nowyStatus) => {
    setRozliczenia(rozliczenia.map(r => r.id === id ? { ...r, status: nowyStatus } : r));
  };

  const zmienStatusUrlopu = (id, nowyStatus) => {
    setUrlopy(urlopy.map(u => u.id === id ? { ...u, status: nowyStatus } : u));
  };

  return (
    <div className="space-y-6 text-[#efefef] animate-fadeIn">
      
      {/* SEKCJA NAWIGACJI ZAKŁADEK (DOKŁADNIE JAK W ORYGINALE) */}
      <div className="flex border-b border-gray-800 text-sm font-bold uppercase tracking-wider">
        {[
          { id: "pracownicy", label: "Pracownicy" },
          { id: "kontrahenci", label: "Kontrahenci" },
          { id: "rozliczenia", label: "Rozliczenia & Urlopy" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setCurrentTab(t.id); setSzukajFrazy(""); }}
            className={`px-6 py-3 border-b-2 transition-all ${currentTab === t.id ? "border-green-500 text-green-400 font-extrabold" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. ZAKŁADKA: PRACOWNICY */}
      {currentTab === "pracownicy" && (
        <div className="space-y-4">
          
          {/* PASEK FILTRÓW (ROZBUDOWANY) */}
          <div className="flex flex-wrap gap-3 bg-[#111] border border-gray-800 p-3 rounded-xl">
            <input 
              type="text" 
              placeholder="Szukaj pracownika..." 
              value={szukajFrazy}
              onChange={(e) => setSzukajFrazy(e.target.value)}
              className="flex-1 bg-[#161616] border border-gray-800 rounded-lg p-2 text-xs focus:border-green-500 outline-none text-white min-w-[150px]"
            />
            <select 
              value={filtrDzial} 
              onChange={(e) => setFiltrDzial(e.target.value)}
              className="bg-[#161616] border border-gray-800 rounded-lg p-2 text-xs text-gray-400 outline-none"
            >
              <option value="">Wszystkie działy</option>
              <option value="Zarzadzanie">Zarządzanie</option>
              <option value="Scenografia">Scenografia</option>
              <option value="Stolarnia">Stolarnia</option>
              <option value="Elektryka">Elektryka</option>
              <option value="Montaz">Montaż</option>
            </select>
            <select 
              value={filtrTyp} 
              onChange={(e) => setFiltrTyp(e.target.value)}
              className="bg-[#161616] border border-gray-800 rounded-lg p-2 text-xs text-gray-400 outline-none"
            >
              <option value="">Wszyscy</option>
              <option value="etat">Etat</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>

          {/* TABELA PRACOWNIKÓW */}
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#161616] text-[10px] text-gray-500 uppercase border-b border-gray-800">
                    <th className="p-3">Pracownik</th>
                    <th className="p-3">Dział / Umowa</th>
                    <th className="p-3">Lokalizacja</th>
                    <th className="p-3 text-right">Stawka bazowa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-400">
                  {filtrowaniPracownicy.map(b => (
                    <tr key={b.id} className="hover:bg-black/20 transition">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: b.kolor + "22", color: b.kolor, border: `1px solid ${b.kolor}44` }}>
                          {b.imie[0]}{b.nazwisko[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{b.imie} {b.nazwisko}</div>
                          <div className="text-[10px] text-gray-500">{b.rola}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-300 font-semibold">{b.dzial}</div>
                        <div className={`text-[9px] uppercase font-bold tracking-wider ${b.typ === "etat" ? "text-green-400" : "text-amber-400"}`}>{b.typ}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-300">{b.miasto}</div>
                        <div className="text-[10px] text-gray-600">{b.tel}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white text-sm">
                        {b.stawka} zł<span className="text-[10px] text-gray-600 font-sans block font-normal">/dzień</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ZAKŁADKA: KONTRAHENCI */}
      {currentTab === "kontrahenci" && (
        <div className="space-y-4">
          <div className="bg-[#111] border border-gray-800 p-3 rounded-xl">
            <input 
              type="text" 
              placeholder="Szukaj kontrahenta (nazwa, miasto)..." 
              value={szukajFrazy}
              onChange={(e) => setSzukajFrazy(e.target.value)}
              className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2 text-xs focus:border-green-500 outline-none text-white"
            />
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-[10px] text-gray-500 uppercase border-b border-gray-800">
                  <th className="p-3">Firma</th>
                  <th className="p-3">Osoba kontaktowa</th>
                  <th className="p-3">Dane rejestrowe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-gray-400">
                {filtrowaniKontrahenci.map(k => (
                  <tr key={k.id} className="hover:bg-black/20 transition">
                    <td className="p-3">
                      <div className="font-bold text-white text-sm">{k.firma}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{k.typ}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-300 font-medium">{k.osoba}</div>
                      <div className="text-[10px] text-gray-600">{k.tel} • {k.email}</div>
                    </td>
                    <td className="p-3 font-mono text-gray-300">
                      <div>NIP: {k.nip}</div>
                      <div className="text-xs font-sans text-gray-500">{k.miasto}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ZAKŁADKA: ROZLICZENIA & URLOPY */}
      {currentTab === "rozliczenia" && (
        <div className="space-y-6">
          
          {/* SEKRETARE: WNIOSKI URLOPOWE */}
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 bg-black/10 border-b border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Wnioski Urlopowe i Nieobecności</h4>
            </div>
            <div className="p-2 space-y-1.5">
              {urlopy.map(u => {
                const os = pracownicy.find(p => p.id === u.osobaId);
                return (
                  <div key={u.id} className="flex items-center justify-between bg-[#161616]/60 border border-gray-800/40 p-3 rounded-lg text-xs">
                    <div>
                      <div className="font-bold text-white">{os ? `${os.imie} ${os.nazwisko}` : "Nieznany"}</div>
                      <div className="text-gray-500 font-medium mt-0.5">{u.od} do {u.do} <span className="text-gray-700 px-1">•</span> {u.powod}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === "zatwierdzone" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        {u.status}
                      </span>
                      {u.status === "oczekuje" && (
                        <button 
                          onClick={() => zmienStatusUrlopu(u.id, "zatwierdzone")}
                          className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded text-[10px] font-black uppercase"
                        >
                          Zatwierdź
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ODPRAWY OSOBODNI (DNIÓWKI) */}
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 bg-black/10 border-b border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Rozliczenia Projektowe (Karta Pracy)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#161616] text-[10px] text-gray-500 uppercase border-b border-gray-800">
                    <th className="p-3">Pracownik</th>
                    <th className="p-3">Projekt / Faza</th>
                    <th className="p-3 text-center">Dni</th>
                    <th className="p-3 text-right">Stawka</th>
                    <th className="p-3 text-right">Do wypłaty</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-400">
                  {rozliczenia.map(r => {
                    const os = pracownicy.find(p => p.id === r.osobaId);
                    const suma = r.dni * r.stawka;
                    return (
                      <tr key={r.id} className="hover:bg-black/20 transition">
                        <td className="p-3 font-bold text-white">
                          {os ? `${os.imie} ${os.nazwisko}` : "---"}
                        </td>
                        <td className="p-3">
                          <div className="text-gray-300 font-semibold">{r.projekt}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono">{r.faza} ({r.data})</div>
                        </td>
                        <td className="p-3 text-center font-bold text-white">{r.dni}</td>
                        <td className="p-3 text-right font-mono">{r.stawka} zł</td>
                        <td className="p-3 text-right font-mono font-bold text-green-400">{suma} zł</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === "wyplacone" ? "bg-green-500/10 text-green-400" : r.status === "zatwierdzone" ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {r.status === "oczekuje" && (
                            <button 
                              onClick={() => zmienStatusRozliczenia(r.id, "zatwierdzone")}
                              className="bg-[#161616] border border-gray-800 hover:border-gray-700 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase"
                            >
                              Zatwierdź
                            </button>
                          )}
                          {r.status === "zatwierdzone" && (
                            <button 
                              onClick={() => zmienStatusRozliczenia(r.id, "wyplacone")}
                              className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded text-[10px] font-black uppercase"
                            >
                              Wypłać
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
