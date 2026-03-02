import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { API_BASE_URL } from '../constants/config';

const AQI_SCALE = [
  { label: "Good", max: 50, color: "#00B050", bg: "#00B05015", text: "#004d20" },
  { label: "Satisfactory", max: 100, color: "#92D050", bg: "#92D05015", text: "#3d6600" },
  { label: "Moderate", max: 200, color: "#e6b800", bg: "#e6b80015", text: "#7a6200" },
  { label: "Poor", max: 300, color: "#FF9900", bg: "#FF990015", text: "#b35c00" },
  { label: "Very Poor", max: 400, color: "#FF0000", bg: "#FF000015", text: "#990000" },
  { label: "Severe", max: 9999, color: "#C00000", bg: "#C0000015", text: "#6b0000" },
];

const getLevel = (aqi) => AQI_SCALE.find((l) => aqi <= l.max) || AQI_SCALE[5];

const advice = (aqi) => {
  if (aqi <= 50) return "Good air. Safe for all activities.";
  if (aqi <= 100) return "Satisfactory. Sensitive groups be cautious.";
  if (aqi <= 200) return "Moderate. Reduce prolonged outdoor exposure.";
  if (aqi <= 300) return "Poor. Wear a mask outdoors.";
  if (aqi <= 400) return "Very Poor. Stay indoors; close windows.";
  return "Severe! Health emergency — avoid going outside.";
};

const CITIES = [
  { id: 1, name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { id: 2, name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { id: 3, name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { id: 4, name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { id: 5, name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { id: 6, name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { id: 7, name: "Pune", lat: 18.5204, lon: 73.8567 },
  { id: 8, name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { id: 9, name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { id: 10, name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { id: 11, name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { id: 12, name: "Amritsar", lat: 31.6340, lon: 74.8723 },
  { id: 13, name: "Surat", lat: 21.1702, lon: 72.8311 },
  { id: 14, name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { id: 15, name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { id: 16, name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { id: 17, name: "Indore", lat: 22.7196, lon: 75.8577 },
  { id: 18, name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { id: 19, name: "Patna", lat: 25.5941, lon: 85.1376 },
  { id: 20, name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { id: 21, name: "Agra", lat: 27.1767, lon: 78.0081 },
  { id: 22, name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { id: 23, name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { id: 24, name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { id: 25, name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { id: 26, name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { id: 27, name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { id: 28, name: "Goa", lat: 15.2993, lon: 74.1240 },
  { id: 29, name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { id: 30, name: "Dehradun", lat: 30.3165, lon: 78.0322 },
];

const fetchAQI = async (lat, lon) => {
  const res = await fetch(`${API_BASE_URL}/predict?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const aqi = json.cpcb_aqi;
  const lvl = getLevel(aqi);

  return {
    lat,
    lon,
    aqi,
    label: lvl.label,
    color: lvl.color,
    bg: lvl.bg,
    text: lvl.text,
    ml_aqi: json.ml_aqi,
    pm2_5: json.pollutants?.pm2_5,
    pm10: json.pollutants?.pm10,
    no2: json.pollutants?.no2,
    so2: json.pollutants?.so2,
    co: json.pollutants?.co,
    o3: json.pollutants?.o3,
    no: json.pollutants?.no,
    nh3: json.pollutants?.nh3,
  };
};

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const DetailPanel = ({ data, name, onClose }) => {
  if (!data) return null;

  const pollutants = [
    ["PM2.5", data.pm2_5, "μg/m³", 250, "#e74c3c"],
    ["PM10", data.pm10, "μg/m³", 430, "#e67e22"],
    ["NO₂", data.no2, "μg/m³", 400, "#9b59b6"],
    ["SO₂", data.so2, "μg/m³", 800, "#f39c12"],
    ["CO", data.co, "μg/m³", 34000, "#1abc9c"],
    ["O₃", data.o3, "μg/m³", 180, "#3498db"],
  ];

  return (
    <div
      className="absolute top-3 right-3 w-64 z-[1000] rounded-[18px] overflow-hidden bg-white animate-[slideIn_.25s_ease]"
      style={{
        border: `2px solid ${data.color}`,
        boxShadow: `0 8px 32px ${data.color}44`,
      }}
    >
      <div className="p-3" style={{ background: data.color }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-semibold m-0" style={{ color: "rgba(255,255,255,0.75)" }}>{name}</p>
            <p className="text-[28px] font-black my-1 leading-none text-white">{data.aqi}</p>
            <p className="text-[11px] m-0" style={{ color: "rgba(255,255,255,0.85)" }}>
              {data.label} • CPCB AQI
            </p>
            {data.ml_aqi && (
              <p className="text-[10px] mt-1 m-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                ML Raw: {data.ml_aqi}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full border-none text-white text-base font-black cursor-pointer"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 px-3 pt-2.5">
        {[`${data.lat.toFixed(4)}°N`, `${data.lon.toFixed(4)}°E`].map((v) => (
          <span
            key={v}
            className="flex-1 text-center bg-gray-50 rounded-[10px] py-1 text-[10px] font-mono text-gray-400"
          >
            {v}
          </span>
        ))}
      </div>

      <div className="px-3 py-2.5">
        {pollutants.map(([label, val, unit, max, bar]) => {
          const pct = Math.min(((val || 0) / max) * 100, 100);
          return (
            <div key={label} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-[10px] font-bold text-gray-500">{label}</span>
                <span className="text-[10px] text-gray-400">{(val || 0).toFixed(1)} {unit}</span>
              </div>
              <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: bar }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mx-2.5 mb-2.5 px-2.5 py-2 rounded-[10px] text-[11px] leading-relaxed"
        style={{
          background: data.bg,
          borderLeft: `3px solid ${data.color}`,
          color: data.text,
        }}
      >
        {advice(data.aqi)}
      </div>
    </div>
  );
};

const HeatmapView = ({ lat, lon, locationName }) => {
  const [cities, setCities] = useState([]);
  const [loaded, setLoaded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [clickLoading, setClickLoading] = useState(false);
  const [clickResult, setClickResult] = useState(null);
  const [userAqi, setUserAqi] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const results = [];
      for (let i = 0; i < CITIES.length; i += 5) {
        const batch = CITIES.slice(i, i + 5);
        const settled = await Promise.allSettled(
          batch.map(async (city) => ({ city, data: await fetchAQI(city.lat, city.lon) }))
        );
        settled.forEach((r) => {
          if (r.status === "fulfilled") {
            results.push({ ...r.value.city, ...r.value.data });
            setLoaded((n) => n + 1);
          }
        });
        setCities([...results]);
        if (i + 5 < CITIES.length) await new Promise((r) => setTimeout(r, 300));
      }
      if (results.length === 0) setError("Could not reach backend. Is Backend running?");
      setLoading(false);
    };
    load();
  }, []);

  // Fetch AQI for user's location when lat/lon are available
  useEffect(() => {
    if (!lat || !lon) return;
    fetchAQI(parseFloat(lat), parseFloat(lon))
      .then((data) => setUserAqi(data))
      .catch(() => setUserAqi(null));
  }, [lat, lon]);

  const handleClick = async (clickLat, clickLon) => {
    setSelected(null);
    setClickLoading(true);
    setClickResult(null);
    try {
      const data = await fetchAQI(clickLat, clickLon);
      setClickResult(data);
      setSelected({ data, name: `${clickLat.toFixed(3)}°N, ${clickLon.toFixed(3)}°E` });
    } catch {
      setClickResult(null);
    }
    setClickLoading(false);
  };

  const avg = cities.length ? Math.round(cities.reduce((s, c) => s + c.aqi, 0) / cities.length) : null;
  const worst = cities.length ? cities.reduce((a, b) => b.aqi > a.aqi ? b : a) : null;
  const best = cities.length ? cities.reduce((a, b) => b.aqi < a.aqi ? b : a) : null;
  const avgLvl = avg != null ? getLevel(avg) : null;

  if (loading && cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
        <p className="font-bold text-slate-600">Fetching AQI from ML model for {CITIES.length} cities…</p>
        <div className="w-60 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-[width] duration-300 rounded-full"
            style={{ width: `${(loaded / CITIES.length) * 100}%` }}
          />
        </div>
        <p className="text-slate-400 text-[13px]">{loaded} / {CITIES.length}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-500 font-bold">{error}</p>
        <p className="text-slate-400 text-[13px] mt-2">
          Make sure your Backend backend is running at {API_BASE_URL}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:none; } }
      `}</style>

      {/* Summary Cards */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "National Avg", value: avg ?? "–", sub: avgLvl?.label, color: avgLvl?.color },
          { label: "Cities", value: cities.length, sub: loading ? `${loaded}/${CITIES.length} loading…` : "ML Powered" },
          { label: "Most Polluted", value: worst ? Math.round(worst.aqi) : "–", sub: worst?.name, color: worst ? getLevel(worst.aqi).color : undefined },
          { label: "Cleanest Air", value: best ? Math.round(best.aqi) : "–", sub: best?.name, color: best ? getLevel(best.aqi).color : undefined },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-[1_1_120px] bg-white rounded-2xl px-4 py-3"
            style={{
              border: `2px solid ${s.color || "#e5e7eb"}`,
              boxShadow: s.color ? `0 2px 12px ${s.color}22` : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest m-0">{s.label}</p>
            <p
              className="text-[28px] font-black my-1 mb-0.5 leading-none"
              style={{ color: s.color || "#1f2937" }}
            >
              {s.value}
            </p>
            <p className="text-[11px] text-gray-400 m-0">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <MapContainer center={[22.5, 82.0]} zoom={5} style={{ height: 540 }} zoomControl>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleClick} />

          {lat && lon && (
            <CircleMarker
              center={[parseFloat(lat), parseFloat(lon)]}
              radius={9}
              pathOptions={{ color: "#1e40af", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}
            >
              <Popup><b>Your Location</b></Popup>
            </CircleMarker>
          )}

          {cities.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lon]}
              radius={13}
              pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.7, weight: 2 }}
              eventHandlers={{ click: () => setSelected({ data: c, name: c.name }) }}
            >
              <Popup>
                <div className="min-w-[140px]">
                  <p className="text-[22px] font-black mb-0.5 mt-0" style={{ color: c.color }}>{c.aqi}</p>
                  <p className="text-xs text-gray-500 mt-0 mb-1.5">{c.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0 mb-1.5">
                    PM2.5: {c.pm2_5?.toFixed(1)} · PM10: {c.pm10?.toFixed(1)}
                  </p>
                  <button
                    onClick={() => setSelected({ data: c, name: c.name })}
                    className="w-full py-1.5 rounded-lg border-none text-white font-bold text-xs cursor-pointer"
                    style={{ background: c.color }}
                  >
                    Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {clickResult && !clickLoading && (
            <CircleMarker
              center={[clickResult.lat, clickResult.lon]}
              radius={16}
              pathOptions={{
                color: clickResult.color, fillColor: clickResult.color,
                fillOpacity: 0.45, weight: 3, dashArray: "6 3",
              }}
              eventHandlers={{
                click: () => setSelected({
                  data: clickResult,
                  name: `${clickResult.lat.toFixed(3)}°N, ${clickResult.lon.toFixed(3)}°E`,
                }),
              }}
            >
              <Popup>
                <p className="font-bold" style={{ color: clickResult.color }}>
                  AQI: {clickResult.aqi} — {clickResult.label}
                </p>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>

        <div className="absolute bottom-4 left-3 z-[1000] bg-white/95 rounded-2xl px-3.5 py-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 mt-0">CPCB AQI (ML Model)</p>
          {AQI_SCALE.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: l.color }} />
              <span className="text-[10px] text-gray-700">{l.label}</span>
              <span className="text-[9px] text-gray-300 ml-auto pl-2">
                ≤{l.max === 9999 ? "500+" : l.max}
              </span>
            </div>
          ))}
          <p className="text-[9px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100 mb-0">
            👆 Click map for AQI
          </p>
        </div>

        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/92 rounded-full px-4 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center gap-2 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">
              ML Model: {loaded}/{CITIES.length}…
            </span>
          </div>
        )}

        {clickLoading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-500/92 rounded-full px-4 py-1.5 shadow-[0_2px_12px_rgba(99,102,241,0.27)] flex items-center gap-2 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            <span className="text-xs font-semibold text-white">Fetching from ML Model…</span>
          </div>
        )}

        {selected && (
          <DetailPanel
            data={selected.data}
            name={selected.name}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* City grid — Your Location card first, then all cities */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>

        {/* Your Location card — first column, first row */}
        {lat && lon && (
          userAqi ? (
            <div
             onClick={() => setSelected({ data: userAqi, name: locationName || "Your Location" })}
              className="bg-white rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 relative"
              style={{
                border: `2px solid ${selected?.name === "Your Location" ? userAqi.color : "#3b82f6"}`,
                boxShadow: `0 4px 14px ${userAqi.color}44`,
              }}
            >
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0 mb-0.5">📍 You</p>
              <p className="text-[11px] font-extrabold text-gray-700 mt-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                {locationName || "Your Location"}
              </p>
              <p className="text-[22px] font-black mt-0 mb-0.5 leading-none" style={{ color: userAqi.color }}>
                {userAqi.aqi}
              </p>
              <span
                className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                style={{ background: `${userAqi.color}22`, color: userAqi.text }}
              >
                {userAqi.label}
              </span>
            </div>
          ) : (
            <div className="bg-white rounded-xl px-3 py-2.5 flex flex-col items-center justify-center gap-1"
              style={{ border: "2px solid #e5e7eb", minHeight: 90 }}>
              <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-0">📍 You</p>
            </div>
          )
        )}

        {/* All city cards */}
        {cities.map((c) => {
          const isActive = selected?.data === c;
          return (
            <div
              key={c.id}
              onClick={() => setSelected({ data: c, name: c.name })}
              className="bg-white rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200"
              style={{
                border: `2px solid ${isActive ? c.color : "#f0f0f0"}`,
                boxShadow: isActive ? `0 4px 14px ${c.color}44` : "none",
              }}
            >
              <p className="text-[11px] font-extrabold text-gray-700 mt-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                {c.name}
              </p>
              <p className="text-[22px] font-black mt-0 mb-0.5 leading-none" style={{ color: c.color }}>
                {c.aqi}
              </p>
              <span
                className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                style={{ background: `${c.color}22`, color: c.text }}
              >
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapView;