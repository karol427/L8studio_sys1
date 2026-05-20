import React, { useState } from "react";

export default function EventPlanner({ projekty, setProjekty }) {
  // Bazowa data kalendarza (ustawiona domyślnie na maj 2026, zgodnie z Twoimi danymi)
  const [calDate, setCalDate] = useState(new Date(2026, 4, 1)); // 4 = Maj

  const MONTHS = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];
  const DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  const y = calDate.getFullYear();
  const mon = calDate.getMonth();
  const daysInMonth = new Date(y, mon + 1, 0).getDate();
  const firstDow = (new Date(y, mon, 1).getDay() + 6) % 7; // Konwersja na start od Poniedziałku

  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const ds = (d) => `${y}-${pad(mon + 1)}-${pad(d)}`;

  // Kolory faz dla każdego projektu (Pobrane z Twojej bazy kolorów V1)
  const getProjColors = (pid) => {
    const p = projekty.find((x) => x.id === pid);
    const colors = [
      {
        base: "#00e676",
        montaz: "#ffd740",
        event: "#00e676",
        demontaz: "#ff6d00",
      },
      {
        base: "#2979ff",
        montaz: "#40c4ff",
        event: "#2979ff",
        demontaz: "#7c4dff",
      },
      {
        base: "#ff1744",
        montaz: "#ffd740",
        event: "#ff1744",
        demontaz: "#ff6d00",
      },
    ];
    return colors[pid % colors.length] || colors[0];
  };

  // Przygotowanie ciągłych faz dla projektów
  const allPhases = [];
  projekty.forEach((p) => {
    const cols = getProjColors(p.id);
    const fullStart = p.montaz_start || p.event_start;
    const fullEnd = p.demontaz_end || p.event_end || p.montaz_end || fullStart;

    if (!fullStart) return;

    allPhases.push({
      pid: p.id,
      label: p.nazwa,
      start: fullStart,
      end: fullEnd,
      segs: [
        {
          start: p.montaz_start,
          end: p.montaz_end || p.montaz_start,
          color: cols.montaz,
        },
        {
          start: p.event_start,
          end: p.event_end || p.event_start,
          color: cols.event,
        },
        {
          start: p.demontaz_start,
          end: p.demontaz_end || p.demontaz_start,
          color: cols.demontaz,
        },
      ].filter((s) => s.start),
      color: cols.event,
    });
  });

  // Generowanie struktury tygodni
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const numWeeks = totalCells / 7;
  const weeksRows = [];

  for (let week = 0; week < numWeeks; week++) {
    const weekDays = [];
    for (let col = 0; col < 7; col++) {
      const d = week * 7 + col - firstDow + 1;
      weekDays.push(d >= 1 && d <= daysInMonth ? d : null);
    }

    let wFirst = -1,
      wLast = -1;
    for (let col = 0; col < 7; col++) {
      if (weekDays[col] !== null) {
        if (wFirst < 0) wFirst = weekDays[col];
        wLast = weekDays[col];
      }
    }

    if (wFirst < 0) continue;

    const segs = [];
    allPhases.forEach((ph) => {
      const mStart = `${y}-${pad(mon + 1)}-01`;
      const mEnd = ds(daysInMonth);
      const s = ph.start < mStart ? mStart : ph.start;
      const e = ph.end > mEnd ? mEnd : ph.end;
      const d1 = parseInt(s.split("-")[2], 10);
      const d2 = parseInt(e.split("-")[2], 10);

      if (d1 > wLast || d2 < wFirst) return;

      const sd1 = Math.max(d1, wFirst);
      const sd2 = Math.min(d2, wLast);

      let c1 = -1,
        c2 = -1;
      for (let ci = 0; ci < 7; ci++) {
        if (weekDays[ci] === sd1) c1 = ci;
        if (weekDays[ci] === sd2) c2 = ci;
      }

      if (c1 < 0 || c2 < 0) return;

      segs.push({
        ph,
        c1,
        c2,
        contL: d1 < wFirst,
        contR: d2 > wLast,
        lane: 0,
      });
    });

    segs.sort((a, b) => a.c1 - b.c1);
    const laneArr = [];
    segs.forEach((seg) => {
      let laneIdx = -1;
      for (let li = 0; li < laneArr.length; li++) {
        let free = true;
        laneArr[li].forEach((other) => {
          if (seg.c1 <= other.c2 && seg.c2 >= other.c1) free = false;
        });
        if (free) {
          laneIdx = li;
          break;
        }
      }
      if (laneIdx < 0) {
        laneIdx = laneArr.length;
        laneArr.push([]);
      }
      laneArr[laneIdx].push(seg);
      seg.lane = laneIdx;
    });

    weeksRows.push({ weekDays, segs, numLanes: Math.max(1, laneArr.length) });
  }

  return (
    <div className="space-y-4 bg-[#0d0d0d] border border-gray-800 p-4 rounded-xl shadow-2xl">
      {/* NAWIGACJA KALENDARZA */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setCalDate(new Date(y, mon - 1, 1))}
            className="px-2 py-1 bg-[#161616] border border-gray-800 rounded text-xs font-bold hover:bg-[#222]"
          >
            &larr;
          </button>
          <button
            onClick={() => setCalDate(new Date(y, mon + 1, 1))}
            className="px-2 py-1 bg-[#161616] border border-gray-800 rounded text-xs font-bold hover:bg-[#222]"
          >
            &rarr;
          </button>
        </div>
        <h3 className="text-sm font-black tracking-wider uppercase text-white">
          {MONTHS[mon]} {y}
        </h3>
        <button
          onClick={() => setCalDate(new Date(2026, 4, 1))}
          className="px-3 py-1 bg-[#161616] border border-gray-800 rounded text-xs font-medium text-gray-400"
        >
          Reset
        </button>
      </div>

      {/* SIATKA KALENDARZA W STYLU GOOGLE CALENDAR */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-black/40">
        {/* DNI TYGODNIA NAGŁÓWEK */}
        <div className="grid grid-cols-7 text-center bg-[#111] border-b border-gray-800 text-[10px] font-bold tracking-wider text-gray-500 py-2">
          {DAYS.map((d, i) => (
            <span key={i} className={i >= 5 ? "text-green-500/80" : ""}>
              {d}
            </span>
          ))}
        </div>

        {/* TYGODNIE */}
        {weeksRows.map((w, wi) => {
          const rowH = 32 + w.numLanes * 25 + 6;
          return (
            <div
              key={wi}
              className="relative grid grid-cols-7 border-b border-gray-800/60"
              style={{ minHeight: `${rowH}px` }}
            >
              {/* TŁO KOMÓREK DNI */}
              {w.weekDays.map((day, di) => (
                <div
                  key={di}
                  className={`p-1.5 border-r border-gray-800/40 min-h-full flex flex-col justify-start items-start ${
                    di >= 5 ? "bg-green-500/[0.01]" : ""
                  }`}
                >
                  {day && (
                    <span
                      className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        day === 20 && mon === 4
                          ? "bg-green-500 text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </div>
              ))}

              {/* CIĄGŁE PASY WYDARZEŃ (GOOGLE STYLE) */}
              {w.segs.map((seg, si) => {
                const top = 30 + seg.lane * 25;
                const leftPct = (seg.c1 * 100) / 7;
                const wPct = ((seg.c2 - seg.c1 + 1) * 100) / 7;

                // Generowanie płynnego gradientu faz dla paska w danym tygodniu
                const dayColors = [];
                for (
                  let dd = Math.max(
                    parseInt(seg.ph.start.split("-")[2], 10),
                    1 + wi * 7
                  );
                  dd <=
                  Math.min(
                    parseInt(seg.ph.end.split("-")[2], 10),
                    (wi + 1) * 7
                  );
                  dd++
                ) {
                  const dayStr = `${y}-${pad(mon + 1)}-${pad(dd)}`;
                  let c = seg.ph.color;
                  for (let i = 0; i < seg.ph.segs.length; i++) {
                    if (
                      dayStr >= seg.ph.segs[i].start &&
                      dayStr <= seg.ph.segs[i].end
                    ) {
                      c = seg.ph.segs[i].color;
                      break;
                    }
                  }
                  dayColors.push(c);
                }

                let backgroundStyle = seg.ph.color;
                if (dayColors.length > 0) {
                  let gradStr = "linear-gradient(to right";
                  let step = 100 / dayColors.length;
                  dayColors.forEach((col, idx) => {
                    gradStr += `, ${col} ${idx * step}%, ${col} ${
                      (idx + 1) * step
                    }%`;
                  });
                  gradStr += ")";
                  backgroundStyle = gradStr;
                }

                return (
                  <div
                    key={si}
                    className="absolute h-5 flex items-center text-[10px] font-bold text-black px-2 overflow-hidden shadow-md select-none rounded-sm transition-opacity hover:opacity-90"
                    style={{
                      top: `${top}px`,
                      left: `calc(${leftPct}% + ${seg.contL ? 0 : 2}px)`,
                      width: `calc(${wPct}% - ${seg.contL ? 2 : 4}px)`,
                      background: backgroundStyle,
                      borderRadius: `${seg.contL ? "0" : "4px"} ${
                        seg.contR ? "0" : "4px"
                      } ${seg.contR ? "0" : "4px"} ${seg.contL ? "0" : "4px"}`,
                    }}
                  >
                    <span className="truncate text-black drop-shadow-sm">
                      {seg.contL ? "← " : ""}
                      {seg.ph.label}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* LEGENDA FAZ */}
      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 pt-2 border-t border-gray-800/40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ffd740]" /> Montaż
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00e676]" /> Event / Show
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ff6d00]" /> Demontaż
        </div>
      </div>
    </div>
  );
}
