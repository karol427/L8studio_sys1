import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// IMPORT TWOICH MODUŁÓW
import EventPlanner from "./EventPlanner";
import KosztorysEditor from "./KosztorysEditor";
import TeamManager from "./TeamManager";
import FinanseManager from "./FinanseManager";

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_q8pNfk5V07h1rjr_YOCuA3gtMAlBGC8",
  authDomain: "l8studio-a8c9b.firebaseapp.com",
  projectId: "l8studio-a8c9b",
  storageBucket: "l8studio-a8c9b.firebasestorage.app",
  messagingSenderId: "931163979071",
  appId: "1:931163979071:web:7c4eccc9e726312815678a",
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  const [projekty, setProjekty] = useState([]);
  const [faktury, setFaktury] = useState([]);
  const [koszty, setKoszty] = useState([]);

  useEffect(() => {
    async function loadDataFromCloud() {
      try {
        setLoading(true);
        const snapProj = await getDocs(collection(db, "projekty"));
        const snapFak = await getDocs(collection(db, "finanse_faktury"));
        const snapKosz = await getDocs(collection(db, "finanse_koszty"));

        const projList = [];
        snapProj.forEach((d) => projList.push({ id: d.id, ...d.data() }));

        const fakList = [];
        snapFak.forEach((d) => fakList.push({ id: d.id, ...d.data() }));

        const koszList = [];
        snapKosz.forEach((d) => koszList.push({ id: d.id, ...d.data() }));

        setProjekty(projList);
        setFaktury(fakList);
        setKoszty(koszList);
      } catch (e) {
        console.error("Błąd ładowania danych chmury:", e);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 7000); // Wolny rozbłysk logo 7s
      }
    }
    loadDataFromCloud();
  }, []);

  const sumaPrzychody = faktury.reduce((sum, f) => sum + (f.kwota || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute w-[350px] h-[350px] bg-green-500/5 rounded-full blur-[90px] animate-[slowPulse_5s_infinite_ease-in-out]" />
        <div className="flex flex-col items-center z-10 text-center space-y-7">
          <img
            src="/logo1.png"
            alt="L8 Studio Logo"
            className="w-32 h-32 object-contain relative transition-all"
            style={{ animation: "slowGlow 3.5s infinite ease-in-out" }}
          />
          <div className="space-y-3 animate-pulse [animation-duration:3s]">
            <h1 className="text-3xl font-black tracking-[0.35em] text-white uppercase">
              L8 STUDIO
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-6 bg-gray-800" />
              <p className="text-[10px] tracking-[0.25em] text-green-400 font-bold uppercase">
                Event Management v 1.0
              </p>
              <span className="h-[1px] w-6 bg-gray-800" />
            </div>
          </div>
          <div className="pt-2 flex flex-col items-center gap-2">
            <div className="w-40 h-[2px] bg-gray-950 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                style={{ animation: "progressBar 7s linear forwards" }}
              />
            </div>
            <span className="text-[8px] tracking-[0.3em] text-gray-600 font-mono uppercase font-bold">
              Inicjalizacja systemu...
            </span>
          </div>
        </div>
        <style>{`
          @keyframes slowGlow {
            0% { filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.15)); transform: scale(0.98); }
            50% { filter: drop-shadow(0 0 35px rgba(0, 255, 0, 0.55)); transform: scale(1.02); }
            100% { filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.15)); transform: scale(0.98); }
          }
          @keyframes slowPulse { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
          @keyframes progressBar { 0% { width: 0%; } 100% { width: 100%; } }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-6 transition-colors duration-200 ${
        isDarkMode
          ? "bg-[#090909] text-[#efefef]"
          : "bg-[#f0f2f5] text-[#1a1a1a]"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* TOPBAR */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          {currentView !== "home" ? (
            <button
              onClick={() => setCurrentView("home")}
              className="px-3 py-1 rounded border border-green-500 bg-green-500/10 text-green-400 font-bold text-xs"
            >
              &larr; HOME
            </button>
          ) : (
            <div className="w-16" />
          )}
          <div className="flex items-center gap-2">
            <img
              src="/logo1.png"
              alt="L8 Logo"
              className="w-5 h-5 object-contain"
            />
            <h2 className="text-xs tracking-[0.2em] font-bold text-gray-500 uppercase">
              L8 STUDIO
            </h2>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-800 text-sm"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* EKRAN GŁÓWNY (HOME) */}
        {currentView === "home" && (
          <div className="py-6">
            <div className="text-center mb-8 flex flex-col items-center">
              <img
                src="/logo1.png"
                alt="L8 Studio"
                className="w-28 h-28 mb-4 object-contain drop-shadow-[0_0_20px_rgba(0,255,0,0.15)]"
              />
              <h1
                className={`text-2xl font-black tracking-widest uppercase ${
                  isDarkMode ? "text-white" : "text-[#1a1a1a]"
                }`}
              >
                L8 Studio
              </h1>
              <p
                className={`text-[10px] tracking-wider uppercase font-bold mt-1 ${
                  isDarkMode ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Event Management System
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "events",
                  name: "Event Planner",
                  desc: "Kalendarz montaży i wydarzeń",
                  label: `${projekty.length} projektów`,
                },
                {
                  id: "kadry",
                  name: "Zespół L8",
                  desc: "Pracownicy, kontrahenci i rozliczenia",
                  label: "Kadry",
                },
                {
                  id: "kosztorysy",
                  name: "Kosztorysy",
                  desc: "Wyceny z marżą i strefami",
                  label: "Kalkulator V2",
                },
                {
                  id: "finanse",
                  name: "Finanse",
                  desc: "Monitor płatności i wyniki spółki",
                  label: `${sumaPrzychody.toLocaleString()} zł`,
                  highlight: true,
                },
              ].map((tile) => (
                <div
                  key={tile.id}
                  onClick={() => setCurrentView(tile.id)}
                  className={`border rounded-xl p-4 cursor-pointer hover:border-green-500 transition duration-200 flex flex-col justify-between min-h-[110px] ${
                    isDarkMode
                      ? "bg-[#111] border-gray-800"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div>
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDarkMode ? "text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      {tile.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {tile.desc}
                    </p>
                  </div>
                  <div
                    className={`flex items-center justify-between pt-2 mt-2 border-t ${
                      isDarkMode ? "border-gray-800/40" : "border-gray-100"
                    }`}
                  >
                    <span className="text-xs text-gray-400">&rarr;</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        tile.highlight
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}
                    >
                      {tile.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PODPIĘCIA WIDOKÓW */}
        {currentView === "events" && (
          <EventPlanner db={db} projekty={projekty} />
        )}
        {currentView === "kadry" && <TeamManager db={db} />}

        {/* ZMIANA NAPRAWIAJĄCA: koszty={koszty} przekazuje poprawną zmienną live */}
        {currentView === "kosztorysy" && <KosztorysEditor koszty={koszty} />}

        {currentView === "finanse" && (
          <FinanseManager
            faktury={faktury}
            koszty={koszty}
            setFaktury={setFaktury}
            setKoszty={setKoszty}
          />
        )}
      </div>
    </div>
  );
}
